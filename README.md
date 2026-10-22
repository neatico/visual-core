# @neatico/visual-core

Framework-independent building blocks for editable visual products, extracted from [Neatico](https://www.neatico.app/?utm_source=github&utm_medium=readme&utm_campaign=visual-core).

Create visuals with AI at **[neatico.app](https://www.neatico.app/?utm_source=npm&utm_medium=readme&utm_campaign=visual-core)**, or use this package to build your own editor, layout pipeline, or scene extension.

## Install

```sh
npm install @neatico/visual-core
```

This package provides native ES modules and TypeScript declarations. It uses the MIT-licensed `linebreak` package for Unicode line opportunities and does not require React, a browser, a database, or an AI provider. Node.js 20 or later is supported. CommonJS projects can use `require()` or dynamic `import()`.

## Preserve transforms when ungrouping

```ts
import { flattenGroupLayout } from "@neatico/visual-core";

const group = { x: 100, y: 50, width: 400, height: 300, rotation: 30 };
const child = { x: 20, y: 30, width: 120, height: 60, rotation: 15 };
const ungrouped = flattenGroupLayout(group, child);
```

Coordinates are in logical canvas units. Rotations and skew angles are in degrees. Transforms use the center of the element as their origin. `flattenGroupLayout` preserves additional child properties and returns a new object. It supports translation, rotation, scaling, skew, and horizontal or vertical flips. Nonfinite values, negative dimensions, and degenerate ungrouping transforms fail explicitly.

Additional exports include `layoutMatrix`, `multiplyMatrix`, `layoutBounds`, and the `Layout` and `Matrix` types. Matrices use the six-value CSS affine format `[a, b, c, d, e, f]`.

## Wrap text using your font measurements

```ts
import { wrapCopy } from "@neatico/visual-core";

const context = document.createElement("canvas").getContext("2d")!;
await document.fonts.load("400 24px Inter");
const lines = wrapCopy(
  "One idea. Every format.",
  240,
  24,
  false,
  (text, size, bold) => {
    context.font = `${bold ? 700 : 400} ${size}px Inter`;
    return context.measureText(text).width;
  },
);
```

Supply measurements for the actual font used by your renderer. Explicit line breaks are preserved. Break opportunities follow UAX #14 through [linebreak](https://github.com/foliojs/linebreak) (Unicode 13); oversized tokens use grapheme boundaries where `Intl.Segmenter` is available. A grapheme wider than the available line fails explicitly. Tiny trailing lines are balanced without adding lines; pass `{ balance: false }` as the sixth argument to disable this. Titles may opt into `{ keepWords: true, preferClauseBreaks: true }` to respect available word segmentation and a fitting topic prefix before a colon. Dictionary segmentation is language-dependent and is not a semantic guarantee. Hyphenation, font shaping and cross-device font installation remain the renderer’s responsibility. Returned lines are plain text; escape them before inserting them into HTML.

## Add custom scenes

```ts
import { createSceneRegistry } from "@neatico/visual-core";

type Brief = { headline: string };
type Scene = { text: string; accent: string };
const scenes = createSceneRegistry<Brief, Scene>();
const unregister = scenes.register("product-launch", (brief) => ({
  text: brief.headline,
  accent: "#6950e8",
}));
const scene = scenes.render("product-launch", {
  headline: "Meet your next idea.",
});
unregister();
```

Registries are isolated instances. Duplicate names and unknown scenes throw errors. Renderers own their input validation and output format, so you can return your own canvas schema, SVG tree, or other representation. Async renderers are supported by choosing a promise as the output type. No global registry is created.

## Development

```sh
npm ci
npm test
npm pack --dry-run
```

Tests cover transform equivalence, invalid geometry, text wrapping, and extension isolation. `npm pack` runs the build and tests before assembling the package. Only compiled output, this README, and the license are published.

## Contributing

Open an issue or pull request at [neatico/visual-core](https://github.com/neatico/visual-core). Include a minimal reproduction and a regression test. Keep APIs independent of application state and use American English in documentation and code comments.

## License

MIT. See [LICENSE](./LICENSE).

## Portable template blueprints

`validateBlueprint` accepts a versioned, data-only template with an `id`, localized
`labels` (including `en` as the fallback), required `fields`, supported `ratios`,
and a `composition`. Every required field must be bound exactly once. The
composition validator returns only supported structural properties; executable
markup and arbitrary style properties are not part of this contract.

```ts
import { createBlueprintRegistry, blueprintLabel } from '@neatico/visual-core';

const catalog = createBlueprintRegistry();
const unregister = catalog.register({
  version: 1,
  id: 'editorial-introduction',
  labels: { en: 'Editorial introduction', zh: '编辑式导言' },
  fields: ['title', 'body'],
  ratios: [1, 16 / 9],
  composition: {
    version: 1,
    root: { type: 'column', children: [
      { type: 'text', bind: 'title', role: 'hero' },
      { type: 'text', bind: 'body', role: 'body' },
    ] },
  },
});
const choices = catalog.find(['title', 'body'], 16 / 9);
const name = blueprintLabel(choices[0], 'zh-CN');
unregister();
```

Registries are isolated, reject duplicate IDs, and return defensive copies.
Field matching is exact: a template cannot silently omit extra user content.
Locale lookup tries the exact locale, then its language, then English.

Structural validation is not visual approval. Before registering AI-authored
blueprints in a production catalog, the host must render representative samples
at every supported ratio with the actual font metrics and check bounds, text
collisions, readability, and content preservation. The host also owns persistence,
workspace permissions, review status, and migration between blueprint versions.

## Content-aware layout eligibility (0.6)

`LAYOUT_CONTRACTS` covers all 97 slide and 97 social IDs with semantic intent,
item capacity, required fields and ratio bounds. `eligibleLayouts` filters the
catalog, and `layoutCandidates` returns a bounded deterministic shortlist.
These are structural eligibility checks, not a guarantee that arbitrary copy
fits. Hosts must measure emitted geometry, verify all source fields remain
visible and reject or paginate unreadable output. No text is rewritten here.

Blueprints may declare `intents` (0.8.0), such as `['cover']` for presentation layouts or `['features']` for social scenes. Registry lookup accepts the semantic intent as its third argument and excludes scoped templates when the intent is absent or incompatible. Omit this property only for deliberately generic layouts. This keeps identical field shapes from turning a cover-only layout into a closing slide or unrelated social format.
