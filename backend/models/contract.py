from pydantic import BaseModel
from typing import Optional

class Contract(BaseModel):
    name: Optional[str] = None
    text: str
