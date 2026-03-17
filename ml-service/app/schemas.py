from typing import Optional

from pydantic import BaseModel, Field


class TrainingSample(BaseModel):
    user_id: Optional[str] = None
    stress_score: float = Field(ge=0, le=100)
    mood: str
    sleep_quality: Optional[float] = Field(default=None, ge=1, le=5)
    exercise_completed: str
    result_after: Optional[str] = None


class PredictExerciseRequest(BaseModel):
    stress_score: float = Field(ge=0, le=100)
    recent_mood: Optional[str] = None
    sleep_quality: Optional[float] = Field(default=None, ge=1, le=5)


class PredictExerciseResponse(BaseModel):
    recommended_exercise: str
    confidence: float
    model_ready: bool


class RetrainResponse(BaseModel):
    status: str
    sample_count: int
    trained_at: Optional[str] = None


class LogSampleResponse(BaseModel):
    status: str
