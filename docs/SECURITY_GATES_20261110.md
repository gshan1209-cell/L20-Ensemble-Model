# L20 security gate update — 2026-11-10

This local continuation starts at PR #2 HEAD `4956a192b2cba2579155ed751d24bf6f86c1d178`.
It does not approve merging, deployment, or closure of Trello card Z364csbx.

## Upstream recheck

The official stable release is now Next 16.4.6 (November 9). Its registry tarball
was checked against the registry SHA-512 integrity value. Its compiled
`loader-utils3/index.js` and `zod/index.cjs` have exactly the same SHA-256 hashes
as installed Next 16.4.5. Updating to that release does not resolve these gates.

| Finding | Current evidence | Required upstream repair |
| --- | --- | --- |
| GHSA-3rfm-jhwj-7488 / CVE-2022-37603 | Next's versionless compiled loader-utils3 retains the 3.1.3-era interpolation pattern; 16.4.6 bytes are identical. | Bundle the equivalent of loader-utils >=3.2.1. |
| GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404 | Next's versionless compiled legacy Zod still continues array element parsing after the maximum-size check fails; 16.4.6 bytes are identical. | Upstream bundled repair equivalent to the advisory's Zod >=4.6.6 behavior, verified against the actual artifact. |
| GHSA-g3hv-75wg-m249 / CVE-2026-118764 | Installed typescript-estree 8.72.1 uses nested minimatch 10.2.6. Latest 8.72.2 still declares ^10.2.2; no compatible patched 10.x is published. | Advisory fix >=11.0.1 through a compatible upstream dependency change. |

The application's direct Zod 4.6.7 does not replace `next/dist/compiled/zod`.
No vendor editing, cross-major override, manifest change, or lockfile change was
made. ESLint 9's existing EOL exception also remains open, separate from a CVE.

The fresh audit reports seven moderate nodes, all in the nested app's development
tree: typescript-eslint, @typescript-eslint/eslint-plugin, parser, type-utils,
typescript-estree, utils, and its nested minimatch. They represent the same
minimatch advisory propagated through the dependency graph. Compared with the
historical eight-node result, eslint-config-next is no longer a flagged audit
node; it remains installed at exactly 16.4.5, and the locks are unchanged. This is
a difference in the returned audit graph, not a dependency repair. The fresh
`fixAvailable: true` metadata is not a verified compatible upstream target: the
registry snapshot still has estree ^10.2.2 and no fixed minimatch 10.x. The root
launcher has no dependencies. Production audit zero does not cover vendored code.

Sources: [Next 16.4.6 release](https://github.com/vercel/next.js/releases/tag/v16.4.6),
[support policy](https://nextjs.org/support-policy),
[loader-utils advisory](https://github.com/advisories/GHSA-3rfm-jhwj-7488),
[Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5),
[minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Added application boundary

`POST /api/predict` now requires `Content-Type: application/json` (charset allowed)
and accepts at most 8192 UTF-8 bytes. It rejects an oversized declared length
before reading; it also counts actual streamed bytes and cancels an oversized
stream before JSON/schema parsing. Exactly 8192 bytes are accepted. Empty,
malformed, and invalid UTF-8 JSON return a static 400 response. Wrong media type
returns 415; excess bytes return 413; schema failures retain 422.

This changes malformed JSON from 500 to 400. Valid predictions, probability
consistency, educational provenance, and absence of prediction persistence remain
covered by the full unit suite. Errors do not echo or log request contents.

This is a limit on this JSON API only. It does not repair Next's bundled Zod,
RSC/server-action parsers, build loaders, framework buffering, or slow connections.
It is not grounds to close either Important finding.

Two additional tooling tests inspect the real ESLint effective configuration and
the installed estree-resolved minimatch. The current configuration does not enable
projectService; the observed `{dot:true}` options do not enter the advisory's
optimization-level-2 phase. A finite benign positive control confirms the probe
detects that phase when explicitly enabled. This is bounded reachability evidence,
not a claim that every potential minimatch use is safe.

Fresh build instrumentation observed four process loads of compiled loader-utils3
and three `interpolateName` calls. Their templates were `[contenthash]`,
`[name].[ext]`, and `static/chunks/polyfills-[hash].js`. The function is therefore
reachable during this build; these observed templates are trusted build inputs.
No request-to-template path or production exploit was demonstrated. Production
runtime reachability remains unverified because the full build did not complete.

## Fresh validation and limits

From `adult-census-vercel`: `npm ci --ignore-scripts --no-audit --no-fund`,
`node node_modules/prisma/build/index.js generate`, `npm test`, `npm run lint`,
`npm run typecheck`, `npm audit --omit=dev --json`, `npm audit --json`.
The root forwards `npm run build` to the app, using one build worker and an isolated
D-drive temp/cache. All input and test fixtures are synthetic.

The fresh suite contains 44 tests: the prior 33 plus nine request-boundary tests
and two tooling tests. Historical 26/26, 12 HTTP cases, and AppShell browser results
are not fresh validation of this candidate.

The fresh build compiled and passed its TypeScript phase, but failed while
prerendering `/_global-error`: EPERM creating
`.next/server/app/_global-error.segments/_global-error`. A separate isolated
playwright-core installation failed with EBUSY unlinking its npm cache file.
Neither operation was routed through another tool, directory, ACL change, or
process termination. Fresh compiled HTTP and desktop/mobile browser checks are
therefore NOT_RUN. The prepared finite local HTTP checks are reviewable artifacts,
not PASS evidence.

Remaining gates: repair/resolve the local build environment and rerun fresh
production-mode HTTP/browser checks; dot's independent verification; upstream
fixes or a precise, time-bounded Owner risk decision; review of the full PR #2
scope; final-main CI; trusted-model/DB/target-host verification; unresolved F5
outcome and text-only zoom/cross-browser checks; and explicit deployment/rollback
authorization. Existing F5 uncertainty was not retried. No production data,
models, credentials, Trello/GitHub state, or deployment was modified.
