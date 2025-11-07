# services/clause_service.py
import json
import os

# Try to import sentence-transformers (fast if installed). If not, fallback.
MODEL_AVAILABLE = True
try:
    from sentence_transformers import SentenceTransformer, util
    model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    MODEL_AVAILABLE = False
    model = None
    util = None

# load clauses.json
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/clauses.json")
try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        reference_clauses = json.load(f)
except Exception:
    # default simple dataset
    reference_clauses = [
        {"clause": "confidentiality", "category": "Confidentiality", "risk_level": "Medium"},
        {"clause": "termination", "category": "Termination", "risk_level": "Medium"},
        {"clause": "payment", "category": "Payment", "risk_level": "Low"},
        {"clause": "liability", "category": "Liability", "risk_level": "High"}
    ]

def _get_text_from_input(contract_or_text):
    if contract_or_text is None:
        return ""
    if isinstance(contract_or_text, str):
        return contract_or_text
    if isinstance(contract_or_text, dict):
        for key in ("text", "content", "contract_text"):
            if key in contract_or_text and contract_or_text[key]:
                return contract_or_text[key]
    if hasattr(contract_or_text, "text"):
        return getattr(contract_or_text, "text")
    if hasattr(contract_or_text, "content"):
        return getattr(contract_or_text, "content")
    return str(contract_or_text)

def evaluate_contract(contract_or_text):
    """
    Accepts a string (contract text) or a Pydantic object/dict containing text.
    Returns:
      {
        "average_risk_score": float,
        "details": [ { sentence, matched_category, risk_level, similarity_score }, ... ]
      }
    """

    text = _get_text_from_input(contract_or_text)
    # basic sentence splitting
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 8]
    if not sentences and text.strip():
        sentences = [text.strip()]

    matched_clauses = []
    total_risk_value = 0

    if MODEL_AVAILABLE:
        # encode once
        input_embeddings = model.encode(sentences, convert_to_tensor=True)
        reference_texts = [r.get("clause", "") for r in reference_clauses]
        reference_embeddings = model.encode(reference_texts, convert_to_tensor=True)

        for i, sentence in enumerate(sentences):
            cos_scores = util.cos_sim(input_embeddings[i], reference_embeddings).cpu().numpy().flatten()
            best_idx = int(cos_scores.argmax())
            best_score = float(cos_scores[best_idx])
            matched = reference_clauses[best_idx]
            risk_level = matched.get("risk_level", "Medium")
            risk_value = {"Low":1, "Medium":2, "High":3}.get(risk_level, 2)
            total_risk_value += risk_value
            matched_clauses.append({
                "sentence": sentence,
                "matched_category": matched.get("category","Unknown"),
                "risk_level": risk_level,
                "similarity_score": round(best_score, 3)
            })
    else:
        # Simple keyword-based fallback
        keywords_map = {
            "termination": ("Termination", "Medium"),
            "confidential": ("Confidentiality", "Medium"),
            "payment": ("Payment", "Low"),
            "liability": ("Liability", "High"),
            "data": ("Data Protection", "Medium"),
            "security": ("Security", "High")
        }
        for s in sentences:
            s_low = s.lower()
            found = False
            for kw, (cat, rlevel) in keywords_map.items():
                if kw in s_low:
                    found = True
                    risk_value = {"Low":1,"Medium":2,"High":3}[rlevel]
                    total_risk_value += risk_value
                    matched_clauses.append({
                        "sentence": s,
                        "matched_category": cat,
                        "risk_level": rlevel,
                        "similarity_score": 0.0
                    })
                    break
            if not found:
                # default neutral
                matched_clauses.append({
                    "sentence": s,
                    "matched_category": "Unknown",
                    "risk_level": "Low",
                    "similarity_score": 0.0
                })
                total_risk_value += 1

    avg_risk_score = total_risk_value / len(sentences) if sentences else 0

    # ✅ Determine qualitative risk level
    if avg_risk_score <= 1.5:
        risk_level = "Low"
    elif avg_risk_score <= 2.3:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "average_risk_score": round(avg_risk_score, 2),
        "risk_level": risk_level,
        "details": matched_clauses
    }

