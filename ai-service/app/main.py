from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.categorizer import categorize
from app.duplicate import find_duplicate
from app.priority import score_priority
from app.summarizer import summarize
from app.moderation import moderate_text

app = FastAPI(title="Complaint AI Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Cat(BaseModel):
    id: str
    name: str
    description: str = ""

class CategorizeIn(BaseModel):
    text: str
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

class ModerateIn(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/categorize")
def cat(body: CategorizeIn):
    return categorize(body.text, [c.model_dump() for c in body.categories])

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

@app.post("/moderate")
def moderate(body: ModerateIn):
    result = moderate_text(body.text)

    return  result
