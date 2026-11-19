"""FastAPI router for /ai/generate-pipeline. Include in main.py with app.include_router(router)."""
from fastapi import APIRouter
from pydantic import BaseModel
from ai_generator import generate_pipeline

router = APIRouter()


class AIRequest(BaseModel):
    prompt: str
    apiKey: str | None = None


@router.post("/ai/generate-pipeline")
def ai_generate(req: AIRequest):
    return generate_pipeline(req.prompt, req.apiKey)
