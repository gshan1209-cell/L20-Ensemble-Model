import { NextResponse } from "next/server";
import { predictionInputSchema } from "@/lib/validation";
import { PredictionRequestError, readPredictionRequest } from "@/lib/prediction-request";
import type { PredictionResult } from "@/lib/constants";
import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const body = await readPredictionRequest(request);
    const parsed = predictionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const input = parsed.data;
    let prediction: string;
    let probability: number;
    let classProbabilities: Record<string, number>;
    let modelVersion = process.env.MODEL_VERSION || "adult-income-rf-v1.0";
    let predictionSource: PredictionResult["prediction_source"] = "model";
    let fallbackReason: PredictionResult["fallback_reason"];

    const modelPath = path.join(process.cwd(), "models", "adult_income_pipeline.joblib");

    if (fs.existsSync(modelPath)) {
      try {
        // Pass JSON via stdin and script arguments directly: shell interpolation
        // breaks JSON quoting and could expose user input in process arguments.
        const result = execFileSync(
          "python",
          [
            "-c",
            "import sys, json; sys.path.insert(0, sys.argv[1]); from predict import handler; print(json.dumps(handler(json.load(sys.stdin))))",
            path.join(process.cwd(), "api"),
          ],
          {
            cwd: process.cwd(),
            timeout: 30000,
            input: JSON.stringify(input),
            stdio: ["pipe", "pipe", "pipe"],
            maxBuffer: 1024 * 1024,
          }
        );
        const parsed = JSON.parse(result.toString().trim());
        if (parsed.statusCode === 200) {
          const body = JSON.parse(parsed.body);
          prediction = body.prediction;
          probability = body.probability;
          classProbabilities = body.class_probabilities;
          modelVersion = body.model_version;
        } else {
          throw new Error(JSON.parse(parsed.body)?.error || "Model inference failed");
        }
      } catch {
        // Child-process errors can contain the request in the command string.
        console.warn("Python inference failed; using educational heuristic.");
        const fallback = generateFallbackPrediction(input);
        prediction = fallback.prediction;
        probability = fallback.probability;
        classProbabilities = fallback.classProbabilities;
        modelVersion = "educational-heuristic-v1";
        predictionSource = "heuristic";
        fallbackReason = "python_inference_failed";
      }
    } else {
      const fallback = generateFallbackPrediction(input);
      prediction = fallback.prediction;
      probability = fallback.probability;
      classProbabilities = fallback.classProbabilities;
      modelVersion = "educational-heuristic-v1";
      predictionSource = "heuristic";
      fallbackReason = "model_missing";
    }

    const result = {
      prediction,
      probability,
      class_probabilities: classProbabilities,
      model_version: modelVersion,
      prediction_source: predictionSource,
      fallback_reason: fallbackReason,
      notice: predictionSource === "heuristic"
        ? "Educational heuristic only; these weights are not model probabilities. Do not use for employment, eligibility, lending, or other real-world decisions."
        : "Educational demonstration only. Do not use for employment, eligibility, lending, or other real-world decisions.",
      created_at: new Date().toISOString(),
    };

    // Prediction requests and results are intentionally not persisted.
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof PredictionRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Prediction request failed.");
    return NextResponse.json(
      { error: "Prediction service is temporarily unavailable" },
      { status: 500 }
    );
  }
}

function generateFallbackPrediction(input: Record<string, unknown>) {
  const age = Number(input.age) || 30;
  const educationNum = mapEducationNum(String(input.education || "HS-grad"));
  const hoursPerWeek = Number(input.hours_per_week) || 40;
  const capitalGain = Number(input.capital_gain) || 0;

  let score = 0;
  if (age > 35) score += 1;
  if (educationNum >= 13) score += 1;
  if (hoursPerWeek > 40) score += 1;
  if (capitalGain > 5000) score += 2;

  // A teaching weight for >50K, not a calibrated model probability.
  const probability = Math.min(0.95, Math.max(0.05, 0.2 + score * 0.15));
  const isOver50k = probability > 0.5;

  return {
    prediction: isOver50k ? ">50K" : "<=50K",
    probability: isOver50k ? probability : 1 - probability,
    classProbabilities: {
      "<=50K": 1 - probability,
      ">50K": probability,
    },
  };
}

const educationNumMap: Record<string, number> = {
  Preschool: 1,
  "1st-4th": 2,
  "5th-6th": 3,
  "7th-8th": 4,
  "9th": 5,
  "10th": 6,
  "11th": 7,
  "12th": 8,
  "HS-grad": 9,
  "Some-college": 10,
  "Assoc-voc": 11,
  "Assoc-acdm": 12,
  Bachelors: 13,
  Masters: 14,
  "Prof-school": 15,
  Doctorate: 16,
};

function mapEducationNum(education: string): number {
  return educationNumMap[education] || 9;
}
