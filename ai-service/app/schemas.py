from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class AssessmentPayload(BaseModel):
    metrics: Dict[str, object] = Field(default_factory=dict)


class RecommendationPayload(BaseModel):
    metrics: Dict[str, object] = Field(default_factory=dict)
    mental_state: Optional[str] = None


class JournalAnalysisPayload(BaseModel):
    text: str
    recent_mood: Optional[str] = None


class ClassificationResponse(BaseModel):
    mental_state: str
    name: str
    description: str
    common_signs: List[str]
    recommended_exercises: List[str]
    recommendations: List[str]
    confidence: float


class RecommendationResponse(BaseModel):
    activities: List[str]
    rationale: str


class JournalAnalysisResponse(BaseModel):
    patterns: List[str]
    tone: str
    suggestions: List[str]
