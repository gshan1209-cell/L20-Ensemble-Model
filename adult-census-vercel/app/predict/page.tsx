"use client";

import { useState } from "react";
import PredictionForm from "@/components/PredictionForm";
import PredictionResultCard from "@/components/PredictionResultCard";
import FairnessNotice from "@/components/FairnessNotice";
import type { PredictionResult } from "@/lib/constants";

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Income Prediction</h1>
        <p className="text-slate-500 mt-1">
          Enter demographic and employment details to predict income classification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Input Features
            </h2>
            <PredictionForm
              onResult={setResult}
              onError={setError}
              onLoading={setLoading}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Prediction Result
            </h2>
            <PredictionResultCard result={result} loading={loading} error={error} />
          </div>
          <FairnessNotice />
        </div>
      </div>
    </div>
  );
}
