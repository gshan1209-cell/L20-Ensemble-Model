import type { PredictionLogEntry } from "@/lib/constants";

interface Props {
  logs: PredictionLogEntry[];
  total: number;
  loading: boolean;
}

export default function PredictionLogsTable({ logs, total, loading }: Props) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No prediction logs yet.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">Total predictions: {total}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">Prediction</th>
              <th className="pb-2 font-medium">Probability</th>
              <th className="pb-2 font-medium">Model Version</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100">
                <td className="py-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      log.prediction === ">50K"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {log.prediction}
                  </span>
                </td>
                <td className="py-2 text-slate-700">
                  {(log.probability * 100).toFixed(1)}%
                </td>
                <td className="py-2 text-slate-500 font-mono text-xs">
                  {log.model_version}
                </td>
                <td className="py-2 text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
