import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("🔍 Sedang menggeledah server Google...")
print("-" * 40)
print("Model yang BERHAK Anda gunakan:")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            clean_name = m.name.replace('models/', '')
            print(f"✅ {clean_name}")
except Exception as e:
    print(f"❌ Error: {e}")