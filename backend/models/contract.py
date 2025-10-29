from pydantic import BaseModel
from typing import Optional

class Contract(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    name: str
    text:str
    risk_score: Optional[float] = None
