import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import init_db, get_db, PDFDocument, PDFChunk, Question
from app.schemas import (
    UploadResponse,
    GenerateConceptsRequest,
    GenerateConceptsResponse,
    ConceptOut,
    GenerateMCQsRequest,
    GenerateMCQsResponse,
    MCQOut,
    MCQOptions,
    QuestionResponse,
    ValidateQuestionRequest,
    ValidateQuestionResponse,
    RegenerateQuestionRequest,
    RegenerateQuestionResponse,
)
from app.services.pdf_service import extract_text_by_page
from app.services.chunking_service import chunk_pages
from app.services import vector_service, ai_client, validation_service
from app.services.mcq_generator import mcq_generator

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="PDF to MCQ Backend")

# Allow the frontend (likely running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before a real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------------------------------------------------------------------------
# 1. UPLOAD
# ---------------------------------------------------------------------------

@app.post("/upload", response_model=UploadResponse)
def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save the file to disk
    pdf_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{pdf_id}.pdf")
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract + chunk text
    pages = extract_text_by_page(save_path)
    if not pages:
        raise HTTPException(status_code=422, detail="Could not extract any text from this PDF")

    chunks = chunk_pages(pages)

    # Save PDF + chunk records
    pdf_doc = PDFDocument(id=pdf_id, filename=file.filename, num_pages=len(pages))
    db.add(pdf_doc)
    db.flush()

    chunk_texts = []
    for i, chunk in enumerate(chunks):
        db_chunk = PDFChunk(
            id=chunk["chunk_id"],
            pdf_id=pdf_id,
            page=chunk["page"],
            text=chunk["text"],
            vector_index=i,
        )
        db.add(db_chunk)
        chunk_texts.append(chunk["text"])

    db.commit()

    # Build the FAISS index for this PDF (order must match vector_index above)
    vector_service.build_index(pdf_id, chunk_texts)

    return UploadResponse(
        pdf_id=pdf_id,
        filename=file.filename,
        num_pages=len(pages),
        num_chunks=len(chunks),
    )


# ---------------------------------------------------------------------------
# 2. GENERATE CONCEPTS  (backend calls the AI team's service)
# ---------------------------------------------------------------------------

@app.post("/generate-concepts", response_model=GenerateConceptsResponse)
def generate_concepts(req: GenerateConceptsRequest, db: Session = Depends(get_db)):
    chunks = db.query(PDFChunk).filter(PDFChunk.pdf_id == req.pdf_id).all()
    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for this pdf_id. Did you upload it?")

    all_concepts: list[ConceptOut] = []
    for chunk in chunks:
        raw_concepts = ai_client.call_generate_concepts(chunk.text)
        for c in raw_concepts:
            all_concepts.append(ConceptOut(
                name=c["name"],
                importance=c["importance"],
                chunk_id=chunk.id,
                page=chunk.page,
            ))

    return GenerateConceptsResponse(pdf_id=req.pdf_id, concepts=all_concepts)


# ---------------------------------------------------------------------------
# 3. GENERATE MCQs  (chunks -> local Qwen + LoRA -> validate -> save)
# ---------------------------------------------------------------------------

@app.post("/generate-mcqs", response_model=GenerateMCQsResponse)
def generate_mcqs(req: GenerateMCQsRequest, db: Session = Depends(get_db)):
    chunks = db.query(PDFChunk).filter(PDFChunk.pdf_id == req.pdf_id).all()
    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for this pdf_id. Did you upload it?")

    selected = [chunks[index % len(chunks)] for index in range(req.num_questions)]

    existing_texts = [q.question_text for q in db.query(Question).filter(Question.pdf_id == req.pdf_id).all()]

    saved_questions: list[MCQOut] = []

    for i, chunk in enumerate(selected):

        if req.difficulty_mix:
            difficulty = req.difficulty_mix[i % len(req.difficulty_mix)]
        else:
            difficulty = "medium"

        try:
            generated = mcq_generator.generate(chunk.text)
        except (FileNotFoundError, ImportError, ValueError, RuntimeError) as exc:
            raise HTTPException(status_code=502, detail=f"MCQ model failed: {exc}") from exc
        raw_mcq = {
            **generated,
            "answer": generated["correct_answer"],
            "difficulty": difficulty,
            "concept": "PDF study material",
            "explanation": "",
        }

        is_valid, issues = validation_service.validate_mcq(raw_mcq)
        if not is_valid:
            print(f"[generate_mcqs] Rejected MCQ: {issues}")
            continue

        if validation_service.is_duplicate_question(raw_mcq["question"], existing_texts):
            print(f"[generate_mcqs] Skipped duplicate: {raw_mcq['question'][:60]}...")
            continue

        # Save to DB
        q_id = str(uuid.uuid4())
        db_question = Question(
            id=q_id,
            pdf_id=req.pdf_id,
            source_chunk=chunk.id,
            concept=raw_mcq["concept"],
            question_text=raw_mcq["question"],
            option_a=raw_mcq["options"]["A"],
            option_b=raw_mcq["options"]["B"],
            option_c=raw_mcq["options"]["C"],
            option_d=raw_mcq["options"]["D"],
            answer=raw_mcq["answer"],
            difficulty=raw_mcq["difficulty"],
            explanation=raw_mcq["explanation"],
            source_pages=str(chunk.page),
        )
        db.add(db_question)
        existing_texts.append(raw_mcq["question"])

        saved_questions.append(MCQOut(
            id=q_id,
            question=raw_mcq["question"],
            options=MCQOptions(**raw_mcq["options"]),
            answer=raw_mcq["answer"],
            difficulty=raw_mcq["difficulty"],
            concept=raw_mcq["concept"],
            explanation=raw_mcq["explanation"],
            source_pages=[chunk.page],
            source_chunk=chunk.id,
        ))

    db.commit()

    return GenerateMCQsResponse(pdf_id=req.pdf_id, questions=saved_questions)


# ---------------------------------------------------------------------------
# 4. GET a single question
# ---------------------------------------------------------------------------

@app.get("/questions/{question_id}", response_model=QuestionResponse)
def get_question(question_id: str, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    return QuestionResponse(question=_question_to_mcqout(q))


# ---------------------------------------------------------------------------
# 5. VALIDATE an existing question (re-run checks, e.g. for a review UI)
# ---------------------------------------------------------------------------

@app.post("/validate-question", response_model=ValidateQuestionResponse)
def validate_question(req: ValidateQuestionRequest, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    mcq_dict = {
        "question": q.question_text,
        "options": {"A": q.option_a, "B": q.option_b, "C": q.option_c, "D": q.option_d},
        "answer": q.answer,
        "difficulty": q.difficulty,
        "concept": q.concept,
        "explanation": q.explanation,
    }
    is_valid, issues = validation_service.validate_mcq(mcq_dict)

    return ValidateQuestionResponse(question_id=req.question_id, is_valid=is_valid, issues=issues)


# ---------------------------------------------------------------------------
# 6. REGENERATE a question (e.g. user didn't like it, or it failed validation)
# ---------------------------------------------------------------------------

@app.post("/regenerate-question", response_model=RegenerateQuestionResponse)
def regenerate_question(req: RegenerateQuestionRequest, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    chunk = db.query(PDFChunk).filter(PDFChunk.id == q.source_chunk).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="Source chunk no longer exists")

    try:
        generated = mcq_generator.generate(chunk.text)
    except (FileNotFoundError, ImportError, ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=f"MCQ model failed: {exc}") from exc
    raw_mcq = {
        **generated,
        "answer": generated["correct_answer"],
        "difficulty": q.difficulty,
        "concept": q.concept,
        "explanation": "",
    }

    is_valid, issues = validation_service.validate_mcq(raw_mcq)
    if not is_valid:
        raise HTTPException(status_code=422, detail=f"Regenerated MCQ failed validation: {issues}")

    # Overwrite the existing row in place
    q.question_text = raw_mcq["question"]
    q.option_a = raw_mcq["options"]["A"]
    q.option_b = raw_mcq["options"]["B"]
    q.option_c = raw_mcq["options"]["C"]
    q.option_d = raw_mcq["options"]["D"]
    q.answer = raw_mcq["answer"]
    q.explanation = raw_mcq["explanation"]
    db.commit()

    return RegenerateQuestionResponse(question=_question_to_mcqout(q))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _question_to_mcqout(q: Question) -> MCQOut:
    return MCQOut(
        id=q.id,
        question=q.question_text,
        options=MCQOptions(A=q.option_a, B=q.option_b, C=q.option_c, D=q.option_d),
        answer=q.answer,
        difficulty=q.difficulty,
        concept=q.concept,
        explanation=q.explanation,
        source_pages=[int(p) for p in q.source_pages.split(",") if p],
        source_chunk=q.source_chunk,
    )
