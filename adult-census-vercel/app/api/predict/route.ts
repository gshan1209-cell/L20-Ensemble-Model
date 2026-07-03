import { NextResponse } from "next/server";
import { predictionInputSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    const modelPath = path.join(process.cwd(), "models", "adult_income_pipeline.joblib");

    if (fs.existsSync(modelPath)) {
      try {
        const pythonScript = path.join(process.cwd(), "api", "predict.py");
        const inputJson = JSON.stringify(input);
        const result = execSync(
          `python -c "import sys; sys.path.insert(0, '${path.join(process.cwd(), "api")}'); from predict import handler; import json; print(json.dumps(handler(json.loads('${inputJson.replace(/'/g, "\\'")}'))))"`,
          { cwd: process.cwd(), timeout: 30000 }
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
      } catch (pyErr) {
        console.warn("Python inference failed, using fallback:", pyErr);
        const fallback = generateFallbackPrediction(input);
        prediction = fallback.prediction;
        probability = fallback.probability;
        classProbabilities = fallback.classProbabilities;
        modelVersion = modelVersion + "-fallback";
      }
    } else {
      const fallback = generateFallbackPrediction(input);
      prediction = fallback.prediction;
      probability = fallback.probability;
      classProbabilities = fallback.classProbabilities;
      modelVersion = modelVersion + "-fallback";
    }

    const result = {
      prediction,
      probability,
      class_probabilities: classProbabilities,
      model_version: modelVersion,
      created_at: new Date().toISOString(),
    };

    if (process.env.ENABLE_PREDICTION_LOGS === "true") {
      try {
        await prisma.predictionLog.create({
          data: {
            input_json: input as Prisma.InputJsonValue,
            predicted_label: prediction,
            probability,
            class_probabilities: classProbabilities as Prisma.InputJsonValue,
            model_version: modelVersion,
          },
        });
      } catch (dbErr) {
        console.warn("Failed to log prediction:", dbErr);
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Prediction error:", err);
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

  const probability = Math.min(0.95, Math.max(0.05, 0.2 + score * 0.15));
  const isOver50k = probability > 0.5;

  return {
    prediction: isOver50k ? ">50K" : "<=50K",
    probability: isOver50k ? probability : 1 - probability,
    classProbabilities: {
      "<=50K": isOver50k ? 1 - probability : probability,
      ">50K": isOver50k ? probability : 1 - probability,
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
