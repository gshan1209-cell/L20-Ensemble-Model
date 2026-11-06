const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const { format } = require("node:util");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
// Run the real route/component without adding a test framework or exporting
// route internals. Only model availability, Python and persistence are doubles.
function loadTs(relativePath, overrides = {}, output = []) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    const nativeRequire = createRequire(filename);
    function localRequire(id) {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (id.startsWith("@/") || id.startsWith(".")) {
        const base = id.startsWith("@/")
          ? path.join(root, id.slice(2))
          : path.resolve(path.dirname(filename), id);
        for (const extension of [".ts", ".tsx"]) {
          if (fs.existsSync(base + extension)) return load(base + extension);
        }
      }
      return nativeRequire(id);
    }
    const logger = Object.fromEntries(
      ["log", "warn", "error"].map((level) => [level, (...args) => output.push(args)])
    );
    vm.runInNewContext(
      compiled,
      { require: localRequire, module: loadedModule, exports: loadedModule.exports, process, console: logger },
      { filename }
    );
    return loadedModule.exports;
  }
  return load(path.join(root, relativePath));
}

// Synthetic fixtures only; never read training data or a real user's request.
const input = {
  age: 30, workclass: "Private", education: "HS-grad",
  marital_status: "Never-married", occupation: "Adm-clerical",
  relationship: "Not-in-family", race: "White", sex: "Female",
  capital_gain: 0, capital_loss: 0, hours_per_week: 40,
  native_country: "United-States",
};
function setup({ modelExists = false, python } = {}) {
  const writes = [];
  const output = [];
  const route = loadTs("app/api/predict/route.ts", {
    fs: { ...fs, existsSync: () => modelExists },
    child_process: {
      execSync: python || (() => { throw new Error("unexpected Python invocation"); }),
    },
    "@/lib/db": { prisma: { predictionLog: { create: async (data) => writes.push(data) } } },
  }, output);
  return {
    writes, output,
    async post(overrides = {}) {
      const response = await route.POST(new Request("http://localhost/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ...overrides }),
      }));
      return { status: response.status, body: await response.json() };
    },
    route,
  };
}
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
}
function consistent(result) {
  const weights = Object.values(result.class_probabilities);
  assert.equal(weights.length, 2);
  for (const weight of weights) assert.ok(Number.isFinite(weight) && weight >= 0 && weight <= 1);
  close(weights.reduce((sum, value) => sum + value, 0), 1);
  close(result.probability, result.class_probabilities[result.prediction]);
  assert.ok(result.probability >= Math.max(...weights));
}

// Hand-calculated expectations catch reversed classes and the > 0.5 tie rule.
const scores = [
  ["0 / low", {}, "<=50K", 0.8, 0.2],
  ["1 / below threshold", { age: 36 }, "<=50K", 0.65, 0.35],
  ["2 / exact threshold", { age: 36, education: "Bachelors" }, "<=50K", 0.5, 0.5],
  ["3 / above threshold", { age: 36, education: "Bachelors", hours_per_week: 41 }, ">50K", 0.35, 0.65],
  ["4", { age: 36, education: "Bachelors", capital_gain: 5001 }, ">50K", 0.2, 0.8],
  ["5 / high", { age: 36, education: "Bachelors", hours_per_week: 41, capital_gain: 5001 }, ">50K", 0.05, 0.95],
];
for (const [name, values, label, low, high] of scores) {
  test(`missing model: score ${name} has coherent label and weights`, async () => {
    const { status, body } = await setup().post(values);
    assert.equal(status, 200);
    assert.equal(body.prediction, label);
    close(body.class_probabilities["<=50K"], low);
    close(body.class_probabilities[">50K"], high);
    consistent(body);
  });
}
for (const [name, values, high] of [
  ["age at cutoff", { age: 35 }, 0.2],
  ["hours at cutoff", { hours_per_week: 40 }, 0.2],
  ["hours above cutoff", { hours_per_week: 41 }, 0.35],
  ["education below cutoff", { education: "Assoc-acdm" }, 0.2],
  ["education at cutoff", { education: "Bachelors" }, 0.35],
  ["capital gain at cutoff", { capital_gain: 5000 }, 0.2],
  ["capital gain above cutoff", { capital_gain: 5001 }, 0.5],
]) {
  test(`heuristic feature boundary: ${name}`, async () => {
    const { body } = await setup().post(values);
    close(body.class_probabilities[">50K"], high);
    consistent(body);
  });
}
test("missing model explicitly identifies a teaching heuristic", async () => {
  const { body } = await setup().post();
  assert.equal(body.prediction_source, "heuristic");
  assert.equal(body.fallback_reason, "model_missing");
  assert.match(body.notice, /not model probabilities/i);
});
for (const [name, python] of [
  ["exception", () => { throw new Error("SYNTHETIC_PRIVATE_INPUT failed command"); }],
  ["500 status", () => Buffer.from(JSON.stringify({ statusCode: 500, body: JSON.stringify({ error: "inference failed" }) }))],
  ["invalid JSON", () => Buffer.from("invalid JSON")],
]) {
  test(`Python ${name} returns a coherent heuristic with failure provenance`, async () => {
    const harness = setup({ modelExists: true, python });
    const { status, body } = await harness.post();
    assert.equal(status, 200);
    assert.equal(body.prediction_source, "heuristic");
    assert.equal(body.fallback_reason, "python_inference_failed");
    assert.match(body.notice, /not model probabilities/i);
    consistent(body);
  });
}
const modelResult = {
  prediction: "<=50K", probability: 0.73,
  class_probabilities: { "<=50K": 0.73, ">50K": 0.27 },
  model_version: "synthetic-model-v1", created_at: "2026-11-06T00:00:00Z",
};
function pythonSuccess() {
  return Buffer.from(JSON.stringify({ statusCode: 200, body: JSON.stringify(modelResult) }));
}
test("successful Python response is labelled model and preserves its probabilities", async () => {
  const { status, body } = await setup({ modelExists: true, python: pythonSuccess }).post();
  assert.equal(status, 200);
  assert.equal(body.prediction_source, "model");
  assert.equal(body.fallback_reason, undefined);
  assert.equal(body.model_version, "synthetic-model-v1");
  assert.deepEqual(body.class_probabilities, modelResult.class_probabilities);
  consistent(body);
});
test("legacy logging flag cannot persist prediction data on either source path", async () => {
  const original = process.env.ENABLE_PREDICTION_LOGS;
  process.env.ENABLE_PREDICTION_LOGS = "true";
  try {
    for (const config of [{}, { modelExists: true, python: pythonSuccess }]) {
      const harness = setup(config);
      await harness.post();
      assert.equal(harness.writes.length, 0);
    }
  } finally {
    if (original === undefined) delete process.env.ENABLE_PREDICTION_LOGS;
    else process.env.ENABLE_PREDICTION_LOGS = original;
  }
});
test("Python exceptions cannot echo private input to application logs", async () => {
  const harness = setup({ modelExists: true, python: () => { throw new Error("SYNTHETIC_PRIVATE_INPUT"); } });
  await harness.post();
  assert.doesNotMatch(harness.output.map((args) => format(...args)).join("\n"), /SYNTHETIC_PRIVATE_INPUT/);
});
test("failing inference subprocess cannot echo stderr to server logs", async () => {
  // Use a real child process to catch execSync's implicit stderr forwarding
  // when stdio is omitted. No Python/ML installation or real input is needed.
  const { execSync } = require("node:child_process");
  const originalWrite = process.stderr.write;
  let stderr = "";
  let subprocessStatus;
  process.stderr.write = (chunk) => { stderr += chunk.toString(); return true; };
  try {
    const harness = setup({ modelExists: true, python: (_command, options) => {
      try {
        return execSync('node -e "process.stderr.write(\'SYNTHETIC_PRIVATE_INPUT\');process.exit(7)"', options);
      } catch (error) {
        subprocessStatus = error.status;
        throw error;
      }
    } });
    const { body } = await harness.post();
    assert.equal(body.prediction_source, "heuristic");
    assert.equal(subprocessStatus, 7);
    assert.doesNotMatch(stderr, /SYNTHETIC_PRIVATE_INPUT/);
  } finally {
    process.stderr.write = originalWrite;
  }
});
test("invalid input still returns 422 instead of a fallback prediction", async () => {
  const { status, body } = await setup().post({ age: 16 });
  assert.equal(status, 422);
  assert.equal(body.prediction, undefined);
});
test("malformed request still returns a generic error", async () => {
  const harness = setup();
  const response = await harness.route.POST(new Request("http://localhost/api/predict", {
    method: "POST", body: "invalid JSON", headers: { "Content-Type": "application/json" },
  }));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Prediction service is temporarily unavailable" });
});
const Card = loadTs("components/PredictionResultCard.tsx").default;
function render(result) {
  return renderToStaticMarkup(React.createElement(Card, { result, loading: false, error: null }));
}
test("heuristic API results render teaching weights without a confidence claim", async () => {
  const { body } = await setup().post();
  const html = render(body);
  assert.match(html, /Educational heuristic/i);
  assert.match(html, /not model probabilities/i);
  assert.match(html, /Heuristic score/i);
  assert.match(html, /Heuristic class weights/i);
  assert.doesNotMatch(html, />Confidence<|Model confidence|Class probabilities/i);
  assert.match(html, /80\.0%/);
  assert.match(html, /employment.*eligibility.*lending/i);
});
test("model results render explicit model provenance and usage limits", () => {
  const html = render({ ...modelResult, prediction_source: "model" });
  assert.match(html, /Trained model/i);
  assert.match(html, /Model confidence/i);
  assert.match(html, /73\.0%/);
  assert.match(html, /employment.*eligibility.*lending/i);
});
test("legacy response without provenance is not presented as a verified model", () => {
  const html = render(modelResult);
  assert.match(html, /source unavailable/i);
  assert.doesNotMatch(html, /Trained model|Model confidence/i);
});
