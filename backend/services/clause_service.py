from database.supabase_client import supabase

def evaluate_contract(contract):
    """
    Evaluate contract clauses for potential risks and store in Supabase.
    """
    text = contract.text.lower()
    risk_terms = {
        "termination": 1.5,
        "penalty": 2.0,
        "liability": 2.5,
        "confidentiality": 1.0,
        "arbitration": 1.0,
        "indemnity": 3.0
    }

    risk_score = sum(weight for term, weight in risk_terms.items() if term in text)

    # Store result in Supabase
    data = {
        "filename": contract.filename,
        "content": contract.text,
        "risk_score": risk_score
    }

    try:
        supabase.table("contracts").insert(data).execute()
    except Exception as e:
        print("⚠️ Supabase insert failed:", e)

    return {"risk_score": risk_score}
