import os
import json
import torch
import numpy as np
from sentence_transformers import SentenceTransformer, util

# ---------------------------------------------
# 1. Load LegalBERT
# ---------------------------------------------
print("🔹 Loading LegalBERT model...")
model = SentenceTransformer("nlpaueb/legal-bert-base-uncased")

# ---------------------------------------------
# 2. Load clustered CUAD data
# ---------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
CLUSTERS_PATH = os.path.join(DATA_DIR, "auto_category_map.json")
LABELS_PATH = os.path.join(DATA_DIR, "cluster_labels.json")

if not os.path.exists(CLUSTERS_PATH):
    raise FileNotFoundError(f"❌ {CLUSTERS_PATH} not found. Run cluster_categories.py first.")

if not os.path.exists(LABELS_PATH):
    raise FileNotFoundError(f"❌ {LABELS_PATH} not found. Run auto_name_clusters.py first.")

with open(CLUSTERS_PATH, "r", encoding="utf-8") as f:
    cluster_data = json.load(f)

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    cluster_labels = json.load(f)

print(f"✅ Loaded {len(cluster_data)} clusters with labels.")

# ---------------------------------------------
# 3. Flatten reference clauses
# ---------------------------------------------
reference_clauses = []

for cluster_id, items in cluster_data.items():
    for item in items:
        # Handle both string-only and dict formats
        if isinstance(item, dict):
            clause_text = item.get("clause_text", "")
            risk = item.get("risk_level", "Medium")
        else:
            clause_text = str(item)
            risk = "Medium"  # default fallback

        reference_clauses.append({
            "text": clause_text,
            "category": cluster_labels.get(str(cluster_id), "General / Miscellaneous"),
            "risk_level": risk
        })

print(f"📚 Prepared {len(reference_clauses)} reference clauses for comparison.")

# ---------------------------------------------
# 4. Embed reference dataset
# ---------------------------------------------
print("🔹 Embedding reference clauses (one-time operation)...")
ref_embeddings = model.encode(
    [rc["text"] for rc in reference_clauses],
    convert_to_tensor=True,
    show_progress_bar=True
)

# ---------------------------------------------
# 5. Risk scoring logic
# ---------------------------------------------
RISK_MAP = {"Low": 1, "Medium": 2, "High": 3}

def evaluate_contract(text: str):
    """
    Evaluate contract by matching clauses to clustered CUAD dataset.
    """
    if not text or not isinstance(text, str):
        return {"error": "Invalid input text."}

    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 10]
    if not sentences:
        return {"error": "No valid clauses found in text."}

    input_embeddings = model.encode(sentences, convert_to_tensor=True, show_progress_bar=False)

    matched = []
    total_risk = 0

    for i, sentence in enumerate(sentences):
        cos_scores = util.cos_sim(input_embeddings[i], ref_embeddings)
        best_idx = int(torch.argmax(cos_scores))
        best_score = float(cos_scores[0][best_idx])

        match = reference_clauses[best_idx]
        risk_val = RISK_MAP.get(match["risk_level"], 2)
        total_risk += risk_val

        matched.append({
            "sentence": sentence,
            "matched_category": match["category"],
            "risk_level": match["risk_level"],
            "similarity_score": round(best_score, 3)
        })

    avg_risk = round(total_risk / len(matched), 2)

    return {
        "average_risk_score": avg_risk,
        "details": matched,
        "message": "Evaluation successful using LegalBERT and clustered CUAD base."
    }
