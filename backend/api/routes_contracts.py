from fastapi import APIRouter, UploadFile, File
from models.contract import Contract
from services.clause_service import evaluate_contract
from services.parser_service import extract_text
from database.supabase_client import supabase

router = APIRouter()

# ✅ 1. Evaluate a contract
@router.post("/evaluate")
def evaluate(contract: Contract):
    """
    Takes a contract and returns evaluated risk score.
    """
    result = evaluate_contract(contract)
    return result

# ✅ 2. Upload and extract text from a PDF
@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    """
    Accepts a PDF file and extracts text content.
    """
    text = await extract_text(file)
    return {"filename": file.filename, "extracted_text": text[:500]}  # just preview

# ✅ 3. List all contracts
@router.get("/list")
def list_contracts():
    """
    Fetches all contracts from Supabase.
    """
    response = supabase.table("contracts").select("*").execute()
    data = response.data
    return {"contracts": data, "count": len(data) if data else 0}

# ✅ 4. Get a contract by ID
@router.get("/{contract_id}")
def get_contract(contract_id: int):
    """
    Fetches a single contract by ID.
    """
    response = supabase.table("contracts").select("*").eq("id", contract_id).execute()
    data = response.data
    if not data:
        return {"error": "Contract not found"}
    return data[0]
