"""
Adult Census Income - Model Training Script
Trains a Random Forest and Logistic Regression pipeline, saves to models/.
Usage: python scripts/train_adult_model.py
"""
import os
import sys
import json
import warnings
from datetime import datetime

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)
import joblib

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

COLUMN_NAMES = [
    "age", "workclass", "fnlwgt", "education", "education_num",
    "marital_status", "occupation", "relationship", "race", "sex",
    "capital_gain", "capital_loss", "hours_per_week", "native_country", "income"
]

NUMERIC_FEATURES = [
    "age", "fnlwgt", "education_num",
    "capital_gain", "capital_loss", "hours_per_week"
]

CATEGORICAL_FEATURES = [
    "workclass", "education", "marital_status", "occupation",
    "relationship", "race", "sex", "native_country"
]

TARGET = "income"
MODEL_VERSION = "adult-income-rf-v1.0"
ALGORITHM = "RandomForestClassifier"

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
def load_data():
    data_paths = [
        os.path.join(DATA_DIR, "adult.data"),
        os.path.join(DATA_DIR, "adult.csv"),
    ]
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data"

    for p in data_paths:
        if os.path.exists(p):
            print(f"[INFO] Loading data from {p}")
            return pd.read_csv(p, header=None, names=COLUMN_NAMES, skipinitialspace=True, na_values="?")

    print(f"[INFO] Downloading data from {url}")
    df = pd.read_csv(url, header=None, names=COLUMN_NAMES, skipinitialspace=True, na_values="?")
    df.to_csv(os.path.join(DATA_DIR, "adult.csv"), index=False)
    return df

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("Adult Census Income - Model Training")
    print("=" * 60)

    df = load_data()
    print(f"[INFO] Dataset shape: {df.shape}")

    df[TARGET] = df[TARGET].str.strip().str.rstrip(".")

    missing = df.isnull().sum()
    print(f"[INFO] Missing values:\n{missing[missing > 0]}")

    df = df.dropna(subset=[TARGET])
    print(f"[INFO] After dropping missing target: {df.shape}")

    X = df.drop(columns=[TARGET])
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train: {X_train.shape}, Test: {X_test.shape}")

    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer([
        ("num", numeric_transformer, NUMERIC_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES),
    ])

    models = {
        "RandomForest": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)),
        ]),
        "LogisticRegression": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
        ]),
    }

    results = {}
    for name, pipeline in models.items():
        print(f"\n[INFO] Training {name}...")
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, pos_label=">50K")
        rec = recall_score(y_test, y_pred, pos_label=">50K")
        f1 = f1_score(y_test, y_pred, pos_label=">50K")
        cm = confusion_matrix(y_test, y_pred)

        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=3, scoring="accuracy")
        cv_mean = cv_scores.mean()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm.tolist(),
            "cv_accuracy_mean": round(cv_mean, 4),
            "classes": pipeline.classes_.tolist(),
        }

        print(f"  Accuracy : {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall   : {rec:.4f}")
        print(f"  F1 Score : {f1:.4f}")
        print(f"  CV Mean  : {cv_mean:.4f}")
        print(f"  Confusion Matrix:\n{cm}")

    best_model_name = "RandomForest"
    best_pipeline = models[best_model_name]

    pipeline_path = os.path.join(MODEL_DIR, "adult_income_pipeline.joblib")
    joblib.dump(best_pipeline, pipeline_path)
    print(f"\n[INFO] Pipeline saved to {pipeline_path}")

    meta = {
        "model_version": MODEL_VERSION,
        "algorithm": ALGORITHM,
        "dataset": "UCI Adult Dataset",
        "trained_at": datetime.now().strftime("%Y-%m-%d"),
        "target": TARGET,
        "classes": best_pipeline.classes_.tolist(),
    }
    with open(os.path.join(MODEL_DIR, "model_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(f"[INFO] Model meta saved to model_meta.json")

    metrics = results[best_model_name]
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[INFO] Metrics saved to metrics.json")

    feature_names_out = (
        best_pipeline.named_steps["preprocessor"].get_feature_names_out().tolist()
    )
    with open(os.path.join(MODEL_DIR, "feature_names.json"), "w") as f:
        json.dump(feature_names_out, f, indent=2)
    print(f"[INFO] Feature names saved to feature_names.json")

    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)
    print(f"\nBest Model ({best_model_name}):")
    print(f"  Accuracy : {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall   : {metrics['recall']:.4f}")
    print(f"  F1 Score : {metrics['f1_score']:.4f}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
