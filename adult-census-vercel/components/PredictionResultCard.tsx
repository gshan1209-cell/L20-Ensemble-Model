import type { PredictionResult } from "@/lib/constants";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
  error: string | null;
}

export default function PredictionResultCard({ result, loading, error }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-32 mb-4" />
        <div className="h-8 bg-slate-200 rounded w-24 mb-3" />
        <div className="h-4 bg-slate-200 rounded w-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Submit the form to see prediction results.
      </div>
    );
  }

  const isOver50k = result.prediction === ">50K";
  const isHeuristic = result.prediction_source === "heuristic";
  const isModel = result.prediction_source === "model";

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div
        className={`px-6 py-4 ${
          isOver50k ? "bg-emerald-50 border-b border-emerald-200" : "bg-blue-50 border-b border-blue-200"
        }`}
      >
        <p className="text-sm text-slate-500 mb-1">
          {isHeuristic ? "Educational heuristic" : isModel ? "Trained model prediction" : "Result source unavailable"}
        </p>
        <p
          className={`text-3xl font-bold ${
            isOver50k ? "text-emerald-700" : "text-blue-700"
          }`}
        >
          {result.prediction}
        </p>
      </div>
      <div className="p-6 space-y-3">
        {isHeuristic && (
          <p role="note" className="text-sm text-amber-900 bg-amber-50 rounded p-3">
            Rule-based teaching approximation; these weights are not model probabilities.
          </p>
        )}
        <div>
          <p className="text-sm text-slate-500">
            {isHeuristic ? "Heuristic score" : isModel ? "Model confidence" : "Reported value (source unverified)"}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOver50k ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${(result.probability * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 w-12 text-right">
              {(result.probability * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          {isHeuristic ? "Heuristic class weights" : isModel ? "Class probabilities" : "Reported class values"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(result.class_probabilities).map(([cls, prob]) => (
            <div key={cls} className="flex justify-between">
              <span className="text-slate-500">{cls}</span>
              <span className="font-medium text-slate-700">
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-400">
          {isModel ? "Model" : "Method"}: {result.model_version}
        </div>
        <p role="note" className="text-xs text-slate-500">
          Educational demonstration only. Do not use for employment, eligibility, lending,
          or other real-world decisions.
        </p>
      </div>
    </div>
  );
}
