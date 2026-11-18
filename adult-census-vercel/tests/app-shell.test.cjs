const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function renderLayout(pathname) {
  const root = path.resolve(__dirname, "..");
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
      },
    }).outputText;
    const nativeRequire = createRequire(filename);
    function localRequire(id) {
      if (id.endsWith(".css")) return {};
      if (id === "next/navigation") return { usePathname: () => pathname };
      if (id === "next/link") return (props) => React.createElement("a", props);
      if (id.startsWith(".") || id.startsWith("@/")) {
        const base = id.startsWith("@/") ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
        for (const extension of [".ts", ".tsx"]) {
          if (fs.existsSync(base + extension)) return load(base + extension);
        }
      }
      return nativeRequire(id);
    }
    vm.runInNewContext(source, {
      require: localRequire, module: loaded, exports: loaded.exports,
    }, { filename });
    return loaded.exports;
  }
  const Layout = load(path.join(root, "app/layout.tsx")).default;
  return renderToStaticMarkup(React.createElement(Layout, null,
    React.createElement("h1", null, "Synthetic page content")));
}

for (const route of ["/predict", "/dashboard", "/about"]) {
  test(`${route}: shared shell exposes labelled menu, dialog, sidebar and current route`, () => {
    const html = renderLayout(route);
    const trigger = html.match(/<button\b[^>]*aria-label="Open navigation"[^>]*>/)?.[0];
    assert.ok(trigger, "a keyboard-operable navigation menu is available");
    assert.match(trigger, /aria-expanded="false"/);
    const target = trigger.match(/aria-controls="([^"]+)"/)?.[1];
    assert.ok(target, "menu identifies the controlled navigation dialog");
    const dialog = html.match(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/)?.[0];
    assert.ok(dialog, "native modal navigation is present");
    assert.ok(dialog.includes(`id="${target}"`));
    assert.match(dialog, /aria-labelledby="([^"]+)"/);
    const aside = html.match(/<aside\b[^>]*>[\s\S]*?<\/aside>/)?.[0];
    assert.ok(aside, "desktop sidebar is available");
    for (const fragment of [dialog, aside]) {
      for (const href of ["/", "/predict", "/dashboard", "/about"]) {
        assert.ok(fragment.includes(`href="${href}"`), `${href} is reachable`);
      }
      const anchors = fragment.match(/<a\b[^>]*>/g) || [];
      const active = anchors.filter((a) => a.includes('aria-current="page"'));
      assert.equal(active.length, 1);
      assert.ok(active[0].includes(`href="${route}"`));
    }
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.match(html, /<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    assert.match(html, /href="#main-content"/);
    assert.ok(html.includes("Synthetic page content"));
    assert.ok(html.includes("Not intended for real-world decisions."));
  });
}

test("home keeps full-width content and accessible navigation without a subpage sidebar", () => {
  const html = renderLayout("/");
  assert.doesNotMatch(html, /<aside\b/);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  for (const route of ["/predict", "/dashboard", "/about"]) {
    assert.ok(html.includes(`href="${route}"`));
  }
});
