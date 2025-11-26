from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from services.clause_service import evaluate_contract
from services.parser_service import extract_text
from database.supabase_client import supabase  # may be None if not configured
from datetime import datetime
import json

router = APIRouter()

def _summarize_details(details):
    """
    details: list of clause dicts with 'risk_level' and 'matched_category'
    Returns:
      - counts: risk level summary
      - categories: category->count summary
    """
    counts = {"Low": 0, "Medium": 0, "High": 0}
    categories = {}
    for d in details or []:
        # Risk level count
        r = d.get("risk_level", "Medium")
        counts[r] = counts.get(r, 0) + 1

        # Category count
        cat = d.get("matched_category") or "Uncategorized"
        categories[cat] = categories.get(cat, 0) + 1

    return counts, categories


# --------------------------------------------------------
#  TEXT EVALUATION
# --------------------------------------------------------
@router.post("/evaluate")
async def evaluate(request: Request):
    """
    Accepts JSON payload containing:
        { "text": "contract content…" }

    Evaluates → stores in Supabase → returns evaluation JSON.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Accept flexible field names
    text = None

    if isinstance(payload, dict):
        text = (
            payload.get("text")
            or payload.get("content")
            or payload.get("contract_text")
            or payload.get("body")
        )

    elif isinstance(payload, str):
        text = payload

    if not text:
        raise HTTPException(status_code=422, detail="Missing 'text' or 'content' field")

    # Run evaluation (returns dict)
    result = evaluate_contract(text)

    # Extract details for DB summary
    details = result.get("details") or []
    counts, categories_summary = _summarize_details(details)

    # --------------------------------------------------------
    #  SAFE SUPABASE INSERT (NO NULL NAME)
    # --------------------------------------------------------
    try:
        if supabase:
            # If payload has no "name", fallback to "Manual Evaluation"
            name_value = (
                payload.get("name")
                if isinstance(payload, dict) and payload.get("name")
                else "Manual Evaluation"
            )

            insert_payload = {
                "name": name_value,         # never null now
                "filename": None,
                "text": text,
                "risk_score": result.get("average_risk_score"),
                "clause_count": len(details),
                "high_count": counts.get("High", 0),
                "medium_count": counts.get("Medium", 0),
                "low_count": counts.get("Low", 0),
                "categories_summary": json.dumps(categories_summary),
                "details": json.dumps(details),
                "created_at": datetime.utcnow().isoformat()
            }

            # Clean nulls for optional columns
            insert_payload = {k: v for k, v in insert_payload.items() if v is not None}

            supabase.table("contracts").insert(insert_payload).execute()

    except Exception as e:
        print("⚠️ Supabase insert failed (evaluate):", e)

    return result



# --------------------------------------------------------
#  PDF UPLOAD + EVALUATION
# --------------------------------------------------------
@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    """
    Accepts PDF/DOC, extracts text, evaluates, stores result in Supabase.
    """

    filename = file.filename or "uploaded"

    if not filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Extract text from PDF
    text = await extract_text(file)

    # Evaluate
    result = evaluate_contract(text)

    # Summaries for DB
    details = result.get("details") or []
    counts, categories_summary = _summarize_details(details)

    # Insert into Supabase
    try:
        if supabase:

            insert_payload = {
                "name": filename,        # documents always have a filename
                "filename": filename,
                "text": text,
                "risk_score": result.get("average_risk_score"),
                "clause_count": len(details),
                "high_count": counts.get("High", 0),
                "medium_count": counts.get("Medium", 0),
                "low_count": counts.get("Low", 0),
                "categories_summary": json.dumps(categories_summary),
                "details": json.dumps(details),
                "created_at": datetime.utcnow().isoformat()
            }

            insert_payload = {k: v for k, v in insert_payload.items() if v is not None}

            supabase.table("contracts").insert(insert_payload).execute()

    except Exception as e:
        print("⚠️ Supabase insert failed (upload):", e)

    return {
        "filename": filename,
        "extracted_text_preview": text[:500],
        "analysis": result,
    }
