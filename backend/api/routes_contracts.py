from fastapi import APIRouter, UploadFile, File, HTTPException
from models.contract import Contract
from services.clause_service import evaluate_contract
from services.parser_service import extract_text

router = APIRouter()

@router.post("/evaluate")
async def evaluate(contract: Contract):
    """
    Accepts a JSON Contract (id/title/content) and returns evaluation result.
    """
    result = evaluate_contract(contract)
    return result


@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    """
    Accepts a contract PDF upload, extracts text, evaluates it,
    and returns a small preview + analysis.
    """
    filename = file.filename or "uploaded"
    if not filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    text = await extract_text(file)

    # Build a Contract object (id/title optional)
    contract = Contract(id=None, title=filename, content=text)

    analysis = evaluate_contract(contract)
    return {
        "filename": filename,
        "extracted_text_preview": text[:1000],
        "analysis": analysis,
    }
