import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def summarize(text, category="", address=""):
    try:
        r = _client.models.generate_content(
            MODEL = "gemini-3.8-flash",
            contents=("Summarize this citizen complaint for a government officer in one "
                      "sentence (max 25 words). Include the issue and location.\n"
                      f"Category: {category}\nLocation: {address}\nComplaint: {text}"))
        return r.text.strip()
    except Exception:
        return text[:150] + ("..." if len(text) > 150 else "")   # never break the demo