# Atlas Insight — Advanced AI Service (experimental)

> **Status:** this service is separate from `ai-service/`, which is the one the
> frontend actually talks to today (see `../ai-service/README.md`). This
> folder is a more capable RoBERTa/CLIP/ViT-based backend that is not yet
> wired into the dashboard — treat it as an optional upgrade path, not the
> default setup. It runs on port 8001 so it can't collide with `ai-service/`
> on port 8000 if you run both.

## Dataset
The original Global Disaster Tweets dataset is included at:
`data/raw/tweets.csv` (relative to this folder).

It is training/evaluation data only. It is never treated as live social-media data.

## API credentials — precise solution
No legitimate project can safely embed another person's private/shared API secrets. The ZIP therefore does not contain fake or stolen credentials. It contains a runtime `.env` configuration.

USGS: works immediately with no key.
NASA FIRMS: configure `NASA_FIRMS_MAP_KEY` with your own free FIRMS key.
OpenWeather: configure `OPENWEATHER_API_KEY` if you want weather.
Copernicus: configure `COPERNICUS_CLIENT_ID` and `COPERNICUS_CLIENT_SECRET` for authenticated Sentinel processing.

Copy `.env.example` to `.env`, fill credentials locally, then restart the backend.

## Training
From this folder (`ai-service-advanced`):
`python -m venv .venv`
`.venv\\Scripts\\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux)
`pip install -r requirements.txt`
`python training/train_roberta.py`

## Start backend
`uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload`

## Verify providers
Open `http://127.0.0.1:8001/credential-status`.
It reports which providers are configured without exposing secret values.

## Accuracy
Test accuracy is calculated from the labeled test split. A true live accuracy requires verified ground-truth labels for live predictions. The dashboard should show live confidence, source agreement, uncertainty and freshness until such ground truth exists.
