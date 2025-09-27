from pydantic import BaseModel
from typing import Optional

class Contract(BaseModel):
    id: int
    title: str
    content: str
    risk_score: Optional[float] = None
