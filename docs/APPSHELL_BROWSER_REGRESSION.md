# Dashboard responsive regression

This is an actual browser layout regression, not a class-name assertion.

Original requirement: `RWD_Sidebar_REQUIREMENT_v1_0.md` §5: Dashboard cards become single-column on phones. Required mobile widths:320px and390px. Expected card columns:1, in both loading and populated states.

Use only `adult-census-vercel/tests/fixtures/dashboard-rwd.json`; all records and scores are synthetic. Do not insert fixture records into a database or invoke prediction/model execution.

In the connected browser, open the locally built `/dashboard`. Scope CDP Fetch request interception to `/api/model-meta*` and `/api/prediction-logs*`, non-Document requests only. Leave the browser controller's Document interceptions alone.

1. Reload the fixture tab with the two API responses paused. At320px then390px, read the metric-grid children's bounding rectangles. Count unique rounded `left` positions; expect1with4children. This verifies the loading state.
2. Fulfil only those two requests using the JSON fixture's `modelMeta` and `predictionLogs`. Wait for the table to appear, then repeat the positions assertion. This verifies the populated state.
3. At each mobile width, require document scrollWidth<=clientWidth+1. Require2table rows and an `overflow-x:auto` table wrapper whose scrollWidth exceeds clientWidth for the intentionally long synthetic model version. Horizontal overflow belongs to the table wrapper, not the page.
4. Keyboard-scroll the populated table and confirm its own scrollLeft changes, without page overflow.
5. Clear interception with `Fetch.enable({patterns:[]})` and reset the viewport. Do not retain fixture responses as a real model evaluation or user data.

DOM measurement used in the actual regression:

```js
const grid = document.querySelector('main section .grid');
const cells = [...grid.children].map(e => e.getBoundingClientRect());
const columns = new Set(cells.map(r => Math.round(r.left))).size;
const table = document.querySelector('main table');
const wrapper = table.parentElement;
// Require columns===1 and cells.length===4 on mobile, both states.
// Read wrapper/client/document dimensions to establish overflow containment.
```

Before the fix, all4mobile column observations returned2rather than1. Evidence is retained in `METRIC_COLUMNS_RED.json`. After the fix, record the same observations in `METRIC_COLUMNS_GREEN.json` and merge the passing assertions into `BROWSER_FINAL_CASES.json`. Reports must retain the RED artifact and distinguish actual final verification from a reviewer's read-only assessment.
