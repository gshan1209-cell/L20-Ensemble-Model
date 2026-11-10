const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const { ESLint } = require("eslint");

test("actual ESLint config keeps the project-service default-project glob path disabled", async () => {
  const eslint = new ESLint();
  const config = await eslint.calculateConfigForFile(path.resolve(__dirname, "../app/api/predict/route.ts"));
  const options = config.languageOptions.parserOptions;
  assert.ok(!options.projectService, "enabling projectService requires a new minimatch reachability review");
});

test("installed estree minimatch dot-only options do not enter the amplification phase", () => {
  const estreeRequire = createRequire(require.resolve("@typescript-eslint/typescript-estree"));
  const { Minimatch } = estreeRequire("minimatch");
  const original = Minimatch.prototype.firstPhasePreProcess;
  assert.equal(typeof original, "function");
  let calls = 0;
  Minimatch.prototype.firstPhasePreProcess = function (...args) {
    calls++;
    return original.apply(this, args);
  };
  try {
    const normal = new Minimatch("src/**/*.ts", { dot: true });
    assert.equal(normal.match("src/synthetic.ts"), true);
    assert.equal(calls, 0);
    new Minimatch("src/**/*.ts", { dot: true, optimizationLevel: 2 });
    assert.ok(calls > 0, "positive control proves this probe observes the relevant phase");
  } finally {
    Minimatch.prototype.firstPhasePreProcess = original;
  }
});
