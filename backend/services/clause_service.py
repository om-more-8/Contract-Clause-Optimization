# backend/services/clause_service.py

from typing import Dict, List
import numpy as np

from sentence_transformers import SentenceTransformer, util


# =========================
# Model & Category Setup
# =========================

MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

CATEGORIES = [
    "Intellectual Property",
    "Liability",
    "Payment",
    "Termination",
    "Confidentiality",
    "Governing Law",
    "General / Miscellaneous",
]

CATEGORY_RISK_MAP = {
    "Intellectual Property": "Medium",
    "Liability": "High",
    "Payment": "Medium",
    "Termination": "Medium",
    "Confidentiality": "High",
    "Governing Law": "Low",
    "General / Miscellaneous": "Low",
}

SUGGESTIONS = {
    "Intellectual Property": "Clearly allocate background vs foreground IP and license scope.",
    "Liability": "Limit liability to direct damages only and cap total liability to an agreed threshold.",
    "Payment": "Define payment schedule, invoicing process, penalties, and dispute resolution clearly.",
    "Termination": "Clarify termination triggers, notice period, and post-termination obligations.",
    "Confidentiality": "Specify scope, duration, and exceptions to confidentiality obligations.",
    "Governing Law": "Explicitly define governing law and jurisdiction.",
    "General / Miscellaneous": "Revise for clarity and remove ambiguity or redundant language.",
}

ISSUES = {
    "Intellectual Property": "Unclear IP ownership",
    "Liability": "Unlimited or unclear liability exposure",
    "Payment": "Vague payment terms",
    "Termination": "Ambiguous termination conditions",
    "Confidentiality": "Weak confidentiality protections",
    "Governing Law": "Jurisdiction not clearly specified",
    "General / Miscellaneous": "Clause may benefit from improved clarity",
}


# =========================
# Helper Functions
# =========================

def split_into_clauses(text: str) -> List[str]:
    """
    Splits contract text into clauses/sentences.
    """
    if not text:
        return []

    parts = [p.strip() for p in text.replace("\n", " ").split(".") if len(p.strip()) > 25]
    return parts


def normalize_risk(risk: str) -> str:
    """
    Ensures risk level is always High / Medium / Low
    """
    if risk in ("High", "Medium", "Low"):
        return risk
    return "Low"


def compute_overall_risk(risk_counts: dict) -> str:
    high = risk_counts.get("High", 0)
    medium = risk_counts.get("Medium", 0)
    low = risk_counts.get("Low", 0)

    total = high + medium + low
    if total == 0:
        return "Unknown"

    score = (3 * high + 2 * medium + 1 * low) / total

    if score >= 2.3:
        return "High"
    elif score >= 1.6:
        return "Medium"
    else:
        return "Low"



# =========================
# Core Clause Analysis
# =========================

def analyze_clause(clause: str, category_embeddings, clause_embedding) -> Dict:
    """
    Analyze a single clause and return classification & risk.
    """

    similarities = util.cos_sim(clause_embedding, category_embeddings)[0]
    best_idx = int(torch_argmax(similarities))
    similarity_score = float(similarities[best_idx])

    matched_category = CATEGORIES[best_idx]
    risk_level = normalize_risk(CATEGORY_RISK_MAP.get(matched_category, "Low"))

    return {
        "sentence": clause,
        "matched_category": matched_category,
        "cluster_id": best_idx,
        "similarity_score": round(similarity_score, 3),
        "risk_level": risk_level,
        "issue": ISSUES.get(matched_category, ""),
        "suggested_optimization": SUGGESTIONS.get(matched_category, ""),
    }


def torch_argmax(tensor):
    """
    Safe argmax without torch import issues.
    """
    return int(np.argmax(tensor.cpu().numpy()))


# =========================
# Main Public API Function
# =========================

def evaluate_contract(contract_text: str) -> Dict:
    """
    MAIN ENTRY POINT
    Used by both text input & file input.
    """

    clauses = split_into_clauses(contract_text)

    if not clauses:
        return {
            "overall_risk": "Unknown",
            "risk_counts": {"High": 0, "Medium": 0, "Low": 0},
            "clause_count": 0,
            "details": [],
        }

    clause_embeddings = model.encode(
        clauses,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    category_embeddings = model.encode(
        CATEGORIES,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    details = []
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}

    for idx, clause in enumerate(clauses):
        result = analyze_clause(
            clause=clause,
            category_embeddings=category_embeddings,
            clause_embedding=clause_embeddings[idx],
        )

        risk = normalize_risk(result["risk_level"])
        risk_counts[risk] += 1
        details.append(result)

    overall_risk = compute_overall_risk(risk_counts)        

    return {   
        "details": details, 
        "risk_level": overall_risk,    
        "overall_risk": overall_risk,
        "risk_counts": risk_counts,
        "clause_count": len(details),
        
    }
