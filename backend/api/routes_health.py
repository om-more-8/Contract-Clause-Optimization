# backend/api/routes_health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/check")
async def health_check():
    return {"status": "ok", "message": "Service is running 🚀"}
