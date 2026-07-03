# Adult Census Income Predictor

> Predict whether an individual's income exceeds $50K based on census data using machine learning.

## Project Overview

A full-stack machine learning web application that classifies income levels (`<=50K` or `>50K`) using the UCI Adult Census Income dataset. Built with Next.js, Python scikit-learn, and Postgres. Deployed on Vercel.

## Tech Stack

| Module           | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | Next.js 14 App Router             |
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

- Node.js >= 18
- Python >= 3.9
- Postgres (optional, for prediction logging)

### Setup

```bash
# Install Node dependencies
npm install

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
- `prediction_logs` - stores each prediction request
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
| `ENABLE_PREDICTION_LOGS`     | Enable prediction logging (`true`)   |
| `NEXT_PUBLIC_SUPABASE_URL`   | Supabase URL (if using Supabase)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                 |

## Fairness Notice

This model is for **educational and portfolio purposes only**. It should NOT be used for real-world salary, hiring, lending, insurance, or any high-stakes decisions. The dataset contains demographic features (race, sex, native-country) that may reflect historical social biases.

## License

MIT
