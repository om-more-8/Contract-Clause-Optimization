from models.contract import Contract
from typing import Dict, List

def evaluate_contract(contract: Contract) -> Dict:
    """
    Simple rule-based evaluator for now.
    Returns a dict with id/title/risk_score and risky_phrases.
    """
    content = (contract.content or "").lower()
    risky_phrases = [
        "terminate", "termination", "penalty", "liability",
        "indemnify", "governing law", "jurisdiction", "breach"
    ]
    found = [p for p in risky_phrases if p in content]

    # simple scoring: number found / total phrases -> normalized 0..1
    score = 0.0
    if risky_phrases:
        score = round(min(len(found) / len(risky_phrases), 1.0), 3)

    contract.risk_score = score

    return {
        "id": contract.id,
        "title": contract.title,
        "risk_score": contract.risk_score,
        "risky_phrases": found,
    }
