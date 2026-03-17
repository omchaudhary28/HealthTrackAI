from fastapi import FastAPI

from .schemas import (
    AssessmentPayload,
    ClassificationResponse,
    JournalAnalysisPayload,
    JournalAnalysisResponse,
    RecommendationPayload,
    RecommendationResponse,
)
from .services.classifier import classify_mental_state
from .services.journal_analyzer import analyze_journal
from .services.recommendations import build_recommendations

app = FastAPI(
    title="MindTrack AI Service",
    version="0.1.0",
    description="Mental state classification and journal pattern analysis for wellness support.",
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "mindtrack-ai-service",
        "disclaimer": "MindTrack AI supports self-reflection and wellness only.",
    }


@app.post("/classify", response_model=ClassificationResponse)
def classify(payload: AssessmentPayload) -> dict:
    return classify_mental_state(payload.metrics)


@app.post("/recommendations", response_model=RecommendationResponse)
def recommendations(payload: RecommendationPayload) -> dict:
    return build_recommendations(payload.metrics, payload.mental_state)


@app.post("/journal/analyze", response_model=JournalAnalysisResponse)
def journal_analysis(payload: JournalAnalysisPayload) -> dict:
    return analyze_journal(payload.text, payload.recent_mood)
