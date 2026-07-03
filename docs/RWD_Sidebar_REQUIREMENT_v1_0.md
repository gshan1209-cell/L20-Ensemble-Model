# RWD Sidebar Requirement｜子分頁手機版左側欄規格 v1.0

> 文件日期：2026-07-03  
> 適用專案：`gshan1209-cell/L20-Ensemble-Model`  
> 適用範圍：所有子分頁、Dashboard、Predict、About、未來管理頁面  
> 核心需求：畫面變小時，左側欄必須隱藏，不可壓縮主要內容。

---

## 1. 需求摘要

當使用者進入子分頁，例如：

- `/predict`
- `/dashboard`
- `/about`
- 未來的 `/models`
- 未來的 `/logs`
- 未來的 `/settings`

若畫面寬度進入手機版或小螢幕版，左側 Sidebar 必須自動隱藏，避免造成畫面擁擠、表單難以操作或內容被壓縮。

---

## 2. RWD 行為規格

### 2.1 Desktop / Tablet Large

建議 breakpoint：`lg` 以上，也就是 Tailwind CSS 的 `lg: 1024px` 以上。

行為：

```txt
左側 Sidebar 顯示
主內容區正常保留 margin / padding
適合 Dashboard / 子頁導覽
```

建議 class：

```tsx
<aside className="hidden lg:block lg:w-64">
  <Sidebar />
</aside>
```

---

### 2.2 Tablet / Mobile

建議 breakpoint：小於 `lg`，也就是 `< 1024px`。

行為：

```txt
左側 Sidebar 隱藏
主內容區寬度改為 100%
上方顯示 Mobile Header
提供 menu button 開啟抽屜式選單
```

建議 class：

```tsx
<aside className="hidden lg:block">
  <Sidebar />
</aside>

<MobileHeader className="lg:hidden" />
```

---

## 3. Layout 建議

建議建立共用 layout：

```txt
components/layout/AppShell.tsx
components/layout/Sidebar.tsx
components/layout/MobileHeader.tsx
components/layout/MobileDrawer.tsx
```

### AppShell 範例

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader className="lg:hidden" />

      <div className="flex">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 border-r">
          <Sidebar />
        </aside>

        <main className="w-full flex-1 px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 4. Mobile Drawer 行為

手機版不能直接顯示左側欄，應改用：

```txt
上方 Header
  ↓
Menu Button
  ↓
Drawer / Sheet / Slide-over
  ↓
顯示與 Sidebar 相同的導航項目
```

若使用 shadcn/ui，建議使用：

```txt
Sheet
SheetTrigger
SheetContent
```

---

## 5. 子分頁共同規則

所有子分頁都應該使用同一個 `AppShell`，不可每個頁面各自寫一套 sidebar。

必須符合：

- Desktop：左側 Sidebar 顯示
- Mobile：左側 Sidebar 隱藏
- Mobile：主內容區 `width: 100%`
- Mobile：可透過上方 menu button 開啟導航
- 表單頁不得被 Sidebar 擠壓
- Dashboard 卡片需自動改成單欄
- 表格需支援橫向捲動或改成卡片列表

---

## 6. Tailwind CSS Breakpoint 規則

建議使用 Tailwind 預設 breakpoint：

| Breakpoint | 寬度 | 行為 |
|---|---:|---|
| `< sm` | `< 640px` | 手機單欄，Sidebar 隱藏 |
| `sm` | `>= 640px` | 手機 / 小平板，Sidebar 隱藏 |
| `md` | `>= 768px` | 平板，Sidebar 仍隱藏 |
| `lg` | `>= 1024px` | Sidebar 顯示 |
| `xl` | `>= 1280px` | Sidebar 顯示，內容可加寬 |

---

## 7. 驗收標準

### Desktop 驗收

- [ ] `>= 1024px` 時左側 Sidebar 顯示。
- [ ] Sidebar 不覆蓋主內容。
- [ ] 主內容區與 Sidebar 間距正常。
- [ ] Dashboard 卡片排列正常。

### Mobile 驗收

- [ ] `< 1024px` 時左側 Sidebar 隱藏。
- [ ] 主內容區寬度為完整畫面寬度。
- [ ] 頁面上方有 menu button 或 mobile navigation。
- [ ] 點擊 menu button 可開啟 Drawer / Sheet。
- [ ] 關閉 Drawer 後不影響目前頁面內容。
- [ ] `/predict` 表單在手機版可正常填寫。
- [ ] `/dashboard` 在手機版不出現水平爆版。
- [ ] `/about` 在手機版文字閱讀正常。

---

## 8. Codex 開發指令補充

```txt
請補上共用 RWD AppShell。

需求：
1. Desktop lg 以上顯示左側 Sidebar。
2. 小於 lg 時隱藏左側 Sidebar。
3. 小螢幕改用 MobileHeader + Drawer / Sheet 導航。
4. 所有子分頁都必須套用同一個 AppShell。
5. 主內容區在手機版必須是 w-full，不可被左側欄擠壓。
6. /predict、/dashboard、/about 都要通過手機版檢查。
7. npm run build 必須通過。
```

---

## 9. 結論

子分頁在手機版的核心規則：

```txt
Sidebar：hidden on mobile
Main content：w-full on mobile
Navigation：MobileHeader + Drawer
Breakpoint：lg 以上才顯示 Sidebar
```

這是本專案所有子分頁的固定 RWD 規則。
