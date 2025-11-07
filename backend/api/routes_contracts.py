from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from services.clause_service import evaluate_contract
from services.parser_service import extract_text
from database.supabase_client import supabase

router = APIRouter()

# --- Text Evaluation ---
@router.post("/evaluate")
async def evaluate(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    text = payload.get("text") or payload.get("content") or payload.get("contract_text")
    if not text:
        raise HTTPException(status_code=422, detail="Missing 'text' or 'content' field")

    result = evaluate_contract(text)

    # ✅ Insert into Supabase
    try:
        if supabase:
            insert_payload = {
                "name": payload.get("name", "Manual Evaluation"),
                "text": text,
                "risk_score": result.get("average_risk_score"),
            }
            supabase.table("contracts").insert(insert_payload).execute()
    except Exception as e:
        print("⚠️ Supabase insert failed (evaluate):", e)

    return result


# --- PDF Upload & Evaluate ---
@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    filename = file.filename or "uploaded"
    if not filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    text = await extract_text(file)
    result = evaluate_contract(text)

    # ✅ Insert into Supabase
    try:
        if supabase:
            insert_payload = {
                "name": filename,
                "text": text,
                "risk_score": result.get("average_risk_score"),
            }
            supabase.table("contracts").insert(insert_payload).execute()
    except Exception as e:
        print("⚠️ Supabase insert failed (upload):", e)

    return {
        "filename": filename,
        "extracted_text_preview": text[:500],
        "analysis": result,
    }
