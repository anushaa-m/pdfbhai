from pydantic import BaseModel
from typing import List, Optional, Literal


# ---------- Upload ----------

class UploadResponse(BaseModel):
    pdf_id: str
    filename: str
    num_pages: int
    num_chunks: int


# ---------- Concepts (from AI team) ----------

class ConceptOut(BaseModel):
    name: str
    importance: int
    chunk_id: str
    page: int


class GenerateConceptsRequest(BaseModel):
    pdf_id: str


class GenerateConceptsResponse(BaseModel):
    pdf_id: str
    concepts: List[ConceptOut]


# ---------- MCQ generation ----------

class GenerateMCQsRequest(BaseModel):
    pdf_id: str
    num_questions: int = 10
    difficulty_mix: Optional[List[Literal["easy", "medium", "hard"]]] = None
    # if None, mix is chosen automatically from concept importance


class MCQOptions(BaseModel):
    A: str
    B: str
    C: str
    D: str


class MCQOut(BaseModel):
    id: str
    question: str
    options: MCQOptions
    answer: Literal["A", "B", "C", "D"]
    difficulty: Literal["easy", "medium", "hard"]
    concept: str
    explanation: str
    source_pages: List[int]
    source_chunk: str


class GenerateMCQsResponse(BaseModel):
    pdf_id: str
    questions: List[MCQOut]


# ---------- Single question lookup ----------

class QuestionResponse(BaseModel):
    question: MCQOut


# ---------- Validation / regeneration ----------

class ValidateQuestionRequest(BaseModel):
    question_id: str


class ValidateQuestionResponse(BaseModel):
    question_id: str
    is_valid: bool
    issues: List[str] = []


class RegenerateQuestionRequest(BaseModel):
    question_id: str


class RegenerateQuestionResponse(BaseModel):
    question: MCQOut
