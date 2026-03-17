import threading
from datetime import datetime, timezone
from typing import Dict

from fastapi import FastAPI

from .schemas import (
    LogSampleResponse,
    PredictExerciseRequest,
    PredictExerciseResponse,
    RetrainResponse,
    TrainingSample,
)
from .services.model_service import load_model, predict_exercise, retrain_loop, train_from_mongo
from .services.storage import get_collection

app = FastAPI(
    title="MindTrack ML Service",
    version="0.1.0",
    description="Behavior-aware exercise recommendations for MindTrack AI.",
)

_stop_event = threading.Event()
_retrain_thread: threading.Thread | None = None


@app.on_event("startup")
def startup() -> None:
    load_model()
    global _retrain_thread
    _retrain_thread = threading.Thread(
        target=retrain_loop, args=(_stop_event,), daemon=True
    )
    _retrain_thread.start()


@app.on_event("shutdown")
def shutdown() -> None:
    _stop_event.set()


@app.get("/health")
def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": "mindtrack-ml-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/predict-exercise", response_model=PredictExerciseResponse)
def predict(payload: PredictExerciseRequest) -> Dict[str, object]:
    return predict_exercise(payload.stress_score, payload.recent_mood, payload.sleep_quality)


@app.post("/log-sample", response_model=LogSampleResponse)
def log_sample(payload: TrainingSample) -> Dict[str, str]:
    collection = get_collection()
    record = payload.model_dump()
    record["created_at"] = datetime.now(timezone.utc)
    collection.insert_one(record)
    return {"status": "ok"}


@app.post("/retrain", response_model=RetrainResponse)
def retrain() -> Dict[str, object]:
    trained_state = train_from_mongo()
    if not trained_state:
        return {"status": "no-data", "sample_count": 0, "trained_at": None}

    return {
        "status": "trained",
        "sample_count": trained_state.get("sample_count", 0),
        "trained_at": trained_state.get("trained_at"),
    }
