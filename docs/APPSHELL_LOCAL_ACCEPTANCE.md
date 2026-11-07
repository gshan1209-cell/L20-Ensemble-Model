# Responsive AppShell: original requirements and local verification

Status: local verification complete; GitHub review and user acceptance are separate gates. No merge or deployment is authorized by this report.

## Original request

- GitHub issue1: https://github.com/gshan1209-cell/L20-Ensemble-Model/issues/1 (read open2026-11-07).
- Authoritative requirement: [RWD_Sidebar_REQUIREMENT_v1_0.md](RWD_Sidebar_REQUIREMENT_v1_0.md), unchanged.
- Repository constraints: `AGENT.md` and `adult-census-vercel/AGENTS.md`.
- Latest user instruction:「變更測試驗證完要上傳git等待驗收」. Publish a verified independent branch/Draft PR; wait for acceptance before merge or deployment.
- Current work is system development. Image generation belongs to dots; no generated images are part of this change.

The original issue requires a shared AppShell for `/predict`, `/dashboard` and `/about`; a sidebar at1024px and above; hidden sidebar and full-width main below1024px; mobile header/drawer navigation; a passing production build. Desktop sidebar must not cover content. Mobile form, dashboard and About text must remain usable, without unintended page overflow.

## Change and traceability

RootLayout renders one common AppShell instead of its always-visible header links. One route collection feeds the home navigation, desktop sidebar and mobile drawer. Native dialog provides the modal; explicit first/last Tab handling keeps keyboard focus inside it. Escape, Close, backdrop, same-route selection, route changes and desktop resizing close the drawer and restore scrolling. A skip link targets the single focusable main landmark.

Existing page contents, API/model logic and fairness notices remain intact. No dependency or lockfile was changed by the AppShell increment. It starts from the existing unmerged dependency candidate7fcf646157bc45da79ad6c238c6b94cb0dd5edf7; that candidate includes the prior probability fix. A PR against current main46f23c298da353ded39aca4cfa000c8df29589f4 therefore includes those earlier candidates too; the PR must name them and retain their security release holds.

## Fresh verification

| Check | Result |
| --- | --- |
| Existing baseline |26/26unit tests PASS on the intact exact base |
| RED semantic regressions |3subpage tests failed on missing menu; home test passed |
| Final unit suite |30/30PASS:26existing plus4shell semantics tests |
| ESLint / TypeScript |PASS, exit0 |
| Next production build |PASS, exit0;10/10static-generation jobs completed |
| Browser layout matrix |18/18PASS:3routes at320,390,768,1023,1024,1440px |
| Browser total |38/38final checks PASS, including modal focus/Tab/reverseTab, five Escape cycles, Close, backdrop, same-route input retention, links, Back/Forward with open drawer, resize and skip link |
| Composed screenshots |1440x1000desktop;390x844mobile and open drawer; captured with same-target CDP and visually reviewed |

Runtime QA used only synthetic form edits and no prediction submission. DATABASE_URL was absent from the preview process. There was no real-model execution, training, real user log import or live DB configuration.

## Retained failed observations and limits

- An initial dependency-copy race caused a missing-TypeScript setup failure. It was not a product regression or a TDD RED. The intact baseline then passed26tests.
- The first browser Tab traversal reached the browser-chrome boundary. FOCUS_RED.json retains the observation; explicit first/last handling then passed ten forward Tabs and reverseTab in the actual browser.
- One initial Escape assertion sampled React's pending close cleanup after a fixed150ms. The record remains in BROWSER_CASES.json. A bounded condition wait replaced that timing assumption; all five final Escape cycles restored scrolling and focus. No product change was made to conceal that observation.
- The F5 locator action timed out. Its completion was not confirmed and it was not retried. Follow-up UI was readable with the drawer closed; F5 is not counted among the38passing checks.
- Actual200%text-only zoom and a real-device Safari/Firefox matrix are NOT_RUN;320px reflow is separately verified, not a substitute claim.
- Existing dependency candidate release holds remain: two Important vendored-Next findings and the recorded moderate dev dependency chain. This navigation PR is not a security-release approval or an all-greenCI claim.
- No fresh audit, target-host acceptance, true-model validation, remoteCI, merge or deployment is claimed. User acceptance remains pending.

## Evidence

Evidence root: `D:/AI/.codex-tmp/l20-appshell-20261107/`.

`APPSHELL_RED.log`, `APPSHELL_GREEN.log`, `UNIT_FINAL.log`, `LINT_FINAL.log`, `TYPECHECK_FINAL.log`, `BUILD_FINAL.log`, `BROWSER_RED.json`, `FOCUS_RED.json`, `FOCUS_GREEN.json`, `BROWSER_CASES.json`, `BROWSER_FINAL_CASES.json`, `REFRESH_OBSERVATION.json`, `BASELINE_MOBILE.png`, `DESKTOP.png`, `MOBILE.png`, `MOBILE_DRAWER.png`.

The immutable final SHA, fresh independent review, GitHub PR and delivery readback belong to the external final attestation to avoid a self-referential source hash. Keep code checks, browser acceptance, publishing and user acceptance distinct.

Implementation references: [Next usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname) and [native dialog reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog); the matching installed Next documentation was read before code changes.
