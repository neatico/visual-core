import { test } from "node:test";
import assert from "node:assert/strict";
import {
  layoutMatrix,
  multiplyMatrix,
  flattenGroupLayout,
  layoutBounds,
  wrapCopy,
  createSceneRegistry,
  compositionFields,
  validateComposition,
  COMPOSITION_PROMPT,
} from "../dist/index.js";
const base = { x: 12, y: 20, width: 100, height: 50 };
for (const rotation of [0, 35, 90, 180])
  test(`ungroup preserves the world transform at ${rotation} degrees`, () => {
    const parent = { ...base, rotation, flipX: true, scaleX: 1.3, scaleY: 0.7 };
    const child = {
      ...base,
      x: 5,
      y: 8,
      rotation: 15,
      skewX: 12,
      id: "keep-me",
    };
    const result = flattenGroupLayout(parent, child);
    const expected = multiplyMatrix(layoutMatrix(parent), layoutMatrix(child));
    layoutMatrix(result).forEach((n, i) =>
      assert.ok(Math.abs(n - expected[i]) < 1e-8),
    );
    assert.equal(result.id, "keep-me");
  });
test("invalid transforms fail explicitly", () => {
  assert.throws(() => layoutMatrix({ ...base, width: NaN }));
  assert.throws(() => layoutMatrix({ ...base, height: -1 }));
  assert.throws(() => flattenGroupLayout({ ...base, scaleX: 0 }, base));
  assert.deepEqual(layoutBounds(base), {
    minX: 12,
    maxX: 112,
    minY: 20,
    maxY: 70,
  });
});
test("text wraps words, long tokens, and explicit line breaks", () => {
  const measure = (text) => Array.from(text).length;
  assert.deepEqual(wrapCopy("Hello world", 6, 12, false, measure), [
    "Hello",
    "world",
  ]);
  assert.deepEqual(wrapCopy("abcdef", 3, 12, false, measure), ["abc", "def"]);
  assert.deepEqual(wrapCopy("one\n\ntwo", 10, 12, false, measure), [
    "one",
    "",
    "two",
  ]);
  assert.throws(() => wrapCopy("word", 0, 12, false, measure));
  assert.throws(() => wrapCopy("word", 10, 12, false, () => NaN));
});
test("registries are isolated and support safe extension removal", () => {
  const a = createSceneRegistry(),
    b = createSceneRegistry();
  const remove = a.register("launch", (x) => ({ ...x, ready: true }));
  assert.deepEqual(a.render("launch", { title: "Hello" }), {
    title: "Hello",
    ready: true,
  });
  assert.deepEqual(b.list(), []);
  assert.throws(() => a.register("launch", () => {}));
  remove();
  a.register("launch", () => 42);
  remove();
  assert.equal(a.render("launch", {}), 42);
});


test("CommonJS consumers receive the same public API", async () => {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const commonjs = require("../dist/cjs/index.js");
  assert.equal(typeof commonjs.wrapCopy, "function");
  assert.deepEqual(commonjs.layoutMatrix({ x: 0, y: 0, width: 10, height: 10 }), [1, 0, 0, 1, 0, 0]);
});

test("mixed Chinese punctuation does not split API tokens that fit",()=>{
 const measure=text=>Array.from(text).length;
 const lines=wrapCopy("支持HTTP、SSE、WebSocket等",10,12,false,measure);
 assert.ok(lines.some(line=>line.includes("SSE")));
 assert.ok(lines.some(line=>line.includes("WebSocket")));
});

test("validateComposition accepts a minimal valid tree and exports prompt", () => {
  assert.equal(typeof COMPOSITION_PROMPT, "string");
  assert.ok(COMPOSITION_PROMPT.length > 0);
  const fields = compositionFields({ title: "Hello", body: "World" });
  assert.deepEqual(fields, { title: "Hello", body: "World" });
  const composition = validateComposition(
    {
      version: 1,
      root: {
        type: "column",
        children: [
          { type: "text", bind: "title", role: "hero" },
          { type: "text", bind: "body", role: "body" },
        ],
      },
    },
    fields,
  );
  assert.equal(composition.version, 1);
  assert.equal(composition.root.type, "column");
  assert.throws(() => validateComposition({ version: 2, root: { type: "text", bind: "title" } }, fields));
});

