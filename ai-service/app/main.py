from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
from app.categorizer import categorize
from app.duplicate import find_duplicate
from app.priority import score_priority
from app.summarizer import summarize
import base64
from fastapi import FastAPI, HTTPException      
from app.image_categorizer import categorize_image

app = FastAPI(title="Complaint AI Service")

class Cat(BaseModel):
    id: str
    name: str
    description: str = ""

class CategorizeIn(BaseModel):
    text: str
    categories: list[Cat]

class CategorizeImageIn(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    text: str = ""
    categories: list[Cat]

class Candidate(BaseModel):
    id: str
    text: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    upvotes: int = 0

class AnalyzeIn(BaseModel):
    text: str
    category: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: str = ""
    candidates: list[Candidate] = []

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/categorize")
def cat(body: CategorizeIn):
    return categorize(body.text, [c.model_dump() for c in body.categories])

@app.post("/categorize-image")
def cat_image(body: CategorizeImageIn):
    try:
        image_bytes = base64.b64decode(body.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid base64 image")
    return categorize_image(image_bytes, body.mime_type,
                            [c.model_dump() for c in body.categories], body.text)

@app.post("/analyze")
def analyze(body: AnalyzeIn):
    cands = [c.model_dump() for c in body.candidates]
    dup = find_duplicate(body.text, body.lat, body.lng, cands)
    upvotes = 0
    if dup:
        upvotes = next(c.upvotes for c in body.candidates if c.id == dup["duplicate_of"]) + 1
    pri = score_priority(body.text, upvotes)
    return {"duplicate": dup, **pri,
            "summary": summarize(body.text, body.category, body.address)}