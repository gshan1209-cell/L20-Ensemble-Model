# L20 Ensemble Model｜Adult Census Income Predictor

本專案是 **Adult Census / Census Income Dataset** 的機器學習分類模型展示專案，目標是建立可部署到 **Vercel** 的資料科學作品集網站。

核心任務：根據人口統計、教育、職業、工時等欄位，預測個人年收入是否為：

```txt
<=50K
>50K
```

---

## 專案定位

這不是單純 Notebook，而是一個完整的 ML Web App：

```txt
Next.js 前端
  ↓
API Route / Vercel Function
  ↓
Python / scikit-learn 推論
  ↓
Postgres 紀錄預測結果
  ↓
Dashboard 展示模型表現
```

---

## 建議功能

### MVP

- Adult Census 資料集介紹
- 收入分類預測表單
- 即時模型推論
- 回傳預測結果與機率
- 模型版本資訊
- 預測紀錄 Dashboard
- Vercel 部署

### 延伸功能

- Ensemble Model 比較
  - Logistic Regression
  - Decision Tree
  - Random Forest
  - Gradient Boosting
  - Voting Classifier
- Confusion Matrix
- Accuracy / Precision / Recall / F1-score
- Feature Importance
- Fairness / Bias 風險提醒
- Prediction Logs
- Model Version Control

---

## 建議技術棧

| 區塊 | 技術 |
|---|---|
| Frontend | Next.js App Router |
| UI | Tailwind CSS / shadcn/ui |
| API | Vercel Functions |
| ML | Python + scikit-learn |
| Model File | joblib |
| Database | Supabase Postgres / Neon Postgres |
| Training | Local / Colab / GitHub Actions |
| Deploy | Vercel |

---

## 文件

完整開發規格書：

- [`docs/Adult_Census_Vercel_SPEC_v1_0.md`](docs/Adult_Census_Vercel_SPEC_v1_0.md)

---

## 建議開發順序

```txt
P0｜專案初始化
P1｜資料處理與模型訓練
P2｜預測 API
P3｜Next.js 預測頁
P4｜Dashboard 與模型評估
P5｜Vercel 部署
P6｜公平性分析與模型版本控管
```

---

## 注意事項

- 不建議在 Vercel 上訓練模型。
- Vercel 適合前端、API、短時間推論。
- 模型訓練建議放在本機、Colab 或 GitHub Actions。
- Adult Census 包含 `sex`、`race` 等敏感欄位，展示時需加入公平性與偏誤提醒。
