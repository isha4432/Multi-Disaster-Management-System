# Guardian Eye — disaster intelligence dashboard

An AI-assisted, map-first disaster monitoring and humanitarian-response dashboard.
Built with React 19, TanStack Start/Router, and Leaflet + OpenStreetMap for the live map.

**Live app:** https://atlas-insight-05.lovable.app

## What's real vs. simulated

This started from a large aspirational spec (kept for reference in
[`docs/ORIGINAL_SPEC.md`](docs/ORIGINAL_SPEC.md)) describing a full production system
with a Node/MongoDB backend and a Python FastAPI AI service. What's actually
implemented today is a **frontend-only prototype**:

| Feature | Status |
|---|---|
| Live map (Leaflet + OpenStreetMap, markers, layers) | ✅ Real — `src/components/map` |
| USGS earthquake feed | ✅ Real, live, no key needed — `src/lib/usgs.ts` |
| OpenWeather current conditions | ✅ Real, live — `src/lib/weather.ts` (needs your key) |
| NASA FIRMS active-fire detections | ✅ Real, live — `src/lib/firms.ts` (needs your key) |
| Evidence fusion / uncertainty / information-gap logic | ✅ Real logic, runs on demo evidence — `src/lib/intel.ts` |
| Social-media text classification (TF-IDF + Logistic Regression) | ✅ Real, separate FastAPI process — `ai-service/` (see below) |
| Satellite (Copernicus), CLIP/ViT image evidence, RoBERTa fine-tune | 🧪 Experimental, not wired into the dashboard yet — `ai-service-advanced/` |
| SOS, relief centers, demo scenarios (flood/wildfire/earthquake/cyclone) | 🎭 Simulated demo data — `src/lib/scenario.ts` |

The "AI situation intelligence" panel runs a genuine weighted-fusion algorithm
(confidence × source reliability × freshness, with cross-source agreement scoring),
but by default it's reasoning over hand-authored demo evidence, not live multimodal
feeds — that's clearly the intent of the demo-scenario system, and it's separate from
the live external signals panel described below.

## Live external signals

The **AI Intelligence** page includes a "Live external signals" panel and the map has
a live NASA FIRMS fire layer — both call real APIs directly from the browser using
your own free API keys. With no keys configured they show a clear "not configured"
state rather than fabricating data. See [`docs/API_SETUP.md`](docs/API_SETUP.md) to
get free keys for OpenWeather and NASA FIRMS (the map and USGS need no key).

## Dataset

`data/global-disaster-tweets/sample.csv` is a small **synthetic** sample matching the
schema of Kaggle's "Global Disaster Tweets" dataset (`id, keyword, location, text,
target`), so the preprocessing pipeline runs out of the box:

```sh
npm run preprocess:tweets
```

Swap in the real Kaggle dataset for real preprocessing output — see
[`docs/DATASETS.md`](docs/DATASETS.md) for exactly how, plus the dataset's fields,
limitations, and where to get it.

## Development

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in keys you want to activate (the map needs
no key). See [`docs/API_SETUP.md`](docs/API_SETUP.md).

Other scripts:

```sh
npm run build     # production build
npm run lint       # eslint
npm run format     # prettier
npm run preprocess:tweets   # clean + split the tweets dataset
```

## AI backends (optional, separate processes)

Neither backend is started by `npm run dev` — the dashboard works without them,
showing an "unavailable" state for the features that need them.

**`ai-service/`** — the classifier the Live Signals panel actually calls (port 8000, model already trained):

```sh
cd ai-service
pip install -r requirements.txt
python train.py            # already trained; re-run only if you change the data
uvicorn app:app --reload --port 8000
```

**`ai-service-advanced/`** — experimental RoBERTa/CLIP/ViT + satellite service, not
yet wired into the UI (port 8001, so it can run alongside `ai-service/` without conflict):

```sh
cd ai-service-advanced
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python training/train_roberta.py
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Project structure

```
src/
  routes/            # TanStack Router pages (map, intelligence, sos, relief, reports)
  components/
    map/              # Leaflet map + workspace + layers
    intelligence/      # Situation panel, live signals panel, event timeline
    ui/                 # shadcn/ui primitives
  lib/
    intel.ts            # evidence types + fusion/uncertainty/information-gap logic
    intel-store.tsx      # app state (scenario, evidence, layers, SOS)
    scenario.ts           # demo scenario data (flood/wildfire/earthquake/cyclone)
    usgs.ts                # live USGS earthquake feed
    weather.ts              # live OpenWeather integration
    firms.ts                  # live NASA FIRMS integration
data/
  global-disaster-tweets/     # sample dataset (see docs/DATASETS.md)
  processed/                   # output of the preprocessing script
scripts/
  preprocess-tweets.ts          # dataset cleaning + stratified split
docs/
  API_SETUP.md                   # how to get each real API key
  DATASETS.md                     # dataset schema, limitations, real-data instructions
  ORIGINAL_SPEC.md                 # the original aspirational full-stack spec
```

## Limitations & safety

This is decision-support tooling, not an autonomous system. It does not (and should
not) auto-dispatch emergency services, guarantee route accessibility, or claim
survivor detection. Every AI-derived value in the UI carries a confidence/uncertainty
figure and a source, and "estimated" humanitarian requirements are explicitly labeled
as estimates, not confirmed needs.

## Build with Lovable

This project was built with [Lovable](https://lovable.dev). Continue developing it in
the [Lovable editor](https://lovable.dev/projects/acfdf596-728d-4aa4-a7c4-64b63cbbc3d1) —
changes made there sync straight to this repository.
