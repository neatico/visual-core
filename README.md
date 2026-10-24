<div align="center">
  <a href="https://www.neatico.com/?utm_source=npm&utm_medium=readme&utm_campaign=visual-core">
    <img src="https://www.neatico.com/brand/neatico-logo.svg" width="240" alt="Neatico" />
  </a>
  <h1>@neatico/visual-core</h1>
  <p>Framework-independent geometry, measured text wrapping, and extensible scene registries for visual editors.</p>
  <p>
    <a href="https://www.npmjs.com/package/@neatico/visual-core"><img src="https://img.shields.io/npm/v/@neatico/visual-core.svg?style=flat-square&label=npm" alt="npm version" /></a>
    <a href="https://github.com/neatico/visual-core"><img src="https://img.shields.io/badge/source-github-111827?style=flat-square" alt="source" /></a>
    <img src="https://img.shields.io/badge/license-MIT-10b981?style=flat-square" alt="license: MIT" />
    <img src="https://img.shields.io/badge/node-%3E%3D20-6366f1?style=flat-square" alt="node >=20" />
  </p>
</div>

---

`@neatico/visual-core` is the layout engine that powers Neatico's AI design canvas. It is pure, data-first, and free of React, the DOM, a database, and any AI provider — so you can run it on a server, in a worker, or inside your own editor.

It provides the pieces a serious visual editor needs:

- **Affine geometry** — group/child transforms that survive ungrouping.
- **Measured text wrapping** — UAX #14 line breaks driven by *your* font metrics.
- **Source-backed content model** — validate untrusted AI output without trusting generated code or asset URLs.
- **Data-only compositions & blueprints** — portable, versioned layout descriptions with no executable markup.
- **Layout eligibility** — 97 presentation and 97 social layouts with semantic contracts.
- **Themes, fonts, and pagination** — deterministic token sets and lossless content splitting.

## Installation

```sh
npm install @neatico/visual-core
```

Ships as native ES modules, CommonJS, and TypeScript declarations. Requires Node.js 20+ (the only runtime dependency is the MIT-licensed [`linebreak`](https://github.com/foliojs/linebreak) for Unicode line opportunities).

## Contents

- [Preserve transforms when ungrouping](#preserve-transforms-when-ungrouping)
- [Wrap text with your font measurements](#wrap-text-with-your-font-measurements)
- [Add custom scenes](#add-custom-scenes)
- [Validate AI-authored content](#validate-ai-authored-content)
- [Validate compositions and blueprints](#validate-compositions-and-blueprints)
- [Select layout candidates](#select-layout-candidates)
- [Paginate without losing content](#paginate-without-losing-content)
- [Themes, fonts, and fingerprints](#themes-fonts-and-fingerprints)
- [API surface](#api-surface)

## Preserve transforms when ungrouping

```ts
import { flattenGroupLayout } from "@neatico/visual-core";

const group = { x: 100, y: 50, width: 400, height: 300, rotation: 30 };
const child = { x: 20, y: 30, width: 120, height: 60, rotation: 15 };
const ungrouped = flattenGroupLayout(group, child);
```

Coordinates are in logical canvas units; rotations and skew are in degrees with the element center as the origin. `flattenGroupLayout` preserves additional child properties and returns a new object. It supports translation, rotation, scaling, skew, and horizontal/vertical flips. Nonfinite values, negative dimensions, and degenerate transforms fail explicitly.

Also exported: `layoutMatrix`, `multiplyMatrix`, `layoutBounds`, plus the `Layout` and `Matrix` types. Matrices use the six-value CSS affine format `[a, b, c, d, e, f]`.

## Wrap text with your font measurements

```ts
import { wrapCopy } from "@neatico/visual-core";

const ctx = document.createElement("canvas").getContext("2d")!;
await document.fonts.load("400 24px Inter");

const lines = wrapCopy(
  "One idea. Every format.",
  240,
  24,
  false,
  (text, size, bold) => {
    ctx.font = `${bold ? 700 : 400} ${size}px Inter`;
    return ctx.measureText(text).width;
  },
);
```

You supply measurements for the actual font the renderer uses. Explicit line breaks are preserved; opportunities follow UAX #14 (Unicode 13), oversized tokens use grapheme boundaries via `Intl.Segmenter`, and a grapheme wider than the line fails rather than silently clipping. Tiny trailing lines are balanced unless you pass `{ balance: false }`. Titles can use `{ keepWords: true, preferClauseBreaks: true }`. Returned lines are plain text — escape them before inserting into HTML.

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

const scene = scenes.render("product-launch", { headline: "Meet your next idea." });
unregister();
```

Each registry is isolated; duplicate names and unknown scenes throw. Renderers own their input validation and output schema, so async renderers and custom canvas/SVG representations are supported. No global registry is created.

## Validate AI-authored content

```ts
import { parseSource, validateContentPlan } from "@neatico/visual-core";

const source = parseSource(rawInputText);
const plan = validateContentPlan(aiJson, source, "presentation");
```

`validateContentPlan` is a hard boundary for untrusted model output. It strips unknown properties, never trusts generated code or asset URLs, and verifies content against the source ranges. File-name placeholders are treated as references, not fabricated assets. Use `validateEditableContentPage` for editor-authored pages (pass `{ allowIncomplete: true }` while the user is still editing).

## Validate compositions and blueprints

```ts
import {
  validateComposition,
  compositionFields,
  createBlueprintRegistry,
  blueprintLabel,
} from "@neatico/visual-core";

const fields = compositionFields(aiContent);
const composition = validateComposition(aiComposition, fields);

const catalog = createBlueprintRegistry();
const unregister = catalog.register({
  version: 1,
  id: "editorial-introduction",
  labels: { en: "Editorial introduction", zh: "编辑式导言" },
  fields: ["title", "body"],
  ratios: [1, 16 / 9],
  intents: ["cover"],
  composition: {
    version: 1,
    root: {
      type: "column",
      children: [
        { type: "text", bind: "title", role: "hero" },
        { type: "text", bind: "body", role: "body" },
      ],
    },
  },
});

const choices = catalog.find(["title", "body"], 16 / 9, "cover");
const name = blueprintLabel(choices[0], "zh-CN");
unregister();
```

Compositions and blueprints are **data-only** (`version: 1`). There are no coordinates, CSS, HTML, or URLs in the tree; every text node binds exactly one existing, nonempty content field. Blueprints can declare semantic `intents`; a cover-only template will never be picked for a closing slide. Field matching is exact, so a template cannot silently drop extra user content. Locale lookup tries the exact locale, then the language, then English.

Structural validation is not visual approval. Before registering AI-authored templates in production, render representative samples at every supported ratio with real font metrics and check bounds, collisions, readability, and content preservation. The host owns persistence, permissions, review, and migration.

## Select layout candidates

```ts
import { eligibleLayouts, layoutCandidates } from "@neatico/visual-core";

const eligible = eligibleLayouts("presentation", contentPage, 16 / 9);
const shortlist = layoutCandidates("presentation", "cover", contentPage, 16 / 9, 5);
```

`LAYOUT_CONTRACTS` covers all 97 presentation and 97 social layout IDs with semantic intent, item capacity, required fields, and ratio bounds. Eligibility is a first filter only — it never replaces measured fit. The host must still measure emitted geometry, confirm every source field is visible, and reject or paginate unreadable output.

## Paginate without losing content

```ts
import { splitCopy, splitContent } from "@neatico/visual-core";

const copySplit = splitCopy(longParagraph); // [head, tail] | undefined
const pageSplit = splitContent(overflowingPage); // [pageA, pageB] | undefined
```

Splits happen only at explicit word/sentence boundaries. Identifiers, decimal values, and unbroken URLs are never cut to force them onto a smaller canvas. The host keeps the title and context on each emitted page and remeasures.

## Themes, fonts, and fingerprints

```ts
import {
  designTheme,
  designCandidates,
  structureFingerprint,
  recommendedFonts,
} from "@neatico/visual-core";

const theme = designTheme("ink");
const recipes = designCandidates(page, { kind: "social", ratio: 1, limit: 5 });

const fp = structureFingerprint(placedItems, canvasWidth, canvasHeight);
const fonts = recommendedFonts("ja-JP", japaneseHeadline);
```

- `DESIGN_THEMES` / `designTheme` expose complete, deterministic palette, typography, and geometry tokens.
- `designCandidates` ranks authored catalog recipes against a page, excluding already-used families.
- `structureFingerprint` ignores color, copy, and generated IDs — a preview that only recolors has the same fingerprint.
- `recommendedFonts`, `contentScript`, and `languageFont` resolve the curated Google Fonts catalog to scripts and supported weights.

## API surface

| Module | Key exports |
|---|---|
| Geometry | `layoutMatrix`, `multiplyMatrix`, `flattenGroupLayout`, `layoutBounds`, `Layout`, `Matrix` |
| Text | `wrapCopy`, `Measure`, `WrapOptions` |
| Scenes | `createSceneRegistry`, `SceneRenderer` |
| Content | `parseSource`, `validateContentPlan`, `validateEditableContentPage`, `contentBlockText`, `ContentPlan`, `ContentPage`, `ContentBlock` |
| Composition | `validateComposition`, `compositionFields`, `COMPOSITION_PROMPT`, `Composition` |
| Blueprints | `validateBlueprint`, `createBlueprintRegistry`, `blueprintLabel` |
| Design blueprints | `validateDesignBlueprint`, `blueprintFitsContent`, `DesignBlueprint` |
| Layout contracts | `LAYOUT_CONTRACTS`, `eligibleLayouts`, `layoutCandidates` |
| Layout catalogs | `PRESENTATION_LAYOUT_IDS`, `SOCIAL_LAYOUT_CATALOG`, `COMPOSITION_SCENES` |
| Pagination | `splitCopy`, `splitContent` |
| Design system | `DESIGN_THEMES`, `designTheme`, `DESIGN_RECIPES`, `designCandidates`, `structureFingerprint` |
| Editorial | `readingUnits`, `needsEditorialPagination`, `ensurePresentationBookends` |
| Fonts | `GOOGLE_FONT_CATALOG`, `contentScript`, `recommendedFonts`, `languageFont` |

## Design philosophy

Neatico generates genuinely different designs for different stories, not the same template recolored. That principle is encoded here: eligibility is structural but measured fit stays mandatory, compositions are data-only, and registries are isolated so an application can bring its own renderers and approve its own templates. Every validator fails explicitly rather than guessing.

## Development

```sh
npm install
npm test          # builds ESM/CJS, then runs node:test
npm pack --dry-run
```

Tests cover transform equivalence, invalid geometry, text wrapping, content validation, registry isolation, and pagination. `npm pack` runs the build and tests before assembling the package; only compiled output, this README, and the license are published.

## Meet Neatico

This package is the open-source layout core of **[Neatico](https://www.neatico.com/?utm_source=npm&utm_medium=readme&utm_campaign=visual-core)** — the AI workspace that turns a single idea into pixel-perfect, fully editable visuals. Describe it once and Neatico designs social posts, presentations, and marketing graphics with real layouts, measured typography, your brand kit, AI imagery and background removal, and one-click PPTX/PNG export.

The `@neatico/*` packages are the framework-independent pieces extracted from that product so you can build your own editor, generate-and-go pipeline, or scene extension. Want the finished experience instead of the primitives? **[Start creating free on neatico.com →](https://www.neatico.com/?utm_source=npm&utm_medium=readme&utm_campaign=visual-core)**

## Contributing

Open an issue or pull request at [neatico/visual-core](https://github.com/neatico/visual-core) with a minimal reproduction and a regression test. Keep APIs independent of application state and use American English in documentation and code comments.

## License

MIT. See [LICENSE](./LICENSE).
