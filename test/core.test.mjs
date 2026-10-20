import { test } from "node:test";
import assert from "node:assert/strict";
import {
  layoutMatrix,
  multiplyMatrix,
  flattenGroupLayout,
  layoutBounds,
  wrapCopy,
  createSceneRegistry,
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
