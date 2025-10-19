import fitz  # PyMuPDF
from docx import Document

async def extract_text(file):
    """
    Extract text from uploaded PDF or DOCX files.
    """
    content = await file.read()
    filename = file.filename.lower()

    # --- PDF handling ---
    if filename.endswith(".pdf"):
        try:
            doc = fitz.open(stream=content, filetype="pdf")
        except Exception:
            with open("temp.pdf", "wb") as f:
                f.write(content)
            doc = fitz.open("temp.pdf")

        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text.strip()

    # --- DOCX handling ---
    elif filename.endswith(".docx"):
        with open("temp.docx", "wb") as f:
            f.write(content)
        doc = Document("temp.docx")
        return "\n".join(p.text for p in doc.paragraphs).strip()

    else:
        raise ValueError("Unsupported file type")
