import os
import json
import re

# ---------------------------------------------
# 1. Define category keyword mappings
# ---------------------------------------------
CATEGORY_KEYWORDS = {
    "confidentiality": [
        "confidential", "nda", "non-disclosure", "privacy", "secret",
        "proprietary information", "non public", "sensitive data", "information sharing"
    ],
    "liability": [
        "liability", "indemnity", "indemnification", "responsibility",
        "damages", "loss", "harm", "limitation of liability"
    ],
    "termination": [
        "terminate", "termination", "breach", "cancel", "expiry",
        "suspend", "notice period", "duration", "renewal"
    ],
    "payment": [
        "payment", "invoice", "fees", "remuneration", "compensation",
        "billing", "charges", "cost", "price", "consideration"
    ],
    "governing law": [
        "law", "jurisdiction", "governing", "dispute", "arbitration",
        "venue", "court", "applicable law", "governed by"
    ],
    "data protection": [
        "data", "gdpr", "protection", "security", "processing",
        "personal data", "breach notification", "information security"
    ],
    "intellectual property": [
        "intellectual", "ip", "patent", "trademark", "copyright",
        "ownership", "license", "invention", "proprietary"
    ],
    "representations": [
        "representation", "warranty", "guarantee", "assure", "assurance",
        "accuracy", "truth", "certify"
    ],
    "force majeure": [
        "force majeure", "act of god", "unforeseeable", "beyond control",
        "disaster", "pandemic", "epidemic", "war", "strike"
    ],
    "audit": [
        "audit", "inspection", "verify", "examination", "review",
        "access to records", "check compliance"
    ],
    "compliance": [
        "compliance", "regulation", "lawful", "statutory", "policy",
        "standard", "guidelines"
    ],
    "insurance": [
        "insurance", "coverage", "policy", "insured", "liability coverage"
    ],
    "assignment": [
        "assign", "transfer", "delegate", "successor", "subcontractor",
        "transfer of rights"
    ],
    "dispute resolution": [
        "dispute", "arbitration", "litigation", "settlement",
        "mediation", "resolve conflict", "controversy"
    ],
    "governing terms": [
        "entire agreement", "amendment", "modification", "waiver",
        "severability", "notices", "interpretation"
    ]
}

# ---------------------------------------------
# 2. File paths
# ---------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
INPUT_PATH = os.path.join(DATA_DIR, "auto_category_map.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "cluster_labels.json")

if not os.path.exists(INPUT_PATH):
    raise FileNotFoundError(f"Could not find {INPUT_PATH}. Run cluster_categories.py first.")

# ---------------------------------------------
# 3. Load clusters
# ---------------------------------------------
with open(INPUT_PATH, "r", encoding="utf-8") as f:
    clusters = json.load(f)

print(f"📖 Loaded {len(clusters)} clusters from {INPUT_PATH}")

# ---------------------------------------------
# 4. Define helper to name clusters
# ---------------------------------------------
def guess_cluster_name(cluster_items):
    """
    Receives a list of dicts (each with clause_text, category, risk_level).
    Extracts text and applies keyword heuristic.
    """
    # Merge all clause texts into a single string
    if isinstance(cluster_items[0], dict):
        text_blobs = " ".join([c.get("clause_text", "") for c in cluster_items])
    else:
        text_blobs = " ".join(cluster_items)

    joined_text = text_blobs.lower()
    for label, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if re.search(rf"\b{re.escape(kw)}\b", joined_text):
                return label.title()
    return "General / Miscellaneous"

# ---------------------------------------------
# 5. Assign readable names to clusters
# ---------------------------------------------
cluster_labels = {}
for cluster_id, cluster_items in clusters.items():
    label = guess_cluster_name(cluster_items)
    cluster_labels[cluster_id] = label

# ---------------------------------------------
# 6. Save labeled clusters
# ---------------------------------------------
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(cluster_labels, f, indent=2, ensure_ascii=False)

print(f"✅ Auto-labeled clusters saved to {OUTPUT_PATH}")
print("🔍 Preview:")
for cid, lbl in list(cluster_labels.items())[:10]:
    print(f"Cluster {cid}: {lbl}")
