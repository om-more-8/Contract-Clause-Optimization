from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(payload: LoginRequest):
    # placeholder: integrate real auth (Supabase) later
    return {"message": f"User {payload.username} logged in successfully"}
