from sentence_transformers import util
from app.embedder import encoder

MIN_SIMILARITY = 0.30   # tune on your own examples

def categorize(text: str, categories: list[dict]) -> dict:
    if not categories:
        return {"category": "", "category_id": "", "confidence": 0.0,
                "needs_review": True, "suggestions": []}

    docs = [f"{c['name']}. {c.get('description', '')}".strip() for c in categories]
    t = encoder.encode(text, convert_to_tensor=True)
    d = encoder.encode(docs, convert_to_tensor=True)
    sims = util.cos_sim(t, d)[0]

    order = sims.argsort(descending=True).tolist()
    best = order[0]
    score = float(sims[best])
    return {
        "category": categories[best]["name"],
        "category_id": categories[best]["id"],
        "confidence": round(score, 3),
        "needs_review": score < MIN_SIMILARITY,
        "suggestions": [
            {"category": categories[i]["name"], "score": round(float(sims[i]), 3)}
            for i in order[:3]
        ],
    }