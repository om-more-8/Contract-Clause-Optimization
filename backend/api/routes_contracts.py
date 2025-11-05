from fastapi import APIRouter, Request, HTTPException
from services.clause_service import evaluate_contract
from database.supabase_client import supabase  # may be None if not configured

router = APIRouter()

@router.post("/evaluate")
async def evaluate(request: Request):
    """
    Accepts flexible payloads. Prefer keys: text, content, contract_text.
    Returns evaluation result from clause_service.evaluate_contract(...)
    """
    try:
        payload = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Resolve text from several possible keys
    text = None
    if isinstance(payload, dict):
        for key in ("text", "content", "contract_text", "body"):
            if key in payload and payload[key]:
                if isinstance(payload[key], dict) and "text" in payload[key]:
                    text = payload[key]["text"]
                else:
                    text = payload[key]
                break
    elif isinstance(payload, str):
        text = payload

    if not text:
        raise HTTPException(status_code=422, detail="Request must include contract text under 'text'/'content'/'contract_text'")

    try:
        result = evaluate_contract(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")

    # Try to insert into Supabase if available (non-blocking)
    try:
        if supabase:
            insert_payload = {
                "name": payload.get("name") if isinstance(payload, dict) else None,
                "text": text,
                "risk_score": result.get("average_risk_score")
            }
            # Remove None values
            insert_payload = {k:v for k,v in insert_payload.items() if v is not None}
            supabase.table("contracts").insert(insert_payload).execute()
    except Exception as e:
        # log but do not fail the request
        print("⚠️ Supabase insert failed:", e)

    return result


@router.post("/upload")
async def upload_contract(file: bytes):
    # placeholder if you want to implement file uploads via UploadFile
    return {"message": "upload endpoint placeholder"}
