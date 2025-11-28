# backend/api/routes_contracts.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from services.parser_service import extract_text
from services.clause_service import evaluate_contract
from database.supabase_client import supabase
import json
import jwt

router = APIRouter()

def extract_user_id_from_bearer(request: Request):
    """
    Try to decode Bearer token (JWT) from Authorization header and return 'sub' (user id).
    This is best-effort and does no signature verification (server uses service role for inserts).
    If you prefer not to decode tokens on the server, send user_id in the JSON payload (key: user_id).
    """
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        # supabase uses 'sub' as user id in JWT
        return payload.get("sub")
    except Exception:
        return None

@router.post("/evaluate")
async def evaluate(request: Request):
    """
    Accepts flexible payloads. Prefer keys: text, content, contract_text.
    Returns evaluation result from clause_service.evaluate_contract(...)
    Also attempts to insert a summary row into Supabase (non-blocking).
    """
    try:
        payload = await request.json()
    except Exception:
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

    # evaluate
    try:
        result = evaluate_contract(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")

    # Normalize / enrich result values if missing
    clause_count = result.get("clause_count", len(result.get("details", [])))
    categories_summary = result.get("categories_summary", {})
    low_count = result.get("low_count", 0)
    medium_count = result.get("medium_count", 0)
    high_count = result.get("high_count", 0)
    level = result.get("risk_level") or None
    avg_score = result.get("average_risk_score")

    # Try to insert into Supabase if available (non-blocking)
    try:
        if supabase:
            # determine a name fallback: payload.name -> payload.filename -> 'manual evaluation'
            name_val = None
            if isinstance(payload, dict):
                name_val = payload.get("name") or payload.get("filename")
            if not name_val:
                name_val = "manual evaluation"

            # try to extract user id from bearer token or payload
            user_id = payload.get("user_id") if isinstance(payload, dict) else None
            if not user_id:
                user_id = extract_user_id_from_bearer(request)

            insert_payload = {
                "name": name_val,
                "text": text,
                "risk_score": avg_score,
                "level": level,
                "categories_summary": json.dumps(categories_summary),
                "details": json.dumps(result.get("details", [])),
                
                # user_id may be null if we couldn't extract it
                "user_id": user_id,
            }

            # Remove None values (but keep empty dicts as JSON strings if present)
            insert_payload = {k: v for k, v in insert_payload.items() if v is not None}

            supabase.table("contracts").insert(insert_payload).execute()
    except Exception as e:
        # log but do not fail the request
        print("⚠️ Supabase insert failed (evaluate):", e)

    return result


@router.post("/upload")
async def upload_contract(request: Request, file: UploadFile = File(...)):
    """
    Accept PDF/DOCX file, extract text, evaluate, save to DB.
    """
    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(400, "Only PDF or DOCX files allowed")

    # Read file + extract text
    file_bytes = await file.read()
    text = await extract_text(file_bytes)

    if not text:
        raise HTTPException(500, "Failed to extract text from file")

    # Evaluate text via model
    result = evaluate_contract(text)

    # Determine user_id
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header:
        try:
            token = auth_header.split()[1]
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get("sub")
        except Exception:
            pass

    # Insert into Supabase
    try:
        if supabase:
            supabase.table("contracts").insert({
                "name": file.filename,
                "text": text,
                "risk_score": result.get("average_risk_score"),
                "level": result.get("risk_level"),
                "details": json.dumps(result.get("details", [])),
                "categories_summary": json.dumps(result.get("categories_summary", {})),
                "user_id": user_id
            }).execute()
    except Exception as e:
        print("⚠️ Supabase insert (upload) failed:", e)

    return {
        "filename": file.filename,
        "text_preview": text[:1000],
        "analysis": result
    }
