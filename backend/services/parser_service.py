import fitz  # PyMuPDF

async def extract_text(file):
    """
    Extract text from an uploaded PDF file.
    """
    # ✅ Step 1: Read bytes from UploadFile
    file_bytes = await file.read()

    # ✅ Step 2: Open directly from bytes (no temp file)
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        # Fallback: write temp file if PyMuPDF fails
        with open("temp.pdf", "wb") as f:
            f.write(file_bytes)
        doc = fitz.open("temp.pdf")

    # ✅ Step 3: Extract text from all pages
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"

    doc.close()
    return text.strip()
