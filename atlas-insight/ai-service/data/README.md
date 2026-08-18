# AI training data

The canonical uploaded disaster-tweet dataset is stored at:

`data/global-disaster-tweets/full.csv`

It is training/preprocessing data only. The React dashboard does not load this CSV in LIVE DATA mode.
Use `npm run preprocess:tweets -- data/global-disaster-tweets/full.csv` to create train/validation/test splits.
