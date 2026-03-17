from __future__ import annotations

import os
import threading
from datetime import datetime, timezone
from typing import Dict, List, Optional

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .storage import get_collection

MODEL_PATH = os.getenv("MODEL_PATH", "/app/model.joblib")
RETRAIN_INTERVAL_MINUTES = int(os.getenv("RETRAIN_INTERVAL_MINUTES", "60"))
MIN_SAMPLE_COUNT = int(os.getenv("MIN_SAMPLE_COUNT", "8"))

_model_lock = threading.Lock()
_model_state: Dict[str, object] = {
    "model": None,
    "trained_at": None,
    "sample_count": 0,
}


def _normalize_mood(value: Optional[str]) -> str:
    if not value:
        return "unknown"
    return str(value).strip().lower()


def _build_dataframe(samples: List[dict]) -> pd.DataFrame:
    if not samples:
        return pd.DataFrame()

    df = pd.DataFrame(samples)
    required = ["stress_score", "mood", "exercise_completed"]
    for column in required:
        if column not in df.columns:
            return pd.DataFrame()

    df = df.dropna(subset=required)
    df["mood"] = df["mood"].apply(_normalize_mood)
    df["exercise_completed"] = df["exercise_completed"].astype(str).str.strip().str.lower()

    if "sleep_quality" not in df.columns:
        df["sleep_quality"] = 3
    df["sleep_quality"] = pd.to_numeric(df["sleep_quality"], errors="coerce").fillna(3)

    if "result_after" in df.columns:
        df["result_after"] = df["result_after"].astype(str).str.lower()
        improved_mask = df["result_after"].str.contains(
            "calm|better|improv|reliev|reduce|less", regex=True, na=False
        )
        if improved_mask.any():
            df = df[improved_mask]

    return df


def _train_model(samples: List[dict]) -> Optional[Dict[str, object]]:
    df = _build_dataframe(samples)
    if df.empty or len(df) < MIN_SAMPLE_COUNT:
        return None

    X = df[["stress_score", "mood", "sleep_quality"]]
    y = df["exercise_completed"]

    preprocessor = ColumnTransformer(
        transformers=[("mood", OneHotEncoder(handle_unknown="ignore"), ["mood"])],
        remainder="passthrough",
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        max_depth=8,
        class_weight="balanced",
    )

    pipeline = Pipeline(steps=[("prep", preprocessor), ("model", model)])
    pipeline.fit(X, y)

    trained_at = datetime.now(timezone.utc).isoformat()
    return {
        "model": pipeline,
        "trained_at": trained_at,
        "sample_count": len(df),
    }


def train_from_mongo() -> Optional[Dict[str, object]]:
    collection = get_collection()
    samples = list(collection.find({}, {"_id": 0}))
    trained_state = _train_model(samples)
    if not trained_state:
        return None

    with _model_lock:
        _model_state.update(trained_state)

    joblib.dump(trained_state, MODEL_PATH)
    return trained_state


def load_model() -> None:
    if not os.path.exists(MODEL_PATH):
        train_from_mongo()
        return

    try:
        stored = joblib.load(MODEL_PATH)
    except Exception:
        train_from_mongo()
        return

    if not isinstance(stored, dict) or "model" not in stored:
        train_from_mongo()
        return

    with _model_lock:
        _model_state.update(
            {
                "model": stored.get("model"),
                "trained_at": stored.get("trained_at"),
                "sample_count": stored.get("sample_count", 0),
            }
        )


def predict_exercise(
    stress_score: float, recent_mood: Optional[str], sleep_quality: Optional[float]
) -> Dict[str, object]:
    with _model_lock:
        model = _model_state.get("model")
        trained_at = _model_state.get("trained_at")
        sample_count = int(_model_state.get("sample_count", 0))

    mood_value = _normalize_mood(recent_mood)
    fallback = _fallback_exercise(stress_score)

    if not model:
        return {
            "recommended_exercise": fallback,
            "confidence": 0.35,
            "model_ready": False,
        }

    sleep_value = sleep_quality if sleep_quality is not None else 3
    data = pd.DataFrame(
        [
            {
                "stress_score": float(stress_score),
                "mood": mood_value,
                "sleep_quality": float(sleep_value),
            }
        ]
    )
    try:
        proba = model.predict_proba(data)
        classes = model.classes_
        best_index = int(proba[0].argmax())
        recommendation = str(classes[best_index])
        confidence = float(proba[0][best_index])
    except Exception:
        return {
            "recommended_exercise": fallback,
            "confidence": 0.35,
            "model_ready": False,
        }

    return {
        "recommended_exercise": recommendation,
        "confidence": confidence,
        "model_ready": True,
        "trained_at": trained_at,
        "sample_count": sample_count,
    }


def _fallback_exercise(stress_score: float) -> str:
    if stress_score >= 70:
        return "breathing"
    if stress_score >= 55:
        return "journaling"
    return "gratitude"


def retrain_loop(stop_event: threading.Event) -> None:
    while not stop_event.wait(RETRAIN_INTERVAL_MINUTES * 60):
        train_from_mongo()
