URGENT = ["fire", "injury", "injured", "collapse", "death", "accident", "emergency",
          "flood", "live wire", "gas leak", "electric shock", "danger", "dangerous",
          "aago", "durghatana", "badhi"]            # a few romanized Nepali
W_KEYWORD, W_UPVOTE, CAP = 3, 0.5, 10
CRITICAL_T, HIGH_T, MEDIUM_T = 9, 4, 2

def score_priority(text, upvotes=0):
    t = text.lower()
    total = 1 + sum(k in t for k in URGENT) * W_KEYWORD + min(upvotes, CAP) * W_UPVOTE
    if total >= CRITICAL_T: level = "CRITICAL"
    elif total >= HIGH_T:   level = "HIGH"
    elif total >= MEDIUM_T: level = "MEDIUM"
    else:                   level = "LOW"
    return {"priority": level, "score": total}