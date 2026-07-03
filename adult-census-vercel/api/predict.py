"""
Vercel Python Serverless Function - Adult Census Income Prediction
Deployed as api/predict.py on Vercel.
"""
import json
import os
import sys
import warnings
import traceback

warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Lazy-load the model (cached across warm invocations)
# ---------------------------------------------------------------------------
_pipeline = None
_model_meta = None


def _load_model():
    global _pipeline, _model_meta
    if _pipeline is not None:
        return _pipeline, _model_meta

    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    model_path = os.path.join(model_dir, "adult_income_pipeline.joblib")
    meta_path = os.path.join(model_dir, "model_meta.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    _pipeline = joblib.load(model_path)

    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            _model_meta = json.load(f)

    return _pipeline, _model_meta


# ---------------------------------------------------------------------------
# Education number mapping (if user doesn't provide education-num / fnlwgt)
# ---------------------------------------------------------------------------
EDUCATION_NUM_MAP = {
    "Preschool": 1, "1st-4th": 2, "5th-6th": 3, "7th-8th": 4,
    "9th": 5, "10th": 6, "11th": 7, "12th": 8,
    "HS-grad": 9, "Some-college": 10, "Assoc-voc": 11,
    "Assoc-acdm": 12, "Bachelors": 13, "Masters": 14,
    "Prof-school": 15, "Doctorate": 16,
}


def _build_input_df(data: dict) -> pd.DataFrame:
    record = {
        "age": data.get("age", 30),
        "workclass": data.get("workclass", "Private"),
        "fnlwgt": data.get("fnlwgt", 189778),
        "education": data.get("education", "HS-grad"),
        "education_num": data.get("education_num", EDUCATION_NUM_MAP.get(data.get("education", "HS-grad"), 9)),
        "marital_status": data.get("marital_status", "Never-married"),
        "occupation": data.get("occupation", "Adm-clerical"),
        "relationship": data.get("relationship", "Not-in-family"),
        "race": data.get("race", "White"),
        "sex": data.get("sex", "Male"),
        "capital_gain": data.get("capital_gain", 0),
        "capital_loss": data.get("capital_loss", 0),
        "hours_per_week": data.get("hours_per_week", 40),
        "native_country": data.get("native_country", "United-States"),
    }
    return pd.DataFrame([record])


# ---------------------------------------------------------------------------
# Vercel handler entrypoint
# ---------------------------------------------------------------------------
class ValidationError(Exception):
    def __init__(self, message, status_code=422):
        super().__init__(message)
        self.status_code = status_code


def validate_input(body: dict):
    required = [
        "age", "workclass", "education", "marital_status",
        "occupation", "relationship", "race", "sex",
        "capital_gain", "capital_loss", "hours_per_week", "native_country",
    ]
    for field in required:
        if field not in body:
            raise ValidationError(f"Missing required field: {field}", 400)

    age = body.get("age")
    if not isinstance(age, (int, float)) or not (17 <= age <= 90):
        raise ValidationError("age must be between 17 and 90", 422)

    hours = body.get("hours_per_week")
    if not isinstance(hours, (int, float)) or not (1 <= hours <= 99):
        raise ValidationError("hours_per_week must be between 1 and 99", 422)


def handler(event, context=None):
    """
    Vercel Python function handler.
    Compatible with both HTTP API (body is str) and direct invocation.
    """
    try:
        if isinstance(event, dict):
            if "body" in event:
                if isinstance(event["body"], str):
                    body = json.loads(event["body"])
                else:
                    body = event["body"]
            else:
                body = event
        else:
            body = json.loads(event)

        validate_input(body)

        pipeline, meta = _load_model()
        input_df = _build_input_df(body)

        proba = pipeline.predict_proba(input_df)[0]
        classes = pipeline.classes_

        class_probs = {}
        max_idx = 0
        for i, cls in enumerate(classes):
            class_probs[str(cls)] = round(float(proba[i]), 4)
            if proba[i] > proba[max_idx]:
                max_idx = i

        prediction = str(classes[max_idx])
        probability = round(float(proba[max_idx]), 4)

        model_version = (meta or {}).get("model_version", "adult-income-rf-v1.0")

        result = {
            "prediction": prediction,
            "probability": probability,
            "class_probabilities": class_probs,
            "model_version": model_version,
            "created_at": __import__("datetime").datetime.now().astimezone().isoformat(),
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(result),
        }

    except ValidationError as e:
        return {
            "statusCode": e.status_code,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
    except FileNotFoundError as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Model has not been deployed yet. Run the training script first."}),
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Prediction service is temporarily unavailable."}),
        }
