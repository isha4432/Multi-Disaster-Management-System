"""
Trains the disaster-vs-non-disaster tweet classifier used by the Atlas Insight
"social" evidence source.

Model: TF-IDF (word 1-2 grams) + Logistic Regression.

Why not a real RoBERTa fine-tune: this repo has no GPU/HF-hub access baked in,
and a transformer fine-tune isn't reproducible from a plain `pip install`.
TF-IDF + Logistic Regression is a standard, honest baseline for this dataset
size (~7.8k train rows) — it trains in seconds on a laptop CPU and gets
comparable results to a transformer on short, keyword-heavy disaster text.
Swapping in a real transformer later only requires replacing predict() in
app.py; the API contract (POST /predict -> {label, confidence}) doesn't change.

Usage:
    python train.py
Reads:
    ../data/processed/train.csv
    ../data/processed/validation.csv
    ../data/processed/test.csv
Writes:
    model/classifier.joblib
"""

import csv
import sys
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sklearn.pipeline import Pipeline
import joblib

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT.parent / "data" / "processed"
MODEL_DIR = ROOT / "model"
MODEL_PATH = MODEL_DIR / "classifier.joblib"


def load_split(name: str):
    path = DATA_DIR / f"{name}.csv"
    if not path.exists():
        sys.exit(
            f"Missing {path}. Run `npm run preprocess:tweets -- "
            f"data/global-disaster-tweets/full.csv` from the project root first."
        )
    texts, labels = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            texts.append(row["text"])
            labels.append(int(row["target"]))
    return texts, labels


def main():
    print("Loading data...")
    X_train, y_train = load_split("train")
    X_val, y_val = load_split("validation")
    X_test, y_test = load_split("test")
    print(f"  train={len(X_train)}  validation={len(X_val)}  test={len(X_test)}")

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=2,
                    max_df=0.9,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",  # dataset is ~82/18 imbalanced
                ),
            ),
        ]
    )

    print("Training...")
    pipeline.fit(X_train, y_train)

    print("\n=== Validation report ===")
    val_pred = pipeline.predict(X_val)
    print(classification_report(y_val, val_pred, target_names=["non-disaster", "disaster"]))

    print("=== Test report ===")
    test_pred = pipeline.predict(X_test)
    print(classification_report(y_test, test_pred, target_names=["non-disaster", "disaster"]))
    print(f"Test macro-F1: {f1_score(y_test, test_pred, average='macro'):.4f}")

    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nSaved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
