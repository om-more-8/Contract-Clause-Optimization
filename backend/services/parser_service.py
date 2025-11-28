# backend/services/parser_service.py
import fitz  # PyMuPDF

async def extract_text(file_bytes: bytes):
    try:
        # Directly open from memory
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except:
        return ""

    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text
