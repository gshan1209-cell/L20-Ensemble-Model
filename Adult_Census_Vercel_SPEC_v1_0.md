# Adult Census Income Predictor｜Vercel 上架開發規格書 v1.0

> 文件日期：2026-07-03  
> 專案類型：資料科學展示網站 / 機器學習分類模型 / Vercel 部署  
> 目標資料集：Adult / Census Income Dataset  
> 主要任務：根據人口統計與工作資訊，預測個人年收入是否 `>50K` 或 `<=50K`

---

## 1. 專案摘要

本專案要建立一個可部署到 Vercel 的 **Adult Census Income Predictor**，讓使用者透過網頁表單輸入年齡、教育程度、職業、每週工時等欄位，系統即時回傳收入分類預測結果。

系統定位不是單純的機器學習 Notebook，而是一個完整的 **資料科學作品集應用**：

- 前端：Next.js 網站
- 後端：API 接收表單並執行推論
- 模型：scikit-learn Pipeline
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
4. 後台或 Dashboard 可查看預測紀錄。
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
   - Model：Random Forest / Logistic Regression / XGBoost
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

| 欄位 | UI 類型 | 驗證規則 |
|---|---|---|
| age | number input | 17–90 |
| workclass | select | 不可空 |
| education | select | 不可空 |
| marital-status | select | 不可空 |
| occupation | select | 不可空 |
| relationship | select | 不可空 |
| race | select | 不可空 |
| sex | select | 不可空 |
| capital-gain | number input | >= 0 |
| capital-loss | number input | >= 0 |
| hours-per-week | number input | 1–99 |
| native-country | select | 不可空 |

### 可選策略

MVP 可先不讓使用者輸入 `fnlwgt` 與 `education-num`：

- `education-num` 可由 `education` 對應產生
- `fnlwgt` 可使用中位數或預設值

### 預測結果顯示

```txt
Prediction: >50K
Probability: 0.82
Model Version: adult-income-rf-v1.0
Explanation: 根據輸入條件，模型判定此樣本較可能屬於 >50K 類別。
```

### 錯誤處理

| 情境 | 顯示訊息 |
|---|---|
| 欄位缺漏 | 請完整填寫必要欄位 |
| 數字超出範圍 | 請輸入合理數值 |
| API 錯誤 | 預測服務暫時無法使用 |
| 模型未載入 | 模型檔尚未完成部署 |

---

## 6.3 Dashboard `/dashboard`

### 功能

顯示模型與使用紀錄。

### MVP 指標

1. 總預測次數
2. 最近 20 筆預測
3. `>50K` / `<=50K` 比例
4. 模型版本
5. 平均預測機率

### 進階指標

1. Accuracy
2. Precision
3. Recall
4. F1-score
5. Confusion Matrix
6. Feature Importance
7. 每日預測量
8. 欄位分布統計

---

## 6.4 資料集說明頁 `/about`

### 功能

說明資料來源、欄位意義、使用限制。

### 必要內容

1. Adult Dataset 來源
2. 預測任務說明
3. 欄位表
4. 模型流程
5. 公平性提醒
6. 隱私提醒
7. 限制說明：
   - 此模型僅為教學與展示用途
   - 不應作為真實薪資、徵才、授信或人事決策依據
   - 資料年代與社會背景有限

---

## 7. API 規格

## 7.1 `POST /api/predict`

### 說明

接收表單資料，回傳模型預測結果。

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

### Response Body

```json
{
  "prediction": ">50K",
  "probability": 0.82,
  "class_probabilities": {
    "<=50K": 0.18,
    ">50K": 0.82
  },
  "model_version": "adult-income-rf-v1.0",
  "created_at": "2026-07-03T10:30:00+08:00"
}
```

### HTTP Status

| 狀態碼 | 說明 |
|---|---|
| 200 | 預測成功 |
| 400 | 輸入格式錯誤 |
| 422 | 驗證失敗 |
| 500 | 模型或伺服器錯誤 |

---

## 7.2 `GET /api/model-meta`

### 說明

回傳目前部署中的模型資訊。

### Response Body

```json
{
  "model_version": "adult-income-rf-v1.0",
  "algorithm": "RandomForestClassifier",
  "accuracy": 0.86,
  "precision": 0.78,
  "recall": 0.62,
  "f1_score": 0.69,
  "trained_at": "2026-07-03",
  "dataset": "UCI Adult Dataset"
}
```

---

## 7.3 `GET /api/prediction-logs`

### 說明

回傳最近預測紀錄。

### Query Params

| 參數 | 說明 |
|---|---|
| limit | 預設 20 |
| offset | 預設 0 |

### Response Body

```json
{
  "items": [
    {
      "id": "uuid",
      "prediction": ">50K",
      "probability": 0.82,
      "model_version": "adult-income-rf-v1.0",
      "created_at": "2026-07-03T10:30:00+08:00"
    }
  ],
  "total": 100
}
```

---

## 8. 資料庫設計

### 8.1 `prediction_logs`

```sql
CREATE TABLE prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_json JSONB NOT NULL,
  predicted_label TEXT NOT NULL,
  probability NUMERIC(5, 4),
  class_probabilities JSONB,
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.2 `model_versions`

```sql
CREATE TABLE model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL,
  algorithm TEXT NOT NULL,
  accuracy NUMERIC(5, 4),
  precision_score NUMERIC(5, 4),
  recall_score NUMERIC(5, 4),
  f1_score NUMERIC(5, 4),
  model_path TEXT,
  metrics_json JSONB,
  trained_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.3 `daily_prediction_stats`

可選，若 Dashboard 需要加速查詢，可建立每日統計表。

```sql
CREATE TABLE daily_prediction_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  count_le_50k INTEGER NOT NULL DEFAULT 0,
  count_gt_50k INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(stat_date)
);
```

---

## 9. 機器學習流程規格

## 9.1 訓練腳本

路徑：

```txt
scripts/train_adult_model.py
```

### 功能

1. 讀取 Adult Dataset
2. 清理 `?` 或缺失值
3. 切分 train / test
4. 建立 preprocessing pipeline
5. 訓練分類模型
6. 輸出模型檔
7. 輸出模型指標
8. 輸出 feature list
9. 輸出 metadata

---

## 9.2 Pipeline 設計

### 數值欄位

```txt
age
fnlwgt
education-num
capital-gain
capital-loss
hours-per-week
```

處理方式：

```txt
SimpleImputer(strategy="median")
StandardScaler()
```

### 類別欄位

```txt
workclass
education
marital-status
occupation
relationship
race
sex
native-country
```

處理方式：

```txt
SimpleImputer(strategy="most_frequent")
OneHotEncoder(handle_unknown="ignore")
```

### 分類模型

MVP 建議：

```txt
LogisticRegression
RandomForestClassifier
```

建議先用 RandomForestClassifier 作為預設展示模型，LogisticRegression 作為 baseline。

---

## 9.3 模型輸出

```txt
models/
├─ adult_income_pipeline.joblib
├─ model_meta.json
├─ feature_names.json
└─ metrics.json
```

### `model_meta.json`

```json
{
  "model_version": "adult-income-rf-v1.0",
  "algorithm": "RandomForestClassifier",
  "dataset": "UCI Adult Dataset",
  "trained_at": "2026-07-03",
  "target": "income",
  "classes": ["<=50K", ">50K"]
}
```

### `metrics.json`

```json
{
  "accuracy": 0.86,
  "precision": 0.78,
  "recall": 0.62,
  "f1_score": 0.69,
  "confusion_matrix": [[7200, 500], [900, 1200]]
}
```

---

## 10. 前端 UI 規格

## 10.1 設計風格

建議風格：

```txt
資料分析儀表板風格
乾淨、專業、教育用途
白底或深色模式皆可
RWD 支援手機與桌機
```

### 主色建議

```txt
Blue / Slate / Emerald
```

### 組件

- Card
- Form
- Select
- Input
- Button
- Badge
- Table
- Chart
- Alert
- Tabs

---

## 10.2 RWD 規格

| 裝置 | 版面 |
|---|---|
| Mobile | 單欄 |
| Tablet | 雙欄 |
| Desktop | 表單 + 結果卡左右排列 |

---

## 11. 專案目錄建議

```txt
adult-census-vercel/
├─ app/
│  ├─ page.tsx
│  ├─ predict/
│  │  └─ page.tsx
│  ├─ dashboard/
│  │  └─ page.tsx
│  ├─ about/
│  │  └─ page.tsx
│  └─ api/
│     ├─ model-meta/
│     │  └─ route.ts
│     └─ prediction-logs/
│        └─ route.ts
│
├─ api/
│  └─ predict.py
│
├─ components/
│  ├─ PredictionForm.tsx
│  ├─ PredictionResultCard.tsx
│  ├─ ModelMetricCards.tsx
│  ├─ PredictionLogsTable.tsx
│  └─ FairnessNotice.tsx
│
├─ lib/
│  ├─ db.ts
│  ├─ validation.ts
│  ├─ constants.ts
│  └─ adult-schema.ts
│
├─ models/
│  ├─ adult_income_pipeline.joblib
│  ├─ model_meta.json
│  ├─ metrics.json
│  └─ feature_names.json
│
├─ scripts/
│  ├─ train_adult_model.py
│  ├─ evaluate_model.py
│  └─ export_sample_data.py
│
├─ data/
│  └─ adult_sample.csv
│
├─ prisma/
│  └─ schema.prisma
│
├─ requirements.txt
├─ package.json
├─ vercel.json
├─ README.md
└─ .env.example
```

---

## 12. 環境變數

### `.env.example`

```env
DATABASE_URL="postgresql://user:password@host:5432/db"
MODEL_VERSION="adult-income-rf-v1.0"
ENABLE_PREDICTION_LOGS="true"
```

若使用 Supabase：

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

若使用 Neon：

```env
DATABASE_URL=""
```

---

## 13. 部署規格

## 13.1 Vercel 部署流程

1. 將專案推送到 GitHub。
2. 在 Vercel 匯入 GitHub repository。
3. 設定環境變數。
4. 安裝依賴。
5. Build。
6. Deploy。
7. 測試 `/predict` 預測功能。
8. 測試 Dashboard 讀取資料庫紀錄。

---

## 13.2 Build 指令

```bash
npm install
npm run build
```

---

## 13.3 Python 依賴

`requirements.txt`

```txt
pandas
numpy
scikit-learn
joblib
```

如採用 FastAPI：

```txt
fastapi
uvicorn
```

---

## 13.4 Node 依賴

```bash
npm install next react react-dom
npm install zod
npm install @prisma/client prisma
npm install recharts
```

若使用 shadcn/ui：

```bash
npx shadcn@latest init
```

---

## 14. 安全與隱私規格

### 14.1 不儲存個資原文策略

雖然 Adult Census 是教學資料集，但使用者在前台輸入的內容仍應視為敏感資料。

MVP 可採以下策略：

1. 不要求姓名、Email、電話。
2. 不記錄 IP。
3. 預測紀錄只存：
   - input_json
   - prediction
   - probability
   - model_version
4. Dashboard 預設只顯示彙整資訊。
5. 若要公開展示，避免顯示完整個人輸入。

---

## 14.2 公平性提醒

因資料包含 `race`、`sex`、`native-country` 等欄位，系統必須在頁面上清楚提示：

```txt
本模型僅供資料科學教學與技術展示，不應用於真實薪資、人事、授信、保險或任何高風險決策。
```

---

## 15. 錯誤處理規格

| 錯誤 | 處理方式 |
|---|---|
| 模型檔不存在 | 回傳 500，顯示「模型尚未部署」 |
| 欄位缺漏 | 回傳 400 |
| 類別值未知 | 使用 OneHotEncoder handle_unknown="ignore" |
| 資料庫寫入失敗 | 預測仍回傳，但 log failed |
| API timeout | 前端顯示重試按鈕 |
| Python 依賴過大 | 改為外部 FastAPI，例如 Render / Cloud Run |

---

## 16. 測試規格

## 16.1 單元測試

| 測試項目 | 說明 |
|---|---|
| 表單驗證 | 年齡、工時、金額欄位不可超出範圍 |
| API schema | request body 必須符合格式 |
| 模型載入 | joblib 可成功載入 |
| 預測輸出 | prediction 必須為 `<=50K` 或 `>50K` |
| DB 寫入 | prediction_logs 可成功寫入 |

---

## 16.2 E2E 測試

建議流程：

1. 開啟 `/predict`
2. 填入範例資料
3. 送出表單
4. 看見預測結果
5. 開啟 `/dashboard`
6. 看見該筆紀錄

---

## 17. 驗收標準

### P0 必須完成

- [ ] 專案可在本機啟動
- [ ] 首頁完成
- [ ] `/predict` 預測頁完成
- [ ] `POST /api/predict` 可回傳結果
- [ ] 模型可成功載入
- [ ] 表單驗證完成
- [ ] 預測紀錄可寫入資料庫
- [ ] Vercel 可成功部署
- [ ] README 有部署教學

### P1 建議完成

- [ ] Dashboard 顯示預測紀錄
- [ ] 模型指標卡片
- [ ] 混淆矩陣
- [ ] Feature Importance
- [ ] About Dataset 頁面
- [ ] 公平性提醒

### P2 延伸功能

- [ ] 多模型切換
- [ ] GitHub Actions 自動訓練
- [ ] 模型版本管理
- [ ] 使用者上傳 CSV 批次預測
- [ ] 匯出預測報告 PDF
- [ ] Admin 後台

---

## 18. 開發里程碑

## Phase 1：專案骨架

目標：完成 Next.js + Vercel 基礎架構。

任務：

- 建立 Next.js App Router 專案
- 加入 Tailwind CSS
- 建立首頁
- 建立 `/predict`
- 建立 `/dashboard`
- 建立 `/about`

---

## Phase 2：模型訓練

目標：產出可部署模型。

任務：

- 建立 `scripts/train_adult_model.py`
- 載入 Adult Dataset
- 建立 preprocessing pipeline
- 訓練 baseline model
- 儲存 `adult_income_pipeline.joblib`
- 儲存 `model_meta.json`
- 儲存 `metrics.json`

---

## Phase 3：預測 API

目標：前端可以呼叫模型預測。

任務：

- 建立 `api/predict.py`
- 載入模型
- 接收 JSON request
- 執行 preprocessing + predict_proba
- 回傳 prediction
- 加入錯誤處理

---

## Phase 4：資料庫

目標：紀錄預測結果。

任務：

- 建立 Postgres
- 建立 `prediction_logs`
- 建立 `model_versions`
- 實作寫入 log
- Dashboard 讀取最近紀錄

---

## Phase 5：部署與驗收

目標：完成 Vercel 上架。

任務：

- 設定 Vercel 專案
- 設定環境變數
- 測試 Build
- 測試 API
- 測試資料庫連線
- 撰寫 README
- 完成驗收表

---

## 19. 給 Codex / 開發 Agent 的任務指令

```txt
請依據本規格書建立一個 Adult Census Income Predictor 專案。

技術限制：
- 使用 Next.js App Router
- 使用 Tailwind CSS
- 可選用 shadcn/ui
- 使用 Python + scikit-learn 訓練模型
- 模型輸出為 joblib
- 部署目標為 Vercel
- 資料庫使用 Postgres，優先支援 Supabase 或 Neon
- 不要在 Vercel Function 內訓練模型，只做推論
- 訓練腳本需放在 scripts/
- 模型檔需放在 models/
- 預測 API 需提供 POST /api/predict
- 頁面至少包含 /、/predict、/dashboard、/about

請優先完成 P0：
1. 建立專案骨架
2. 建立首頁
3. 建立預測頁
4. 建立訓練腳本
5. 建立模型檔
6. 建立預測 API
7. 建立資料庫 schema
8. 完成 Vercel 部署設定
9. 補上 README

驗收時請提供：
- 本機啟動指令
- 訓練模型指令
- API 測試方式
- Vercel 部署步驟
- 已完成項目清單
- 未完成項目清單
```

---

## 20. README 應包含內容

```txt
# Adult Census Income Predictor

## Project Overview
## Tech Stack
## Dataset
## Local Development
## Train Model
## Run Prediction API
## Database Setup
## Deploy to Vercel
## Environment Variables
## Model Metrics
## Fairness Notice
## License
```

---

## 21. 參考資料

1. UCI Adult Dataset  
   https://archive.ics.uci.edu/ml/datasets/adult

2. Vercel Functions  
   https://vercel.com/docs/functions

3. Vercel Python Runtime  
   https://vercel.com/docs/functions/runtimes/python

4. Vercel Functions Limits  
   https://vercel.com/docs/functions/limitations

5. Postgres on Vercel  
   https://vercel.com/docs/postgres

6. Neon for Vercel  
   https://vercel.com/marketplace/neon

---

## 22. 最終建議

本專案最佳落地方式是：

```txt
Next.js + Vercel
Python scikit-learn 推論
Postgres 紀錄預測
模型訓練放本機 / Colab / GitHub Actions
```

MVP 不要過度複雜化，先完成：

```txt
可輸入 → 可預測 → 可記錄 → 可部署 → 可展示
```

後續再擴充：

```txt
Dashboard
模型版本
批次預測
公平性分析
多模型比較
```
