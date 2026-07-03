# AGENT.md｜L20 Ensemble Model 開發守則

本 repo 的主要開發依據：

- `README.md`
- `docs/Adult_Census_Vercel_SPEC_v1_0.md`
- `docs/RWD_Sidebar_REQUIREMENT_v1_0.md`

---

## 專案目標

建立可部署到 Vercel 的 Adult Census Income Predictor：

```txt
Next.js Frontend
+ Python / scikit-learn Inference
+ Ensemble Model
+ Postgres Logs
+ Dashboard
```

---

## 開發優先順序

1. 先讓專案可以啟動與 build。
2. 再完成資料處理與模型訓練。
3. 再接 API 推論。
4. 再做前端頁面。
5. 最後補 Dashboard、測試與部署設定。

---

## 必守限制

- 不要在 Vercel request path 中訓練模型。
- 不要把資料庫密碼、API key、token 寫死在程式碼。
- 不要提交 `.env`。
- 不要暴露 stack trace 給前端使用者。
- 不要移除 fairness / bias notice。
- 不要把模型預測說成真實收入判斷。
- 不要把此專案宣稱可用於聘僱、貸款、保險等高風險決策。
- 子分頁手機版不得固定顯示左側 Sidebar；小於 `lg` 時必須隱藏 Sidebar。
- 子分頁必須使用共用 RWD Layout / AppShell，不要每個頁面各自重複寫 Sidebar。

---

## RWD / Sidebar 規則

所有子分頁需遵守：

```txt
Desktop lg 以上：顯示左側 Sidebar
Mobile / Tablet 小於 lg：隱藏左側 Sidebar
Mobile：顯示 MobileHeader + Drawer / Sheet 導航
Main content：手機版必須 w-full，不可被 Sidebar 擠壓
```

建議元件：

```txt
components/layout/AppShell.tsx
components/layout/Sidebar.tsx
components/layout/MobileHeader.tsx
components/layout/MobileDrawer.tsx
```

參考文件：

- `docs/RWD_Sidebar_REQUIREMENT_v1_0.md`

---

## Cost Guard / Token Guard / Retry Guard

### Cost Guard

- 優先小步提交，不要一次大改整個專案。
- 優先修 build、型別、測試錯誤，不要重構無關檔案。
- 不要新增過重套件，尤其是大型 ML / visualization 套件。
- 若 Python 依賴造成 Vercel 部署過大，優先拆成外部推論服務。

### Token Guard

- 開發前先讀：`README.md`、`docs/Adult_Census_Vercel_SPEC_v1_0.md` 與 `docs/RWD_Sidebar_REQUIREMENT_v1_0.md`。
- 不要重複讀取整個 repo；優先針對相關檔案修改。
- 回報時只列重點：改了什麼、如何測試、是否有風險。

### Retry Guard

- 同一個錯誤最多嘗試 2 次。
- 第二次失敗後，先整理錯誤原因與最小修正方案。
- 不要盲目反覆 build / install / retry。
- 遇到 Vercel / package / Python runtime 相容問題，先降低複雜度，再拆服務。

---

## 驗收要求

完成開發或 PR 前，至少確認：

```bash
npm run build
```

若已有測試，需執行：

```bash
npm test
```

Python 模型流程需確認：

```bash
python scripts/train_adult_model.py
```

並產生：

```txt
models/adult_income_pipeline.joblib
models/model_meta.json
```

RWD 需確認：

```txt
/predict、/dashboard、/about 在小於 lg 的螢幕寬度下：
- Sidebar 隱藏
- 主內容 w-full
- MobileHeader 顯示
- 可透過 Drawer / Sheet 開啟導航
```

---

## 回報格式

請用以下格式回報：

```txt
完成項目：
- ...

測試結果：
- ...

風險 / 待確認：
- ...

下一步建議：
- ...
```
