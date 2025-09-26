import fitz  # PyMuPDF

async def extract_text(file):
    content = await file.read()
    with open("temp.pdf", "wb") as f:
        f.write(content)

    doc = fitz.open("temp.pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text
