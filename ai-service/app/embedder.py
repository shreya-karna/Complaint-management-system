from sentence_transformers import SentenceTransformer

# Multilingual: understands English and reasonably handles Nepali
encoder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")