import uuid


def chunk_pages(pages: list[dict], max_chars: int = 1200, overlap: int = 150) -> list[dict]:
    """
    Splits page-level text into chunks suitable for embedding + MCQ generation.
    Each chunk stays within a single page for clean source-page attribution
    (simplest approach for a hackathon; merge across pages later if chunks
    end up too small/fragmented for good questions).

    Returns: [{"chunk_id": str, "page": int, "text": str}]
    """
    chunks = []

    for page in pages:
        text = page["text"]
        page_num = page["page"]

        if len(text) <= max_chars:
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "page": page_num,
                "text": text,
            })
            continue

        start = 0
        while start < len(text):
            end = start + max_chars
            chunk_text = text[start:end]
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "page": page_num,
                "text": chunk_text,
            })
            start = end - overlap  # overlap keeps context continuity between chunks

    return chunks
