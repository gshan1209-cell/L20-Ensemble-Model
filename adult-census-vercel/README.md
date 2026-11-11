# Adult Census Income Predictor

> Predict whether an individual's income exceeds $50K based on census data using machine learning.

## Project Overview

A full-stack machine learning web application that classifies income levels (`<=50K` or `>50K`) using the UCI Adult Census Income dataset. Built with Next.js, Python scikit-learn, and Postgres. Deployed on Vercel.

## Tech Stack

| Module           | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | Next.js 16.4.5 App Router / React 19.2.9 |
| UI               | Tailwind CSS                      |
| API              | Next.js Route Handlers + Python   |
| ML Inference     | Python + scikit-learn             |
| ML Training      | Python scripts (`scripts/`)       |
| Database         | Postgres (Supabase / Neon)        |
| ORM              | Prisma                            |
| Deployment       | Vercel                            |

## Dataset

- **Source**: UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/ml/datasets/adult
- **Records**: 48,842
- **Features**: 14 (age, education, occupation, etc.)
- **Target**: Income (`<=50K` or `>50K`)

## Project Structure

```
adult-census-vercel/
├── app/                          # Next.js App Router pages & API
│   ├── page.tsx                  # Home page
│   ├── predict/page.tsx          # Prediction form
│   ├── dashboard/page.tsx        # Dashboard
│   ├── about/page.tsx            # About & dataset info
│   └── api/
│       ├── predict/route.ts      # Prediction API
│       ├── model-meta/route.ts   # Model metadata API
│       └── prediction-logs/route.ts  # Prediction logs API
├── api/
│   └── predict.py                # Vercel Python function (production)
├── components/                   # React components
├── lib/                          # Utilities, validation, types
├── models/                       # Trained model files (.joblib)
├── scripts/
│   └── train_adult_model.py      # Model training script
├── data/                         # Dataset storage
├── prisma/
│   └── schema.prisma             # Database schema
├── vercel.json                   # Vercel deployment config
└── requirements.txt              # Python dependencies
```

## Local Development

### Prerequisites

- Node.js >= 20.9 (verified locally with Node 24.16.0)
- Python >= 3.9
- Postgres (optional, for model metadata and historical prediction records)

### Setup

```bash
# Install Node dependencies
npm ci

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Initialize database (if using Postgres)
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Visit `http://localhost:3000`.

## Train Model

```bash
python scripts/train_adult_model.py
```

This downloads the Adult dataset from UCI, trains a Random Forest classifier, and saves the pipeline to `models/adult_income_pipeline.joblib` along with metadata files.

Output files:
- `models/adult_income_pipeline.joblib` - trained scikit-learn Pipeline
- `models/model_meta.json` - model metadata
- `models/metrics.json` - evaluation metrics
- `models/feature_names.json` - feature names

## Run Prediction API

Once the model is trained:

```bash
# POST /api/predict
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 39,
    "workclass": "Private",
    "education": "Bachelors",
    "marital_status": "Never-married",
    "occupation": "Adm-clerical",
    "relationship": "Not-in-family",
    "race": "White",
    "sex": "Male",
    "capital_gain": 2174,
    "capital_loss": 0,
    "hours_per_week": 40,
    "native_country": "United-States"
  }'
```

## Database Setup

1. Create a Postgres database (Supabase / Neon / Vercel Postgres)
2. Set `DATABASE_URL` in `.env`
3. Run migrations:

```bash
npx prisma generate
npx prisma db push
```

Tables:
- `prediction_logs` - historical prediction records (the prediction API no longer writes new requests/results)
- `model_versions` - tracks model versions
- `daily_prediction_stats` - aggregated daily stats (optional)

## Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

```bash
# Build check locally
npm run build
```

## Environment Variables

| Variable                     | Description                          |
| ---------------------------- | ------------------------------------ |
| `DATABASE_URL`               | Postgres connection string           |
| `MODEL_VERSION`              | Model version identifier             |
| `ENABLE_PREDICTION_LOGS`     | Legacy flag; prediction requests/results are no longer persisted, even when `true` |
| `NEXT_PUBLIC_SUPABASE_URL`   | Supabase URL (if using Supabase)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                 |

## Fairness Notice

This model is for **educational and portfolio purposes only**. It should NOT be used for real-world salary, hiring, lending, insurance, or any high-stakes decisions. The dataset contains demographic features (race, sex, native-country) that may reflect historical social biases.

## Prediction source and local checks

The Next.js `POST /api/predict` returns `prediction_source: "model"` only when Python inference succeeds. If the model file is missing or Python inference fails, it returns `prediction_source: "heuristic"`, a `fallback_reason` (`model_missing` or `python_inference_failed`), and a teaching-only notice. The fallback uses fixed rules; its normalized class weights and `probability` field (the selected class weight, retained for API compatibility) are **not calibrated model probabilities**. A score exactly at 0.5 selects `<=50K`.

The result card distinguishes model, heuristic, and older responses without source metadata. Neither source may be used for employment, eligibility, lending, or other real-world decisions. Prediction requests/results are not written to the database; the dashboard can still read previously stored records. Inference errors are logged without request contents.

Run these commands from `adult-census-vercel/` (not the repository root):

```bash
npm ci
npx prisma generate
npm test
npm run lint
npm run typecheck
npm run build
```

Tests use synthetic input, controlled model-presence/Python boundary fixtures, the real Next.js route and server-rendered result card. They do not require a database, ML dependencies, training, or a production service. A successful fixture is not verification of the deployed Python model. The direct Python endpoint currently omits source metadata and is displayed as unverified; production routing and model availability require separate verification.

## Supported dependency candidate

The app pins Next.js 16.4.5, React/ReactDOM 19.2.9, PostCSS 8.5.23, Zod 4.6.7, ESLint 9.39.5, and TypeScript 5.9.3. Development and builds explicitly use webpack to retain the existing bundler. The Next.js config fixes file tracing to this app directory. Next.js 16 no longer runs lint during build, so run lint and typecheck separately.

The repository root is a command launcher with no second Next.js installation. Run `npm run install:app` there to install this app's lockfile; root `build`, `dev`, `start`, `lint`, `typecheck`, and `test` forward here. Hosting must still select `adult-census-vercel` as its application root and install its lockfile. No deployment settings are changed by this candidate.

Next.js 14.2.35 only addressed historical fixes; the supported Next.js 16 line also addresses later advisories. Zod was upgraded after an online production dependency audit identified GHSA-mrhx-c7xc-m3w5. Do not infer safety of bundled code from a top-level version or an audit count alone. Vendored loaders, development-only findings, and production reachability need separate assessment. No arbitrary dependency overrides or peer-dependency bypasses are used.

## License

MIT
