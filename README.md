# PDF to MCQ — Backend (Group 2)

FastAPI backend that handles PDF upload, text extraction, chunking,
embeddings + FAISS retrieval, runs the local Qwen LoRA model for MCQ
generation, validates the results, and stores everything
in a database for the frontend to consume.

## What to install

Just Python 3.10+ — everything else is `pip install`.

```bash
pip install -r requirements.txt
```

## AI Model

- **Base:** `Qwen/Qwen2.5-1.5B-Instruct`
- **Fine-tuning:** QLoRA / LoRA
- **Purpose:** Generate MCQs from study material extracted from uploaded PDFs
- **Artifact:** `models/mcq-qwen-final` (a LoRA adapter, not a standalone model)

Inference flow: PDF -> text extraction -> chunking -> Qwen + LoRA -> JSON
validation -> MCQs.

The adapter is loaded lazily once per process. CUDA uses FP16; CPU falls back
to FP32 and is significantly slower. The base model is downloaded from
Hugging Face at runtime and is not stored in this repository.

Configure the service in `.env`:

```text
MCQ_BASE_MODEL=Qwen/Qwen2.5-1.5B-Instruct
MCQ_MODEL_PATH=models/mcq-qwen-final
MCQ_MAX_NEW_TOKENS=350
MCQ_TEMPERATURE=0.7
MCQ_TOP_P=0.9
MCQ_MAX_RETRIES=1
```

Extract `mcq-qwen-final.zip` into the backend directory so that
`models/mcq-qwen-final/adapter_config.json` exists. Then install the
requirements, start the backend, upload a PDF with `/upload`, and call
`/generate-mcqs` with its returned `pdf_id` and `num_questions`.

## Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs (auto-generated): http://localhost:8000/docs
— useful for testing endpoints by hand and for the frontend team to
see exact request/response shapes.

## Folder structure

```
mcq-backend/
├── app/
│   ├── main.py                  <- FastAPI app, all endpoints
│   ├── database.py               <- SQLAlchemy models (SQLite)
│   ├── schemas.py                  <- Pydantic request/response models
│   └── services/
│       ├── pdf_service.py           <- PyMuPDF text extraction
│       ├── chunking_service.py       <- splits page text into chunks
│       ├── embedding_service.py       <- sentence-transformers embeddings
│       ├── vector_service.py           <- FAISS index build + search
│       ├── ai_client.py                 <- legacy concept-service client
│       ├── mcq_generator.py             <- local Qwen + LoRA inference
│       └── validation_service.py         <- validates AI output, dedup check
├── uploads/                     <- saved PDF files
├── vector_store/                 <- FAISS index files (one per PDF)
├── requirements.txt
└── .env
```

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/upload` | Upload a PDF, extract + chunk text, build FAISS index |
| POST | `/generate-concepts` | Get key concepts across all chunks of a PDF |
| POST | `/generate-mcqs` | Generate, validate, dedupe, and save MCQs |
| GET | `/questions/{id}` | Fetch a single question |
| POST | `/validate-question` | Re-run validation checks on a saved question |
| POST | `/regenerate-question` | Regenerate one question in place |

Full request/response shapes are in `app/schemas.py`, and live at
`/docs` once the server is running — that's what to hand the frontend
team as the contract.

## Design notes

- **Vector DB: FAISS** — local, in-memory, zero setup, free. One index
  file per PDF stored in `vector_store/`, keyed by `pdf_id`.
- **Embedding model:** `all-MiniLM-L6-v2` via `sentence-transformers` —
  small and fast, downloads automatically on first run (~80MB).
- **Chunking:** page-based, ~1200 chars per chunk with overlap, so every
  chunk stays attributable to a single page for source citations.
- **Validation:** structural checks (required fields, exactly one
  correct answer, no duplicate options) plus a simple word-overlap
  duplicate detector across generated questions.

## Next steps for integration

1. Get the AI team's actual `AI_SERVICE_URL` and confirm their JSON
   field names match `ai_client.py` exactly.
2. Test end-to-end: upload a real PDF notes file → `/generate-mcqs` →
   check the output in `/docs`.
3. Hand the frontend team the `/docs` link and the response shapes in
   `schemas.py`.
