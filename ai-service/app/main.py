from fastapi import FastAPI
from pydantic import BaseModel
from app.categorizer import categorize

app = FastAPI(title="Complaint AI Service")

class Cat(BaseModel):
    id: str
    name: str
    description: str = ""

class CategorizeIn(BaseModel):
    text: str
    categories: list[Cat]

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/categorize")
def cat(body: CategorizeIn):
    return categorize(body.text, [c.model_dump() for c in body.categories])