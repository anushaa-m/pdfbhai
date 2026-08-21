import fitz  # PyMuPDF


def extract_text_by_page(pdf_path: str) -> list[dict]:
    """
    Returns a list of {"page": int, "text": str} for each page in the PDF.
    Page numbers are 1-indexed to match how humans reference PDF pages.
    """
    doc = fitz.open(pdf_path)
    pages = []

    for i, page in enumerate(doc):
        text = page.get_text("text")
        text = clean_text(text)
        if text.strip():
            pages.append({"page": i + 1, "text": text})

    doc.close()
    return pages


def clean_text(text: str) -> str:
    """
    Basic cleanup: collapse excessive whitespace/newlines.
    Extend this if your PDFs have consistent headers/footers to strip.
    """
    lines = [line.strip() for line in text.split("\n")]
    lines = [line for line in lines if line]
    return "\n".join(lines)
