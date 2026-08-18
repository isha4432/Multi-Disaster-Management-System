# ai-service — disaster-tweet classifier backend

A small FastAPI backend that serves the trained "social" evidence classifier
used by the frontend's Live Signals panel (`src/components/intelligence/LiveSignalsPanel.tsx`,
via `src/lib/classifier.ts`).

**Model:** TF-IDF (word 1-2 grams) + Logistic Regression, trained on
`../data/processed/train.csv` (produced by `npm run preprocess:tweets` at the
project root). This is a classical-ML baseline, not a fine-tuned transformer —
see the docstring in `train.py` for why, and how to swap one in later without
changing the API contract.

This is a **separate process** from the TanStack Start app. It is not started
by `npm run dev` and does not need to be running for the rest of the app to
work — the Live Signals panel simply shows the classifier card as unavailable
if it can't reach this service.

## Setup

```sh
cd ai-service
pip install -r requirements.txt

# Train the model (writes model/classifier.joblib). Takes a few seconds.
python train.py

# Start the API
uvicorn app:app --reload --port 8000
```

Then, in the project root's `.env`, point the frontend at it (already set to
the default):

```
VITE_CLASSIFIER_API_URL=http://localhost:8000
```

## API

- `GET /health` → `{"status": "ok", "model_loaded": true}`
- `POST /predict` with `{"text": "..."}` →
  `{"label": "disaster" | "non-disaster", "target": 0 | 1, "confidence": 0.0-1.0}`

Example:

```sh
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Bridge collapsed near the river after heavy rain, people trapped"}'
```

## Retraining

Re-run `python train.py` any time `../data/processed/train.csv` changes (e.g.
after re-running `npm run preprocess:tweets` on an updated dataset). It
overwrites `model/classifier.joblib`; restart `uvicorn` (or use `--reload`,
already on above) to pick up the new model.

## Deploying

`allow_origins=["*"]` in `app.py` is a dev convenience. Set it to your actual
frontend origin before deploying this anywhere public, and put the model file
and this service behind your own auth/rate limiting — nothing here does that
for you.
