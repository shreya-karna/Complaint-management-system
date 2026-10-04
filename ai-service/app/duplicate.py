import math

from sentence_transformers import util

from app.embedder import encoder

DUPLICATE_THRESHOLD = 0.75        # text + location blend
TEXT_ONLY_THRESHOLD = 0.82        # used when GPS is missing
MAX_RADIUS_M = 500
W_TEXT, W_LOC = 0.7, 0.3


def haversine_m(lat1, lng1, lat2, lng2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = (math.sin((p2 - p1) / 2) ** 2 +
         math.cos(p1) * math.cos(p2) * math.sin(math.radians(lng2 - lng1) / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(a))


def find_duplicate(text, lat, lng, candidates):
    if not candidates:
        return None

    new = encoder.encode(text, convert_to_tensor=True)
    embs = encoder.encode([c["text"] for c in candidates], convert_to_tensor=True)
    sims = util.cos_sim(new, embs)[0]

    best, best_score = None, 0.0
    for c, sim in zip(candidates, sims):
        sim = float(sim)
        if None not in (lat, lng, c.get("lat"), c.get("lng")):
            loc = max(0.0, 1 - haversine_m(lat, lng, c["lat"], c["lng"]) / MAX_RADIUS_M)
            score, threshold = W_TEXT * sim + W_LOC * loc, DUPLICATE_THRESHOLD
        else:
            score, threshold = sim, TEXT_ONLY_THRESHOLD
        if score > threshold and score > best_score:
            best, best_score = c, score

    if best:
        return {"duplicate_of": best["id"], "score": round(best_score, 3)}
    return None