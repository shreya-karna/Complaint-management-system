import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def moderate_text(text: str):
    prompt = f"""
You are a content moderation system for a public complaint management
system in Nepal.

Analyze the following complaint description.

Determine whether it contains:
- vulgar or obscene language
- abusive insults
- sexually explicit language
- hateful or severely offensive language

The complaint may be written in:
- English
- Nepali
- Romanized Nepali
- a mixture of these languages

Do NOT reject a complaint simply because it describes an incident
involving abuse or offensive language. Only flag the text when the user
appears to be using the offensive language themselves.

Return ONLY valid JSON in this exact format:

{{
  "allowed": true,
  "reason": ""
}}

or

{{
  "allowed": false,
  "reason": "vulgar_language"
}}

Complaint description:
{text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        result = response.text.strip()

        # Remove markdown code fences if Gemini adds them
        if result.startswith("```"):
            result = result.replace("```json", "").replace("```", "").strip()

        return json.loads(result)

    except Exception as error:
        print("AI moderation error:", error)

        # Fail safely when the AI service is temporarily unavailable.
        # The local vulgar-word filter will still protect the form.
        return {
            "allowed": True,
            "reason": "ai_unavailable",
        }