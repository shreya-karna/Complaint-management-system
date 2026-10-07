import json
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
]
MIN_CONFIDENCE = 0.5   # below this the photo is treated as "not sure"


def _empty(reason: str = "") -> dict:
    return {"category": "", "category_id": "", "confidence": 0.0,
            "needs_review": True, "reason": reason}


def _generate(contents, config):
    """Try each model in order; move on quickly if one is busy or unavailable."""
    last_err = None
    for model in MODELS:
        for attempt in range(2):
            try:
                result = _client.models.generate_content(
                    model=model, contents=contents, config=config
                )
                print(f"[image_categorizer] answered by {model}")
                return result
            except Exception as err:
                last_err = err
                text = str(err)
                if "404" in text or "NOT_FOUND" in text:
                    break                      # model not usable, go to next one
                if not any(code in text for code in ("503", "UNAVAILABLE", "429")):
                    raise                      # real error (bad key, bad request)
                if attempt == 0:
                    time.sleep(1)              # one quick retry, then move on
        print(f"[image_categorizer] {model} unavailable, trying next model")
    raise last_err


def categorize_image(image_bytes: bytes, mime_type: str,
                     categories: list[dict], text: str = "") -> dict:
    if not categories:
        return _empty()

    options = "\n".join(
        f"- id: {c['id']} | {c['name']}: {c.get('description', '')}"
        for c in categories
    )
    prompt = (
        "You help route citizen complaints to the right category for a municipal "
        "government in Nepal. Look at the attached photo and choose the single "
        "category that best matches the problem shown.\n\n"
        f"Allowed categories:\n{options}\n\n"
        "Rules:\n"
        "- Answer with one of the allowed ids only.\n"
        "- If the photo does not show a civic problem that fits any category "
        "(selfie, indoor scene, document, unclear or dark image), use an empty "
        "category_id and confidence 0.\n"
        "- confidence is 0 to 1: how sure you are that this category is right.\n"
        "- reason is one short sentence (max 15 words) saying what you see.\n\n"
        f"Citizen's written description (may be empty, the photo is the main "
        f"evidence): {text or '(none)'}\n\n"
        'Respond with JSON only: {"category_id": "...", "confidence": 0.0, "reason": "..."}'
    )

    t0 = time.time()
    try:
        r = _generate(
            contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type), prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        )
        print(f"[image_categorizer] took {time.time() - t0:.1f}s")
        data = json.loads(r.text)
    except Exception as err:
        print(f"[image_categorizer] failed: {err}")
        return _empty("image analysis failed")

    by_id = {c["id"]: c for c in categories}
    chosen = by_id.get(str(data.get("category_id", "")))
    reason = str(data.get("reason", ""))[:200]
    if not chosen:
        return _empty(reason)

    try:
        confidence = max(0.0, min(1.0, float(data.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0.0

    return {
        "category": chosen["name"],
        "category_id": chosen["id"],
        "confidence": round(confidence, 3),
        "needs_review": confidence < MIN_CONFIDENCE,
        "reason": reason,
    }