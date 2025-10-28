from sentence_transformers import SentenceTransformer, util
import json
import os

# Load model only once
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load your reference dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/clauses.json")
with open(DATA_PATH, "r") as f:
    reference_clauses = json.load(f)

def evaluate_contract(contract):
    text = contract.text  # assuming your Pydantic model has 'content'
    
    # Step 1: Split contract text into sentences (basic version)
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
    
    # Step 2: Encode input and reference clauses
    input_embeddings = model.encode(sentences, convert_to_tensor=True)
    reference_embeddings = model.encode([r["clause"] for r in reference_clauses], convert_to_tensor=True)
    
    # Step 3: Compare each contract clause to reference clauses
    total_risk = 0
    matched_clauses = []
    
    for i, sentence in enumerate(sentences):
        cos_scores = util.cos_sim(input_embeddings[i], reference_embeddings)
        best_match_idx = int(cos_scores.argmax())
        best_score = float(cos_scores.max())
        
        matched = reference_clauses[best_match_idx]
        risk_value = {"Low": 1, "Medium": 2, "High": 3}[matched["risk_level"]]
        total_risk += risk_value
        
        matched_clauses.append({
            "sentence": sentence,
            "matched_category": matched["category"],
            "risk_level": matched["risk_level"],
            "similarity_score": round(best_score, 3)
        })
    
    avg_risk_score = total_risk / len(sentences) if sentences else 0
    return {
        "average_risk_score": round(avg_risk_score, 2),
        "details": matched_clauses
    }
