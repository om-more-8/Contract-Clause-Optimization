from pydantic import BaseModel
from typing import Optional

class Contract(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    filename: str
    text:str
    risk_score: Optional[float] = None
