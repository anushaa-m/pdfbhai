import os
import requests
from dotenv import load_dotenv

load_dotenv()

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8100")

# ---------------------------------------------------------------------------
# CONTRACT WITH THE AI/TRAINING TEAM — confirm these exact routes + JSON
# shapes with them. This client assumes they expose a FastAPI (or similar)
# service with these two endpoints:
#
# POST {AI_SERVICE_URL}/generate-concepts
#   body: {"chunk_text": str}
#   returns: {"concepts": [{"name": str, "importance": int}, ...]}
#
# POST {AI_SERVICE_URL}/generate-mcq
#   body: {"chunk_text": str, "concept_name": str, "difficulty": str}
#   returns: {
#     "question": str,
#     "options": {"A": str, "B": str, "C": str, "D": str},
#     "answer": "A"|"B"|"C"|"D",
#     "difficulty": "easy"|"medium"|"hard",
#     "concept": str,
#     "explanation": str
#   }
# ---------------------------------------------------------------------------


def call_generate_concepts(chunk_text: str) -> list[dict]:
    resp = requests.post(
        f"{AI_SERVICE_URL}/generate-concepts",
        json={"chunk_text": chunk_text},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("concepts", [])


def call_generate_mcq(chunk_text: str, concept_name: str, difficulty: str) -> dict | None:
    try:
        resp = requests.post(
            f"{AI_SERVICE_URL}/generate-mcq",
            json={
                "chunk_text": chunk_text,
                "concept_name": concept_name,
                "difficulty": difficulty,
            },
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[ai_client] Request to AI service failed: {e}")
        return None
