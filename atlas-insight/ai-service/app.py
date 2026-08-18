"""
Serves the trained disaster-tweet classifier over HTTP for the Atlas Insight
frontend (src/lib/classifier.ts).

Run:
    python train.py   # once, to produce model/classifier.joblib
    uvicorn app:app --reload --port 8000

Endpoints:
    GET  /health              -> {status, model_loaded}
    POST /predict {text}      -> {label, target, confidence}
"""

from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model" / "classifier.joblib"

app = FastAPI(title="Atlas Insight — Disaster Tweet Classifier")

# Dev-friendly CORS. Tighten allow_origins to your deployed frontend origin
# before shipping this anywhere public.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
if MODEL_PATH.exists():
    _model = joblib.load(MODEL_PATH)


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class PredictResponse(BaseModel):
    label: str  # "disaster" | "non-disaster"
    target: int  # 1 | 0, matches the dataset's original column
    confidence: float  # 0..1, probability of the predicted class


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train.py` in ai-service/ first.",
        )
    proba = _model.predict_proba([req.text])[0]
    target = int(proba[1] >= 0.5)
    confidence = float(proba[target])
    return PredictResponse(
        label="disaster" if target == 1 else "non-disaster",
        target=target,
        confidence=confidence,
    )
