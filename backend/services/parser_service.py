import fitz  # PyMuPDF

async def extract_text(file) -> str:
    """
    Extract text from an uploaded PDF file (UploadFile).
    We open the PDF from bytes to avoid writing temp files.
    """
    content = await file.read()  # bytes

    # Try opening from bytes (recommended)
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception:
        # fallback: write to temp.pdf (rare)
        with open("temp.pdf", "wb") as f:
            f.write(content)
        doc = fitz.open("temp.pdf")

    text_pages = []
    for page in doc:
        text_pages.append(page.get_text())
    doc.close()
    return "\n".join(text_pages).strip()
