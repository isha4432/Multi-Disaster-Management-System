# Datasets

## Global Disaster Tweets

**What it's used for:** training/evaluating a disaster-vs-non-disaster text classifier
(the "RoBERTa" step of the original spec), and as a reference schema for the "social"
evidence source in the app's fusion logic (`src/lib/intel.ts`).

**What's in this repo:** `data/global-disaster-tweets/full.csv` — the uploaded static disaster-tweet
dataset (11,370 records) in the expected schema. It is used for model training/preprocessing only;
it is never treated as a live feed by the application.

**Dataset already included:** `data/global-disaster-tweets/full.csv` contains the uploaded 11,370-row dataset.
To preprocess it, run:

```sh
npm run preprocess:tweets -- data/global-disaster-tweets/full.csv
```

The expected columns are `id`, `keyword`, `location`, `text`, and `target`. The script cleans the
data, reports class balance/missing values/duplicates/text length, and writes a stratified
70/15/15 train/validation/test split to `data/processed/`.

**Limitations:**

- This is a static, historical dataset — it is **not a live social media feed**.
- In **LIVE DATA** mode, this CSV is not loaded into the dashboard and cannot create map events.
- In **DEMO SIMULATION** mode, the scenario data are intentionally synthetic/illustrative and are clearly labelled as demo data.
- Free-text `location` fields are unreliable; don't treat them as verified
  coordinates (the original spec's location-extraction guidance applies: mark
  low-confidence extractions rather than fabricating coordinates).
- Class balance and label quality vary by source; always check the preprocessing
  report before training on it.

## Live data sources (not files — fetched at runtime)

These aren't datasets shipped in this repo; they're live APIs the app calls directly.
See `docs/API_SETUP.md` for keys.

- **USGS significant-earthquakes feed** — public GeoJSON, no key, live in
  `src/lib/usgs.ts`.
- **OpenWeather current-conditions** — live in `src/lib/weather.ts`, needs
  `VITE_OPENWEATHER_API_KEY`.
- **NASA FIRMS active-fire detections** — live in `src/lib/firms.ts`, needs
  `VITE_NASA_FIRMS_MAP_KEY`.
