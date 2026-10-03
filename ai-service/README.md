# AI Service

```
python -m venv venv && source venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env     # add GEMINI_API_KEY
uvicorn app.main:app --port 8000
```

Backend env: `AI_SERVICE_URL=http://localhost:8000`
