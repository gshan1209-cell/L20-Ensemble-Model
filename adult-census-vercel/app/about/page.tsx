import FairnessNotice from "@/components/FairnessNotice";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">About the Dataset</h1>
        <p className="text-slate-500 mt-1">
          Understanding the Adult Census Income dataset and the prediction task.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Dataset Source</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Adult dataset, also known as the Census Income dataset, was extracted
            from the 1994 U.S. Census Bureau database by Barry Becker. It is hosted by
            the UCI Machine Learning Repository and has been widely used for
            benchmarking classification algorithms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Prediction Task
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The goal is to predict whether an individual&apos;s annual income exceeds
            $50,000 based on 14 demographic and employment-related features such as age,
            education, occupation, marital status, and hours worked per week. This is a
            binary classification problem with classes <strong>&lt;=50K</strong> and{" "}
            <strong>&gt;50K</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">
                    Feature
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">
                    Type
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["age", "numeric", "Age in years"],
                  ["workclass", "categorical", "Employment type (Private, Gov, Self-emp, etc.)"],
                  ["fnlwgt", "numeric", "Census sampling weight"],
                  ["education", "categorical", "Highest education level attained"],
                  ["education-num", "numeric", "Years of education (derived)"],
                  ["marital-status", "categorical", "Marital status"],
                  ["occupation", "categorical", "Job category"],
                  ["relationship", "categorical", "Family relationship role"],
                  ["race", "categorical", "Race"],
                  ["sex", "categorical", "Gender"],
                  ["capital-gain", "numeric", "Capital gains"],
                  ["capital-loss", "numeric", "Capital losses"],
                  ["hours-per-week", "numeric", "Hours worked per week"],
                  ["native-country", "categorical", "Country of origin"],
                  ["income", "target", "<=50K or >50K"],
                ].map(([name, type, desc]) => (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs text-slate-700">
                      {name}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          type === "numeric"
                            ? "bg-blue-100 text-blue-800"
                            : type === "target"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Model Pipeline</h2>
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-sm text-slate-600 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </span>
              <p>
                <strong>Data Cleaning:</strong> Handle missing values (marked as
                &apos;?&apos;) and remove incomplete records.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </span>
              <p>
                <strong>Preprocessing:</strong> Numeric features are imputed with median
                and standardized. Categorical features are imputed with mode and
                one-hot encoded.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </span>
              <p>
                <strong>Training:</strong> A Random Forest Classifier is trained on 80%
                of the data, with the remaining 20% held out for evaluation.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </span>
              <p>
                <strong>Inference:</strong> The trained pipeline (scikit-learn Pipeline)
                is serialized with joblib and loaded at inference time on Vercel serverless
                functions.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Limitations</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              This model is for educational and portfolio demonstration purposes only.
            </li>
            <li>
              It should not be used as a basis for real salary, hiring, lending, or
              personnel decisions.
            </li>
            <li>
              The data is from the 1994 U.S. Census and reflects the social and economic
              context of that era.
            </li>
            <li>
              The dataset has known demographic imbalances that may affect model
              fairness.
            </li>
            <li>
              The model does not capture current economic conditions, policy changes, or
              regional variations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Privacy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This application does not collect names, emails, phone numbers, or IP
            addresses. While the Adult Census dataset is publicly available, any
            input submitted through the prediction form should be treated as
            potentially sensitive. Prediction logs are stored only for demonstrating
            the data pipeline and are not shared with third parties.
          </p>
        </section>

        <section>
          <FairnessNotice />
        </section>
      </div>
    </div>
  );
}
