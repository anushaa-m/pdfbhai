import os
import faiss
import numpy as np
from app.services.embedding_service import EMBEDDING_DIM, embed_texts

VECTOR_STORE_DIR = os.getenv("VECTOR_STORE_DIR", "./vector_store")
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# In-memory cache of loaded indexes: {pdf_id: faiss.Index}
_index_cache: dict[str, faiss.Index] = {}


def _index_path(pdf_id: str) -> str:
    return os.path.join(VECTOR_STORE_DIR, f"{pdf_id}.index")


def build_index(pdf_id: str, chunk_texts: list[str]) -> None:
    """
    Embeds all chunks for a PDF and builds a fresh FAISS index for it.
    Call once, right after chunking a newly uploaded PDF.
    """
    embeddings = embed_texts(chunk_texts)  # (N, 384)
    index = faiss.IndexFlatL2(EMBEDDING_DIM)
    index.add(embeddings)

    faiss.write_index(index, _index_path(pdf_id))
    _index_cache[pdf_id] = index


def _load_index(pdf_id: str) -> faiss.Index:
    if pdf_id in _index_cache:
        return _index_cache[pdf_id]

    path = _index_path(pdf_id)
    if not os.path.exists(path):
        raise FileNotFoundError(f"No vector index found for pdf_id={pdf_id}")

    index = faiss.read_index(path)
    _index_cache[pdf_id] = index
    return index


def search(pdf_id: str, query: str, top_k: int = 3) -> list[int]:
    """
    Returns the positions (row indices) of the top_k most relevant chunks
    for the given query, within that PDF's chunk list.
    Use these indices to look up the matching PDFChunk rows in the DB
    (they were stored in the same order as chunk_texts passed to build_index).
    """
    index = _load_index(pdf_id)
    query_vec = embed_texts([query])
    distances, indices = index.search(query_vec, top_k)
    return [int(i) for i in indices[0] if i != -1]
