# backend/services/clause_service.py
import os
import pickle
import numpy as np
import torch
from sentence_transformers import SentenceTransformer, util

# ---------------------------
# Load model + centroids once
# ---------------------------
MODEL_NAME = "nlpaueb/legal-bert-base-uncased"
print("🔹 Loading LegalBERT model for evaluation...")
model = SentenceTransformer(MODEL_NAME)

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
CENTROID_PATH = os.path.join(DATA_DIR, "cluster_centroids.pkl")

if not os.path.exists(CENTROID_PATH):
    raise FileNotFoundError(f"Missing centroid file at {CENTROID_PATH}. Run utils/build_cluster_centroids.py first.")

with open(CENTROID_PATH, "rb") as f:
    saved = pickle.load(f)

centroids_dict = saved.get("centroids", {})
cluster_labels = saved.get("labels", {})

# Convert centroids dict to matrix + index map for fast ops
centroid_keys = list(centroids_dict.keys())
if not centroid_keys:
    raise Exception("No centroids found in centroid file.")

centroid_matrix = np.stack([centroids_dict[k] for k in centroid_keys])
# convert to sentence-transformers tensor at query-time

# risk mapping thresholds — tweakable
def similarity_to_risk_level(sim):
    # sim is between -1 and 1, typical 0..1 here
    if sim >= 0.85:
        return "Low"
    if sim >= 0.60:
        return "Medium"
    return "High"

def average_risk_to_overall(avg):
    # avg typically between 1..3
    if avg <= 1.5:
        return "Low"
    if avg <= 2.3:
        return "Medium"
    return "High"

# ---------------------------
# Main function — input is text string
# ---------------------------
def evaluate_contract(text: str):
    """
    Input:
      text (str): full contract text
    Returns:
      dict: { average_risk_score, risk_level, details: [ {sentence, matched_category, similarity_score, risk_level}, ... ] }
    """
    if not text or not isinstance(text, str) or len(text.strip()) < 5:
        return {"error": "No valid text provided."}

    # Split into sentences (simple split; you can replace with better sentence splitter)
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 8]
    if not sentences:
        return {"error": "No valid sentences extracted."}

    # Embed sentences
    input_emb = model.encode(sentences, convert_to_tensor=True)

    # Convert to torch tensor once
    centroid_tensor = torch.tensor(centroid_matrix, dtype=torch.float32)

    details = []
    total_score = 0.0

    for i, sent in enumerate(sentences):
        # compute cosine with all centroids
        cos_scores = util.cos_sim(input_emb[i], centroid_tensor)  # returns 1 x N
        # convert to numpy
        scores = cos_scores.cpu().numpy().flatten()
        best_idx = int(scores.argmax())
        best_sim = float(scores[best_idx])
        best_cid = centroid_keys[best_idx]
        matched_label = cluster_labels.get(str(best_cid), "General / Miscellaneous")

        # map similarity to risk
        clause_risk_level = similarity_to_risk_level(best_sim)
        total_score += {"Low": 1, "Medium": 2, "High": 3}[clause_risk_level]

        details.append({
            "sentence": sent,
            "matched_category": matched_label,
            "cluster_id": best_cid,
            "similarity_score": round(best_sim, 3),
            "risk_level": clause_risk_level
        })

    avg = round(total_score / len(sentences), 2)
    overall = average_risk_to_overall(avg)

    return {
        "average_risk_score": avg,
        "risk_level": overall,
        "details": details
    }
