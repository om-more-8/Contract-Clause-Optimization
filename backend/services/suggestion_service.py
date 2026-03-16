# backend/services/suggestion_service.py

import os
import requests
from typing import Optional

# =========================
# Configuration
# =========================

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai" or "ollama"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")

OPENAI_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENAI_MODEL = "gpt-4o-mini"

print("LLM_PROVIDER:", LLM_PROVIDER)
print("OPENAI KEY LOADED:", bool(OPENAI_API_KEY))
# =========================
# Prompt Builder
# =========================

def build_prompt(clause: str, category: str, risk_level: str) -> str:
    """
    Builds a consistent legal optimization prompt.
    """

    prompt = f"""
    You are an expert legal contract analyst.

    A contract clause has been detected with potential legal risk.

    Clause Category: {category}
    Risk Level: {risk_level}

    Original Clause:
    \"\"\"{clause}\"\"\"

    Rewrite this clause to reduce legal risk while keeping the original meaning and intent.

    Rules:
    - Maintain professional legal language
    - Avoid overly aggressive limitations
    - Ensure clarity and enforceability
    - Do not change the fundamental purpose of the clause

    Return ONLY the improved clause text.
    """
    return prompt.strip()


# =========================
# OpenAI Suggestion
# =========================

def generate_openai_suggestion(prompt: str) -> Optional[str]:
    """
    Generate suggestion using OpenAI API.
    """

    if not OPENAI_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You are a legal contract optimization assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    try:
        response = requests.post(OPENAI_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print("⚠️ OpenAI suggestion failed:", e)
        return None


# =========================
# Ollama Suggestion
# =========================

def generate_ollama_suggestion(prompt: str):

    print("Using Ollama model:", OLLAMA_MODEL)

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        if response.status_code != 200:
            print("Ollama error:", response.text)
            return None

        data = response.json()

        print("OLLAMA RAW RESPONSE:", data)

        if "response" in data:
            return data["response"].strip()

        if "message" in data and "content" in data["message"]:
            return data["message"]["content"].strip()

        return str(data)

        print("Unexpected Ollama format:", data)
        return None

    except Exception as e:
        print("Ollama request failed:", e)
        return None

# =========================
# Public Suggestion Function
# =========================

def generate_clause_suggestion(
    clause: str,
    category: str,
    risk_level: str
) -> Optional[str]:
    """
    Main suggestion entry point used by clause_service.
    """
    

    # Only generate suggestions for Medium/High risk
    if risk_level not in ("High", "Medium"):
        return None

    prompt = build_prompt(clause, category, risk_level)
    print("Calling Ollama for clause:", clause[:60])

    if LLM_PROVIDER == "ollama":
        return generate_ollama_suggestion(prompt)

    return generate_openai_suggestion(prompt)
