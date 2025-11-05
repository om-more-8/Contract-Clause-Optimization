# services/parser_service.py
import os

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

async def extract_text_from_bytes(file_bytes: bytes) -> str:
    """
    Accepts bytes of a PDF and returns extracted text.
    """
    if fitz:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full = []
        for page in doc:
            full.append(page.get_text())
        doc.close()
        return "\n".join(full).strip()
    else:
        # fallback: decode bytes as utf-8 and return (useful for text uploads)
        try:
            return file_bytes.decode("utf-8")
        except Exception:
            return ""
