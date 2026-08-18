# Live vs Training Data

Atlas Insight now separates training data from operational live data.

## LIVE DATA mode

The dashboard does **not** read `data/global-disaster-tweets/full.csv` and does not replay historical tweets as if they were current.
The live evidence bridge uses only observations returned by the configured runtime feeds:

- USGS earthquake feed
- NASA FIRMS active-fire feed (when the FIRMS key is configured)
- OpenWeather current conditions (when the OpenWeather key is configured)

The dashboard labels missing feeds as unavailable and never fabricates a live observation. The live mode also does not generate the demo scenario's synthetic follow-up observation.

## DEMO SIMULATION mode

The existing scenario engine is retained for presentations and testing. It intentionally uses synthetic/illustrative evidence, SOS requests and timelines and is labelled DEMO/SIMULATION in the UI.

## Training dataset

`data/global-disaster-tweets/full.csv` is a static historical dataset used for RoBERTa training/preprocessing. It is not a live social-media feed.
