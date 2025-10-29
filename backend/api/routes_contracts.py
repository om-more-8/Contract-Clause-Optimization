from fastapi import APIRouter
from models.contract import Contract
from services.clause_service import evaluate_contract
from database.supabase_client import supabase

router = APIRouter()

@router.post("/evaluate")
def evaluate(contract: Contract):
    """
    Takes a contract and returns evaluated risk score.
    """
    result = evaluate_contract(contract)
    
    # Save to Supabase
    supabase.table("contracts").insert({
        "name": contract.name if hasattr(contract, "name") else "Untitled Contract",
        "text": contract.text,
        "risk_score": result["average_risk_score"]
    }).execute()

    return {
        "risk_score": result["average_risk_score"],
        "details": result["details"]
    }
