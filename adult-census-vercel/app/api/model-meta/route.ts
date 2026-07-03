import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const metaPath = path.join(process.cwd(), "models", "model_meta.json");
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const metricsPath = path.join(process.cwd(), "models", "metrics.json");
      let metrics = {};
      if (fs.existsSync(metricsPath)) {
        metrics = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));
      }
      return NextResponse.json({ ...meta, ...metrics });
    }

    try {
      const dbMeta = await prisma.modelVersion.findFirst({
        orderBy: { created_at: "desc" },
      });
      if (dbMeta) {
        return NextResponse.json({
          model_version: dbMeta.version,
          algorithm: dbMeta.algorithm,
          accuracy: dbMeta.accuracy ? Number(dbMeta.accuracy) : 0,
          precision: dbMeta.precision_score ? Number(dbMeta.precision_score) : 0,
          recall: dbMeta.recall_score ? Number(dbMeta.recall_score) : 0,
          f1_score: dbMeta.f1_score ? Number(dbMeta.f1_score) : 0,
          trained_at: dbMeta.trained_at?.toISOString() || "",
          dataset: "UCI Adult Dataset",
        });
      }
    } catch {
      // db not available
    }

    return NextResponse.json({
      model_version: process.env.MODEL_VERSION || "adult-income-rf-v1.0-fallback",
      algorithm: "RandomForestClassifier (fallback)",
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      trained_at: "",
      dataset: "UCI Adult Dataset",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch model metadata" },
      { status: 500 }
    );
  }
}
