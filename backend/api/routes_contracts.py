# backend/api/routes_contracts.py
from fastapi import APIRouter

router = APIRouter()

# Example endpoint: Upload a contract
@router.post("/upload")
async def upload_contract(file: str):
    # For now, just return a dummy response
    return {"message": f"Contract '{file}' uploaded successfully"}
