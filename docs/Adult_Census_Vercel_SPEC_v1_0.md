# Adult Census Income Predictor｜Vercel 上架開發規格書 v1.0

> 文件日期：2026-07-03  
> 專案 repo：`gshan1209-cell/L20-Ensemble-Model`  
> 專案類型：資料科學展示網站 / 機器學習分類模型 / Vercel 部署  
> 目標資料集：Adult / Census Income Dataset  
> 主要任務：根據人口統計與工作資訊，預測個人年收入是否 `>50K` 或 `<=50K`

---

## 1. 專案摘要

本專案要建立一個可部署到 Vercel 的 **Adult Census Income Predictor**，讓使用者透過網頁表單輸入年齡、教育程度、職業、每週工時等欄位，系統即時回傳收入分類預測結果。

系統定位不是單純的機器學習 Notebook，而是一個完整的 **資料科學作品集應用**：

- 前端：Next.js 網站
- 後端：API 接收表單並執行推論
- 模型：scikit-learn Pipeline / Ensemble Model
- 資料庫：Postgres，建議 Supabase 或 Neon
- 部署：Vercel
- 展示：模型結果、資料分析、混淆矩陣、預測紀錄、模型限制與公平性提醒

---

## 2. 專案目標

### 2.1 MVP 目標

1. 建立 Adult Census Income Predictor 網站。
2. 使用者可以在表單輸入資料。
3. 系統回傳：
   - 預測結果：`<=50K` 或 `>50K`
   - 預測機率
   - 模型版本
   - 簡短解釋
4. Dashboard 可查看預測紀錄。
5. 可部署到 Vercel。
6. 模型訓練與推論流程分離。

### 2.2 延伸目標

1. 加入資料視覺化：
   - 收入分布
   - 教育程度與收入關係
   - 工時與收入關係
   - 職業與收入關係
2. 加入模型評估：
   - Accuracy
   - Precision
   - Recall
   - F1-score
   - Confusion Matrix
3. 加入公平性分析：
   - `sex`
   - `race`
   - `native-country`
4. 加入模型版本控管。
5. 未來可擴充為多模型比較平台。

---

## 3. 資料集說明

### 3.1 資料集名稱

- Adult Dataset
- Census Income Dataset

### 3.2 資料來源

UCI Machine Learning Repository  
資料集頁面：  
https://archive.ics.uci.edu/ml/datasets/adult

### 3.3 任務說明

根據人口統計資料預測個人年收入是否超過 50K 美元。

目標欄位：

```txt
income
```

分類結果：

```txt
<=50K
>50K
```

### 3.4 常用欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| age | numeric | 年齡 |
| workclass | categorical | 工作類型 |
| fnlwgt | numeric | census 權重 |
| education | categorical | 教育程度 |
| education-num | numeric | 教育年數 |
| marital-status | categorical | 婚姻狀態 |
| occupation | categorical | 職業 |
| relationship | categorical | 家庭關係 |
| race | categorical | 種族 |
| sex | categorical | 性別 |
| capital-gain | numeric | 資本利得 |
| capital-loss | numeric | 資本損失 |
| hours-per-week | numeric | 每週工時 |
| native-country | categorical | 原生國家 |
| income | target | 收入分類 |

---

## 4. 建議技術架構

### 4.1 推薦架構：正式 MVP

```txt
Browser
  ↓
Next.js Frontend on Vercel
  ↓
API Route / Vercel Function
  ↓
Python Inference Function
  ↓
scikit-learn Pipeline Model
  ↓
Postgres Database
  ↓
Dashboard / Logs / Metrics
```

### 4.2 技術選型

| 模組 | 建議技術 | 說明 |
|---|---|---|
| 前端框架 | Next.js App Router | 適合 Vercel 部署 |
| UI | Tailwind CSS + shadcn/ui | 快速建立 RWD 介面 |
| API | Next.js Route Handler / Vercel Function | 接收預測請求 |
| ML 推論 | Python + scikit-learn | 載入 `.joblib` 模型 |
| 模型檔 | joblib | 儲存 sklearn Pipeline |
| 資料庫 | Supabase Postgres 或 Neon Postgres | 紀錄預測與模型版本 |
| ORM | Prisma 或 Drizzle | TypeScript 端資料存取 |
| 訓練環境 | 本機 / Colab / GitHub Actions | 不在 Vercel 上訓練 |
| 部署平台 | Vercel | 前端與 Serverless API |

---

## 5. 為什麼不在 Vercel 上訓練模型？

Vercel 適合：

- 前端部署
- API 請求
- 輕量推論
- 查詢資料庫
- 短時間任務

不適合：

- 大量資料訓練
- 長時間訓練任務
- 大型模型訓練
- 每次請求重新訓練模型

因此本專案採用：

```txt
訓練：本機 / Colab / GitHub Actions
推論：Vercel Function
```

---

## 6. 系統功能規格

## 6.1 前台首頁 `/`

### 功能

首頁展示專案目的與入口。

### 內容

1. 專案標題：Adult Census Income Predictor
2. 簡短說明：
   - 使用人口統計資料預測收入分類
   - 展示分類模型與資料科學流程
3. CTA：
   - Start Prediction
   - View Dashboard
   - About Dataset
4. 模型摘要卡片：
   - Model：Voting Classifier / Random Forest / Logistic Regression
   - Accuracy
   - F1-score
   - Last trained date
   - Model version

### 首頁區塊

```txt
Hero Section
Dataset Summary
Model Summary
How It Works
Fairness Notice
CTA
```

---

## 6.2 預測頁 `/predict`

### 功能

使用者輸入資料並取得收入分類預測。

### 表單欄位

| 欄位 | 輸入型態 | 驗證 |
|---|---|---|
| age | number | 17 至 90 |
| workclass | select | 必填 |
| education | select | 必填 |
| marital-status | select | 必填 |
| occupation | select | 必填 |
| relationship | select | 必填 |
| race | select | 必填，需附公平性提醒 |
| sex | select | 必填，需附公平性提醒 |
| capital-gain | number | >= 0 |
| capital-loss | number | >= 0 |
| hours-per-week | number | 1 至 99 |
| native-country | select | 預設 United-States |

### 輸出結果

```json
{
  "prediction": ">50K",
  "probability": 0.82,
  "model_version": "adult-v1.0.0",
  "explanation": "Based on education, occupation, capital gain, and weekly working hours, the model predicts income is likely above 50K."
}
```

### UI 需求

- RWD 設計
- 表單錯誤提示
- Loading 狀態
- 預測結果卡片
- 模型免責聲明
- 不顯示絕對判斷語氣，需使用「模型預測」或「可能」

---

## 6.3 Dashboard `/dashboard`

### 功能

展示模型與預測紀錄。

### 區塊

1. Model Metrics
   - Accuracy
   - Precision
   - Recall
   - F1-score
2. Prediction Logs
   - 時間
   - 預測結果
   - 機率
   - 模型版本
3. Dataset Insights
   - 收入分布
   - 教育程度分布
   - 工時分布
4. Fairness Notice
   - 說明此資料集可能反映歷史社會偏誤
   - 不可把結果用於實際聘僱、貸款、保險等高風險決策

---

## 6.4 About `/about`

### 功能

說明資料集、模型限制、使用注意事項。

### 內容

- Adult Census Dataset 來源
- 欄位說明
- 模型使用方式
- 可能偏誤
- 不適用情境
- 專案技術架構

---

## 7. API 規格

## 7.1 `POST /api/predict`

### Request Body

```json
{
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
}
```

### Response 200

```json
{
  "prediction": "<=50K",
  "probability": 0.73,
  "model_version": "adult-v1.0.0",
  "created_at": "2026-07-03T00:00:00Z"
}
```

### Response 400

```json
{
  "error": "Invalid input",
  "details": {
    "age": "age must be between 17 and 90"
  }
}
```

### 後端需求

- 驗證輸入欄位
- 載入模型檔
- 執行 preprocessing + prediction
- 回傳 prediction 與 probability
- 寫入 prediction_logs
- 錯誤時不得暴露 stack trace

---

## 8. 資料庫設計

### 8.1 `prediction_logs`

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid | primary key |
| input_json | jsonb | 使用者輸入 |
| predicted_label | text | `<=50K` 或 `>50K` |
| probability | numeric | 預測機率 |
| model_version | text | 模型版本 |
| created_at | timestamptz | 建立時間 |

### 8.2 `model_versions`

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid | primary key |
| version | text | 模型版本 |
| model_name | text | 模型名稱 |
| accuracy | numeric | 準確率 |
| precision | numeric | precision |
| recall | numeric | recall |
| f1_score | numeric | F1 |
| model_path | text | 模型檔路徑 |
| trained_at | timestamptz | 訓練時間 |

### 8.3 SQL 初版

```sql
create table if not exists prediction_logs (
  id uuid primary key default gen_random_uuid(),
  input_json jsonb not null,
  predicted_label text not null,
  probability numeric,
  model_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists model_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  model_name text not null,
  accuracy numeric,
  precision numeric,
  recall numeric,
  f1_score numeric,
  model_path text,
  trained_at timestamptz not null default now()
);
```

---

## 9. 模型訓練規格

### 9.1 訓練流程

```txt
load data
  ↓
clean missing values
  ↓
split X / y
  ↓
train / test split
  ↓
preprocessing
  ↓
train base models
  ↓
train ensemble model
  ↓
evaluate
  ↓
save pipeline as joblib
  ↓
write model_meta.json
```

### 9.2 建議模型

MVP：

- Logistic Regression
- Random Forest
- Voting Classifier

延伸：

- Gradient Boosting
- XGBoost 或 LightGBM，如果部署大小允許

### 9.3 Pipeline 需求

模型檔必須包含 preprocessing，避免 API 端手動重建特徵轉換：

```python
Pipeline([
  ("preprocess", ColumnTransformer(...)),
  ("classifier", VotingClassifier(...))
])
```

### 9.4 模型輸出

```txt
models/adult_income_pipeline.joblib
models/model_meta.json
```

`model_meta.json` 範例：

```json
{
  "version": "adult-v1.0.0",
  "model_name": "VotingClassifier",
  "accuracy": 0.86,
  "precision": 0.78,
  "recall": 0.64,
  "f1_score": 0.70,
  "trained_at": "2026-07-03T00:00:00Z"
}
```

---

## 10. 建議專案結構

```txt
L20-Ensemble-Model/
├─ README.md
├─ AGENT.md
├─ docs/
│  └─ Adult_Census_Vercel_SPEC_v1_0.md
├─ app/
│  ├─ page.tsx
│  ├─ predict/
│  │  └─ page.tsx
│  ├─ dashboard/
│  │  └─ page.tsx
│  ├─ about/
│  │  └─ page.tsx
│  └─ api/
│     └─ predict/
│        └─ route.ts
├─ api/
│  └─ predict.py
├─ components/
│  ├─ PredictionForm.tsx
│  ├─ PredictionResult.tsx
│  ├─ ModelMetricsCard.tsx
│  └─ FairnessNotice.tsx
├─ lib/
│  ├─ db.ts
│  ├─ validation.ts
│  └─ types.ts
├─ models/
│  ├─ adult_income_pipeline.joblib
│  └─ model_meta.json
├─ scripts/
│  ├─ train_adult_model.py
│  └─ evaluate_model.py
├─ data/
│  └─ adult_sample.csv
├─ requirements.txt
├─ package.json
├─ .env.example
└─ vercel.json
```

---

## 11. 環境變數

`.env.example`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
MODEL_VERSION="adult-v1.0.0"
PYTHON_API_SECRET="replace_me"
```

---

## 12. Vercel 部署規格

### 12.1 部署原則

- Next.js 部署到 Vercel。
- 推論 API 可先使用 Vercel Function。
- 訓練流程不放在 Vercel request path。
- 大型模型或重推論流程未來可拆到 Cloud Run / Render / Railway。

### 12.2 Build Command

```bash
npm run build
```

### 12.3 Python Dependencies

`requirements.txt`

```txt
pandas
numpy
scikit-learn
joblib
```

如部署時 Python 套件過大，優先方案：

1. 減少不必要套件。
2. 使用較輕模型。
3. 把 Python 推論服務拆到 Render / Cloud Run。
4. Vercel 前端只呼叫外部推論 API。

---

## 13. UI / UX 規格

### 13.1 設計方向

- 乾淨的資料分析作品集風格
- 清楚展示模型流程
- 表單不能過度複雜
- 預測結果需有解釋與限制提醒
- 避免讓使用者誤以為模型可用於真實高風險決策

### 13.2 色彩建議

- 背景：淺色或深色科技風皆可
- 主色：藍 / 紫 / 青綠
- 警示：偏誤提醒使用黃色或橘色區塊

### 13.3 首頁文案方向

```txt
Explore how machine learning predicts income categories using the Adult Census dataset.
This demo shows a complete ML workflow: data preprocessing, ensemble modeling, inference API, and deployment.
```

---

## 14. Fairness / Bias 規格

Adult Census Dataset 包含可能造成敏感偏誤的欄位，例如：

- race
- sex
- native-country

系統必須加入提醒：

```txt
This model is for educational and demonstration purposes only. It may reflect historical bias in the dataset and must not be used for employment, lending, insurance, or other high-impact decisions.
```

中文說明：

```txt
本模型僅供教學與作品展示使用。資料可能反映歷史社會偏誤，不應用於聘僱、貸款、保險或其他高風險決策。
```

---

## 15. 測試規格

### 15.1 Frontend

- 表單欄位可正常輸入
- 必填欄位驗證有效
- loading 狀態正常
- API error 可顯示友善訊息
- mobile / desktop RWD 正常

### 15.2 API

- valid request 回傳 200
- invalid request 回傳 400
- model missing 回傳 500，但不暴露 stack trace
- probability 為 0 到 1
- prediction 僅能為 `<=50K` 或 `>50K`

### 15.3 Model

- pipeline 可成功載入
- pipeline 可接受單筆資料
- pipeline 可輸出 predict / predict_proba
- metrics 檔案存在

### 15.4 Database

- prediction_logs 可寫入
- dashboard 可讀取最新紀錄
- 無 DATABASE_URL 時，系統可降級為不寫入模式，但需記錄 warning

---

## 16. 驗收標準

### P0｜文件與專案初始化

- [ ] README 已完成
- [ ] docs/spec 已完成
- [ ] Next.js 專案可啟動
- [ ] requirements.txt 已建立
- [ ] .env.example 已建立

### P1｜模型訓練

- [ ] 可載入 Adult Dataset
- [ ] 可完成資料清理
- [ ] 可訓練至少 2 個 base model
- [ ] 可建立 ensemble model
- [ ] 可輸出 joblib 模型檔
- [ ] 可輸出 model_meta.json

### P2｜預測 API

- [ ] `POST /api/predict` 可接受輸入
- [ ] API 可載入模型
- [ ] API 可回傳 prediction / probability / model_version
- [ ] API 有基本錯誤處理

### P3｜前端頁面

- [ ] 首頁完成
- [ ] `/predict` 表單完成
- [ ] `/dashboard` 初版完成
- [ ] `/about` 完成
- [ ] RWD 正常

### P4｜部署

- [ ] 可成功部署到 Vercel
- [ ] 環境變數設定完成
- [ ] 線上 API 可正常推論
- [ ] Dashboard 可讀取資料

---

## 17. Codex 開發建議指令

```txt
請依照 docs/Adult_Census_Vercel_SPEC_v1_0.md 開發本專案。

優先順序：
1. 初始化 Next.js + Tailwind 專案結構。
2. 建立 Adult Census 模型訓練腳本 scripts/train_adult_model.py。
3. 輸出 models/adult_income_pipeline.joblib 與 models/model_meta.json。
4. 建立 /predict 頁面與 PredictionForm。
5. 建立 /api/predict 推論 API。
6. 建立 /dashboard 顯示模型指標與預測紀錄。
7. 補上 README、.env.example、requirements.txt。
8. 確保 npm run build 通過。

限制：
- 不要在 Vercel request path 中訓練模型。
- 不要把資料庫密碼寫死。
- 不要暴露 stack trace。
- 不要移除 fairness notice。
```

---

## 18. 未來擴充

1. 多模型比較頁
2. SHAP / LIME 解釋性分析
3. 模型版本切換
4. GitHub Actions 自動訓練
5. Supabase Auth 後台登入
6. CSV 批次上傳預測
7. API key 管理
8. Drift monitoring

---

## 19. 結論

本專案建議採用：

```txt
Next.js on Vercel
+ Python / scikit-learn 推論
+ Postgres prediction logs
+ Adult Census Ensemble Model
+ Dashboard 展示
```

開發重點不是只完成模型，而是把模型包成一個可以展示、可以部署、可以擴充的完整資料科學 Web App。
