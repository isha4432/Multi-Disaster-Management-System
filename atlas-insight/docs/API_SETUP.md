# API setup

Every integration in this project is wired to work with **your own** free credentials.
No key in this repo is fabricated, and no code will silently invent data if a key is
missing — each panel shows a clear "not configured" state instead (see
`src/components/intelligence/LiveSignalsPanel.tsx`).

Copy `.env.example` to `.env` and fill in the keys you want to activate. All frontend
keys must be prefixed `VITE_` (Vite only exposes prefixed vars to the browser).

## Map — Leaflet + OpenStreetMap, no key required

The map (`src/components/map/LeafletMap.tsx`) runs on [Leaflet](https://leafletjs.com/)
with free [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles for the street
view and Esri World Imagery tiles for the satellite view. Neither requires an API key,
billing, or domain allow-listing — it works identically on `localhost`, your own
domain, or anywhere else, out of the box.

Marker clustering is handled client-side by `leaflet.markercluster`, replacing the
previous `@googlemaps/markerclusterer` dependency.

If tiles fail to load, it's almost always a network/connectivity issue (check the
Network tab in devtools) rather than a configuration problem — there's no key to
misconfigure.

## OpenWeather — free tier

Used by `src/lib/weather.ts` for live temperature, wind, rain, and derived contextual
signals (e.g. "possible flood conditions") at the current scenario's location.

1. Create a free account at [openweathermap.org](https://home.openweathermap.org/users/sign_up).
2. Go to **API keys** and generate one.
3. Note: new keys can take up to a couple of hours to activate.
4. Add it as `VITE_OPENWEATHER_API_KEY` in `.env`.

Free tier is limited to ~60 calls/minute — the app polls at most every 10 minutes, well
within that.

## NASA FIRMS — free MAP_KEY

Used by `src/lib/firms.ts` for live active-fire detections, shown on the map and in the
live signals panel.

1. Request a free MAP_KEY at [firms.modaps.eosdis.nasa.gov/api/map_key](https://firms.modaps.eosdis.nasa.gov/api/map_key/).
2. Add it as `VITE_NASA_FIRMS_MAP_KEY` in `.env`.

FIRMS enforces a transaction quota per key. The app caches responses and refetches at
most every 15 minutes per bounding box to stay well under it.

## Copernicus Sentinel Hub — not yet wired in

The original spec calls for Sentinel-1/Sentinel-2 satellite search via Copernicus
Sentinel Hub. That integration is **not implemented in this frontend-only build** — it
needs OAuth2 client-credentials, which must be exchanged for a token **server-side**
(never in browser JS, or your client secret leaks to every visitor). This project
currently has no backend to hold that exchange.

If you add a backend (or a Vite server route via `src/server.ts`), the flow is:

1. Create an OAuth client in your [Copernicus Data Space](https://dataspace.copernicus.eu/)
   Sentinel Hub dashboard → note the client ID and secret.
2. Store them server-side only: `COPERNICUS_CLIENT_ID`, `COPERNICUS_CLIENT_SECRET`
   (no `VITE_` prefix — keep them out of the browser bundle).
3. Your server exchanges them for a short-lived access token via Sentinel Hub's OAuth2
   token endpoint, then proxies imagery search/retrieval requests to the frontend.

## USGS earthquakes — no key needed

Already live in `src/lib/usgs.ts`, pulling the public significant-earthquakes GeoJSON
feed directly. No setup required.

## Disaster-tweet classifier — local backend, no external key

Used by `src/lib/classifier.ts` and the "Social report classifier" card in
`LiveSignalsPanel.tsx`. Unlike the other integrations, this doesn't call a third-party
API — it calls a small FastAPI service you run yourself, in `ai-service/`, which serves
a TF-IDF + Logistic Regression model trained on `data/processed/train.csv`.

1. `cd ai-service && pip install -r requirements.txt`
2. `python train.py` (trains and saves `model/classifier.joblib`)
3. `uvicorn app:app --reload --port 8000`
4. `VITE_CLASSIFIER_API_URL` in `.env` already defaults to `http://localhost:8000`.

See `ai-service/README.md` for details, retraining, and deployment notes. This is
on-demand classification of pasted text, not a live social-media feed — Atlas Insight
never fabricates live social observations (see `docs/LIVE_VS_TRAINING.md`).
