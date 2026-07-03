"use client";

import { useEffect, useState } from "react";
import ModelMetricCards from "@/components/ModelMetricCards";
import PredictionLogsTable from "@/components/PredictionLogsTable";
import type { ModelMeta, PredictionLogEntry } from "@/lib/constants";

export default function DashboardPage() {
  const [meta, setMeta] = useState<ModelMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [logs, setLogs] = useState<PredictionLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/model-meta")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setMeta(data);
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/prediction-logs?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Model performance metrics and recent prediction logs.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Model Metrics
          </h2>
          <ModelMetricCards meta={meta} loading={metaLoading} />
          {meta && (
            <p className="mt-3 text-sm text-slate-400">
              Model: {meta.model_version} | Algorithm: {meta.algorithm} | Trained:{" "}
              {meta.trained_at || "N/A"}
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Recent Predictions
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <PredictionLogsTable logs={logs} total={total} loading={logsLoading} />
          </div>
        </section>
      </div>
    </div>
  );
}
