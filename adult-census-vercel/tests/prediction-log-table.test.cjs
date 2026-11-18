const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../components/PredictionLogsTable.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  fileName: filename,
  compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  },
}).outputText;
const loaded = { exports: {} };
vm.runInNewContext(compiled, {
  require: createRequire(filename), module: loaded, exports: loaded.exports,
}, { filename });
const Table = loaded.exports.default;
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/dashboard-rwd.json"), "utf8"));

test("populated prediction logs expose a labelled keyboard-focusable scroll region", () => {
  const html = renderToStaticMarkup(React.createElement(Table, {
    logs: fixture.predictionLogs.items, total: 2, loading: false,
  }));
  const region = html.match(/<div\b[^>]*role="region"[^>]*>/)?.[0];
  assert.ok(region, "the scroll area is discoverable as a region");
  assert.match(region, /aria-label="Prediction logs table"/);
  assert.match(region, /tabindex="0"/, "keyboard users can enter and scroll the region");
  assert.equal((html.match(/<tr\b/g) || []).length, 3);
});

test("empty logs retain their message without an empty keyboard stop", () => {
  const html = renderToStaticMarkup(React.createElement(Table, { logs: [], total: 0, loading: false }));
  assert.ok(html.includes("No prediction logs yet."));
  assert.doesNotMatch(html, /tabindex="0"/);
});

test("loading logs do not expose an unusable scroll region", () => {
  const html = renderToStaticMarkup(React.createElement(Table, { logs: [], total: 0, loading: true }));
  assert.doesNotMatch(html, /role="region"|<table\b|tabindex="0"/);
});
