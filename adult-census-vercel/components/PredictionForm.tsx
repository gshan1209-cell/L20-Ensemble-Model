"use client";

import { useState, useTransition } from "react";
import {
  CATEGORICAL_OPTIONS,
  LABELS,
  NUMERIC_FIELDS,
  CATEGORICAL_FIELDS,
  type PredictionInput,
  type PredictionResult,
} from "@/lib/constants";

interface Props {
  onResult: (result: PredictionResult | null) => void;
  onError: (error: string | null) => void;
  onLoading: (loading: boolean) => void;
}

const defaults: PredictionInput = {
  age: 39,
  workclass: "Private",
  education: "Bachelors",
  marital_status: "Never-married",
  occupation: "Adm-clerical",
  relationship: "Not-in-family",
  race: "White",
  sex: "Male",
  capital_gain: 2174,
  capital_loss: 0,
  hours_per_week: 40,
  native_country: "United-States",
};

function toSnakeCase(key: string): string {
  return key; // already snake_case in constants
}

export default function PredictionForm({ onResult, onError, onLoading }: Props) {
  const [form, setForm] = useState<PredictionInput>(defaults);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof PredictionInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onLoading(true);

    startTransition(async () => {
      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Prediction failed (HTTP ${res.status})`);
        }

        const data: PredictionResult = await res.json();
        onResult(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        onError(message);
        onResult(null);
      } finally {
        onLoading(false);
      }
    });
  };

  const renderSelect = (field: string, options: string[]) => (
    <div key={field}>
      <label
        htmlFor={field}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {LABELS[field] || field}
      </label>
      <select
        id={field}
        value={form[field as keyof PredictionInput] as string}
        onChange={(e) => updateField(field as keyof PredictionInput, e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const renderNumberInput = (field: string, min: number, max: number) => (
    <div key={field}>
      <label
        htmlFor={field}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {LABELS[field] || field}
      </label>
      <input
        id={field}
        type="number"
        min={min}
        max={max}
        value={form[field as keyof PredictionInput] as number}
        onChange={(e) =>
          updateField(field as keyof PredictionInput, parseInt(e.target.value) || 0)
        }
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderNumberInput("age", 17, 90)}
        {renderNumberInput("capital_gain", 0, 999999)}
        {renderNumberInput("capital_loss", 0, 999999)}
        {renderNumberInput("hours_per_week", 1, 99)}
        {CATEGORICAL_FIELDS.map((field) =>
          renderSelect(field, CATEGORICAL_OPTIONS[field])
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {isPending ? "Predicting..." : "Predict Income"}
      </button>
    </form>
  );
}
