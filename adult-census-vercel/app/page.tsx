import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Adult Census Income Predictor
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mb-8">
            Predict whether an individual&apos;s income exceeds $50K based on demographic
            and employment data. A machine learning portfolio project demonstrating
            classification models, data pipelines, and full-stack deployment.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/predict"
              className="inline-block px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Start Prediction
            </Link>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              View Dashboard
            </Link>
            <Link
              href="/about"
              className="inline-block px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              About Dataset
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Enter Demographics",
              desc: "Fill in age, education, occupation, hours per week, and other census-related fields.",
            },
            {
              step: "2",
              title: "Model Predicts",
              desc: "A trained Random Forest classifier processes your input and returns an income classification.",
            },
            {
              step: "3",
              title: "View Results",
              desc: "See the prediction, probability scores, and explore the dashboard for model metrics.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Dataset Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Source", value: "UCI Machine Learning Repository" },
              { label: "Records", value: "48,842" },
              { label: "Features", value: "14" },
              { label: "Target", value: "Income (>50K / <=50K)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-50 rounded-lg p-4 border border-slate-100"
              >
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Fairness Notice</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-900">
          <p className="mb-2">
            <strong>Important:</strong> This model is for educational and portfolio
            purposes only. It should NOT be used for real-world salary, hiring,
            lending, insurance, or any high-stakes decisions.
          </p>
          <p>
            The dataset contains demographic features (race, sex, native-country) that
            may reflect historical social biases. Predictions from this model do not
            represent individual merit or potential.
          </p>
        </div>
      </section>
    </div>
  );
}
