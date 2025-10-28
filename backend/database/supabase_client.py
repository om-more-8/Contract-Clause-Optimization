from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

# Test insert
data = {"name": "Test Contract", "text": "Sample text", "risk_score": 3.5}
response = supabase.table("contracts").insert(data).execute()
print(response)
