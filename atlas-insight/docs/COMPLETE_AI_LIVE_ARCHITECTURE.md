# Complete AI + Live Architecture

- Historical disaster tweets are training data only.
- RoBERTa is fine-tuned locally and exposed through FastAPI.
- CLIP provides zero-shot image/text evidence.
- ViT provides a visual classification baseline.
- Fusion combines text, image, satellite and weather confidence with uncertainty.
- USGS is live and keyless.
- NASA FIRMS is live when the user's free MAP_KEY is configured.
- OpenWeather is optional.
- Copernicus Sentinel-1/2 processing is available through OAuth after the user's account credentials are configured.
- Public Bluesky search is available as a live social-feed adapter.

## Accuracy
The system must distinguish test-set metrics from live confidence. A live accuracy percentage is not valid without ground-truth labels for live events.

## Credentials
No real/private/shared credentials are embedded. Provider credentials must be supplied locally in `.env`.
