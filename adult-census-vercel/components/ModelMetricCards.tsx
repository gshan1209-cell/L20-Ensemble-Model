import type { ModelMeta } from "@/lib/constants";

interface Props {
  meta: ModelMeta | null;
  loading: boolean;
}

export default function ModelMetricCards({ meta, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-6 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-500">
        Model metrics not available.
      </div>
    );
  }

  const metrics = [
    { label: "Accuracy", value: meta.accuracy },
    { label: "Precision", value: meta.precision },
    { label: "Recall", value: meta.recall },
    { label: "F1 Score", value: meta.f1_score },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-sm text-slate-500">{m.label}</p>
          <p className="text-2xl font-bold text-slate-900">
            {(m.value * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </div>
  );
}
