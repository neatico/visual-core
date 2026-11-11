import { COMPOSITION_ILLUSTRATIONS, ILLUSTRATION_GUIDANCE } from "./illustrationScenes.js";
import { textPresentationSchema } from "./textPresentation.js";
import { DESIGN_RECIPES, type DesignRecipe } from "./designSystem.js";
import type { SemanticKind } from "./content.js";

export type ParameterSchema = Readonly<Record<string, unknown>>;
export type CompositionKind =
  | "presentation"
  | "social"
  | "article-cover"
  | "article-illustration";
export interface RecipeParameterContract {
  parameterModel?: "semantic" | "native-social";
  id: string;
  schemaVersion: 1;
  supportedKinds: readonly CompositionKind[];
  semanticDescription: string;
  scenes: readonly string[];
  rendererKey: string;
  capacity: { minEntries: number; maxEntries: number; requiresImage: boolean };
  parameterSchema: ParameterSchema;
  importance: Readonly<Record<string, number>>;
  generationPolicy: Readonly<Record<string, readonly string[]>>;
  themeBindings: readonly string[];
  fallbackPolicy: {
    missingContent: "derive-or-labeled-example";
    missingAsset: "search-or-native-placeholder";
    omitCandidate: false;
  };
}
const text = (description: string, maxLength = 600): ParameterSchema => ({
  type: "string",
  description,
  maxLength,
});
const object = (
  properties: Record<string, unknown>,
  required: string[],
): ParameterSchema => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});
const array = (
  items: ParameterSchema,
  minItems: number,
  maxItems: number,
): ParameterSchema => ({ type: "array", items, minItems, maxItems });
const evidence = array(
  object(
    {
      sourceId: text("Existing source segment ID.", 160),
      quote: text("Exact source quotation.", 2000),
    },
    ["sourceId"],
  ),
  1,
  32,
);
const base = (
  kind: string,
  properties: Record<string, unknown>,
  required: string[],
) =>
  object(
    {
      id: text("Stable block ID, unique within this page.", 80),
      kind: { const: kind },
      evidence,
      ...properties,
    },
    ["id", "kind", "evidence", ...required],
  );
const descriptions: Record<SemanticKind, string> = {
  paragraph:
    "Explain a narrative idea with readable prose and optional section headings.",
  features:
    "Present parallel capabilities or a list of distinct ideas without implying a sequence.",
  steps:
    "Explain ordered actions or a chronological sequence supported by the source.",
  comparison:
    "Compare supplied alternatives with aligned criteria; never invent a competing alternative.",
  parameters:
    "Present exact specifications, logistics, identifiers, dates, prices, or named facts.",
  quote: "Emphasize a verbatim quotation with its supplied attribution.",
  chart:
    "Explain a comparable numeric series with source-backed values and a shared unit.",
  code: "Display exact source code without rewriting identifiers, literals, or line breaks.",
  image:
    "Arrange a real, previously supplied image asset with its source reference and focal subject.",
};
function blockSchema(kind: SemanticKind, maximum: number): ParameterSchema {
  const count = Math.max(1, Math.min(12, maximum || 12));
  switch (kind) {
    case "paragraph":
      return base(
        kind,
        {
          text: text("Source-faithful prose.", 2000),
          heading: text("Optional source-supported heading.", 120),
          level: { enum: [2, 3] },
        },
        ["text"],
      );
    case "features":
    case "steps":
      return base(
        kind,
        {
          entries: array(
            object(
              {
                title: text(
                  "Concise item label without an ordinal prefix.",
                  120,
                ),
                description: text(
                  "Source-faithful explanation; omit filler.",
                  600,
                ),
              },
              ["title", "description"],
            ),
            1,
            count,
          ),
        },
        ["entries"],
      );
    case "comparison":
      return base(
        kind,
        {
          columns: array(
            object(
              {
                title: text("A supplied alternative.", 120),
                points: array(
                  text("Source-backed comparison criterion.", 600),
                  1,
                  8,
                ),
                price: text("Exact source price, only when supplied.", 120),
                values: array(
                  text("Exact value aligned with points.", 160),
                  1,
                  8,
                ),
                statuses: array(
                  { enum: ["included", "excluded", "partial", "unknown"] },
                  1,
                  8,
                ),
              },
              ["title", "points"],
            ),
            2,
            Math.max(2, Math.min(4, count)),
          ),
        },
        ["columns"],
      );
    case "parameters":
      return base(
        kind,
        {
          rows: array(
            object(
              {
                name: text("Fact name.", 120),
                value: text("Exact source value.", 300),
                description: text(
                  "Source-supported qualification, otherwise an empty string.",
                  600,
                ),
              },
              ["name", "value", "description"],
            ),
            1,
            count,
          ),
        },
        ["rows"],
      );
    case "quote":
      return base(
        kind,
        {
          text: text("Verbatim source quotation.", 1200),
          attribution: text("Exact source attribution.", 160),
          role: text("Role only when explicitly supplied.", 160),
          avatarAssetId: text(
            "Existing supplied portrait asset ID; never invent a person or image.",
            160,
          ),
        },
        ["text", "attribution"],
      );
    case "chart":
      return base(
        kind,
        {
          chart: { enum: ["bar", "line"] },
          unit: text("Exact source unit.", 80),
          values: array(
            object(
              {
                label: text("Exact source label.", 120),
                value: { type: "number" },
              },
              ["label", "value"],
            ),
            2,
            12,
          ),
        },
        ["chart", "unit", "values"],
      );
    case "code":
      return base(
        kind,
        {
          sourceId: text(
            "Existing code source ID; code remains unchanged.",
            160,
          ),
          language: text("Source code language.", 80),
          code: text("Exact source code.", 20000),
        },
        ["sourceId", "language", "code"],
      );
    case "image":
      return base(
        kind,
        {
          sourceId: text("Existing image source ID.", 160),
          assetId: text("Existing asset ID; no generated URLs.", 160),
          alt: text("Subject and purpose of the supplied image.", 600),
          treatment: { enum: ["screenshot", "photograph", "diagram"] },
          status: { enum: ["available", "missing"] },
        },
        ["sourceId", "alt", "treatment", "status"],
      );
  }
}

/** Each authored renderer receives a fixed block sequence and bounded copy. */
function fixedBlocks(recipe: DesignRecipe): ParameterSchema {
  const id = recipe.id;
  let kinds: SemanticKind[];
  if (["authored-explore-cover", "authored-explore-photo-story"].includes(id))
    kinds = ["paragraph", "image"];
  else if (id.endsWith("ledger-chart")) kinds = ["parameters", "chart"];
  else if (id.endsWith("detail-sidebar")) kinds = ["paragraph", "parameters"];
  else if (id.endsWith("technical-log")) kinds = ["paragraph", "code"];
  else if (id.endsWith("architecture-stack")) kinds = ["steps", "paragraph"];
  else if (
    ["authored-mechanism-flow", "authored-reference-capability-map"].includes(
      id,
    )
  )
    kinds = ["features", "paragraph"];
  else if (id === "authored-founder-timeline") kinds = ["steps", "paragraph"];
  else if (id === "authored-founder-comparison")
    kinds = ["comparison", "paragraph"];
  else if (id === "semantic-hero-editorial")
    kinds = ["paragraph", "paragraph", "paragraph", "image"];
  else if (id.endsWith("speaker-lineup"))
    kinds = ["parameters", "quote", "quote", "quote"];
  else if (id.endsWith("speaker-spotlight")) kinds = ["parameters", "quote"];
  else if (id === "authored-reference-story")
    kinds = ["image", "paragraph", "features"];
  else if (id === "authored-reference-photo") kinds = ["paragraph", "image"];
  else if (id === "authored-image-triptych")
    kinds = ["paragraph", "features", "paragraph", "image"];
  else if (recipe.requiresImage && recipe.accepts.includes("image"))
    kinds = ["image"];
  else if (recipe.family === "mixed-stack") kinds = ["features"];
  else
    kinds = [
      recipe.accepts.find((kind) => kind !== "paragraph" && kind !== "image") ||
        "paragraph",
    ];
  if (id.startsWith("bookend-") || recipe.family.startsWith("prose-"))
    kinds = ["paragraph"];
  const items = kinds.map((kind) => {
    const schema = JSON.parse(
      JSON.stringify(blockSchema(kind, recipe.maxEntries)),
    );
    const fields = schema.properties;
    const count = Math.max(
      recipe.minEntries || 1,
      Math.min(3, recipe.maxEntries || 3),
    );
    if (kind === "paragraph")
      fields.text.maxLength = [
        "authored-reference-detail-sidebar",
        "authored-reference-diagonal",
        "authored-prose-inset",
      ].includes(id)
        ? 160
        : 120;
    if (kind === "features" || kind === "steps") {
      const entries = fields.entries;
      entries.minItems = id === "authored-reference-story" ? 2 : count;
      entries.maxItems = count;
      entries.items.properties.illustration = {
        type: "string",
        enum: [...COMPOSITION_ILLUSTRATIONS],
        default: "symbol",
        description:
          ILLUSTRATION_GUIDANCE,
      };
      entries.items.required.push("illustration");
      entries.items.properties.icon = {
        type: "string",
        enum: [
          "BsJournalText",
          "BsPersonCheck",
          "BsShare",
          "BsPeople",
          "BsSearch",
          "BsShieldCheck",
          "BsBarChart",
          "BsCodeSlash",
          "BsSignpostSplit",
          "BsCheck2Circle",
          "BsFolder2Open",
          "BsGrid1X2",
        ],
        description:
          "Optional authored icon variant; illustration remains the primary visual concept.",
      };
      entries.items.properties.title.maxLength = 28;
      entries.items.properties.description.maxLength =
        id === "authored-feature-focus" ? 160 : 48;
      if (/(?:reference-faq|editorial-faq)$/.test(id) || id === "faq")
        entries.items.properties.title.pattern = "^.+[?？]$";
    }
    if (kind === "parameters") {
      const rows =
        id.endsWith("ledger-chart") ||
        id.endsWith("detail-sidebar") ||
        id.includes("speaker-")
          ? 2
          : count;
      fields.rows.minItems = id.endsWith("speaker-lineup")
        ? 1
        : id === "pricing"
          ? 2
          : rows;
      fields.rows.maxItems = rows;
      fields.rows.items.properties.name.maxLength = 20;
      fields.rows.items.properties.value.maxLength = 24;
      fields.rows.items.properties.description.maxLength = 64;
      if (id.includes("speaker-"))
        fields.rows.items.properties.description = { const: "" };
    }
    if (kind === "comparison") {
      fields.columns.minItems = 2;
      fields.columns.maxItems = 2;
      const column = fields.columns.items.properties;
      column.title.maxLength = 20;
      column.points.minItems = id === "authored-founder-comparison" ? 1 : 2;
      column.points.maxItems = 3;
      column.points.items.maxLength =
        id === "authored-founder-comparison" ? 64 : 40;
      column.values.maxItems = 3;
      column.values.items.maxLength = 16;
      column.values.minItems = 0;
      column.statuses.minItems = 0;
      column.statuses.maxItems = 3;
      column.price.maxLength = 24;
    }
    if (kind === "quote") {
      fields.text.maxLength = id.includes("speaker-") ? 48 : 160;
      fields.attribution.maxLength = 32;
      if (id.includes("speaker-")) {
        fields.avatarAssetId.description =
          "An existing portrait asset ID, or neatico-editorial-placeholder for an original source-attributed illustration.";
        schema.required.push("avatarAssetId");
      }
    }
    if (kind === "code") {
      fields.code.maxLength = 400;
      fields.code.description =
        "A concise exact source excerpt, or a clearly labeled illustrative example when no source code exists. At most eight lines and 56 columns per line.";
      fields.code.pattern = String.raw`^(?:[^\n]{0,56}\n){0,7}[^\n]{0,56}$`;
    }
    if (kind === "image") fields.alt.maxLength = 80;
    if (kind === "chart") {
      const count = id.endsWith("ledger-chart") ? 3 : 4;
      fields.values.minItems = Math.min(3, count);
      fields.values.maxItems = count;
      fields.values.items.properties.label.maxLength = 20;
      fields.unit.maxLength = 24;
      if (/trend/.test(id)) fields.chart = { const: "line" };
      if (/bars|ledger-chart/.test(id)) fields.chart = { const: "bar" };
      if (/donut|reference-share|reference-metrics/.test(id)) {
        fields.chart = { const: "bar" };
        fields.unit = {
          type: "string",
          maxLength: 24,
          pattern: "%",
          description:
            "Percentage unit, optionally qualified as illustrative or simulated.",
        };
        fields.values.description =
          "Nonnegative shares totaling exactly 100. Use labeled illustrative shares when the input has no comparable numbers.";
        fields.values.items.properties.value.minimum = 0;
        fields.values.items.properties.value.maximum = 100;
      }
    }
    if (id.startsWith("authored-explore-")) {
      if (kind === "paragraph") {
        fields.text.maxLength = 220;
        if (id !== "authored-explore-focus") {
          delete fields.heading;
          delete fields.level;
        }
      }
      if (kind === "features" || kind === "steps") {
        fields.entries.minItems = Math.max(2, recipe.minEntries);
        fields.entries.maxItems = recipe.maxEntries;
        fields.entries.items.properties.title.maxLength = 44;
        fields.entries.items.properties.description.maxLength = 120;
        delete fields.entries.items.properties.illustration;
        delete fields.entries.items.properties.icon;
        fields.entries.items.required = fields.entries.items.required.filter(
          (key: string) => !["illustration", "icon"].includes(key),
        );
      }
      if (kind === "parameters") {
        fields.rows.minItems = recipe.minEntries;
        fields.rows.maxItems = recipe.maxEntries;
        fields.rows.items.properties.name.maxLength = 36;
        fields.rows.items.properties.value.maxLength = 120;
        fields.rows.items.properties.description.maxLength = 60;
      }
      if (kind === "comparison") {
        fields.columns.items.properties.points.maxItems = 3;
        fields.columns.items.properties.points.items.maxLength = 100;
        for (const key of ["price", "values", "statuses"])
          delete fields.columns.items.properties[key];
      }
      if (kind === "chart") {
        fields.chart = { const: "bar" };
        fields.values.minItems = 2;
        fields.values.maxItems = 6;
        fields.values.items.properties.value.minimum = 0;
      }
    }
    // These measured list/table renderers support variable rows. The old global
    // three-item fixture bound discarded useful itinerary and budget detail.
    // Authored card compositions retain their fixed number of slots.
    if (/^semantic-(steps|parameters)-(stack|split)$/.test(id)) {
      const values = kind === "steps" ? fields.entries : fields.rows;
      if (values) {
        values.minItems = 2;
        values.maxItems = id.endsWith("stack") ? 8 : 6;
        values.items.properties.description.maxLength = 24;
        values.description = "Use enough rows to complete this page's requested detail: include every relevant time slot or budget item and total, within the fixed maximum. Do not collapse a full itinerary into three vague phases.";
      }
    }
    return schema;
  });
  return {
    type: "array",
    items,
    minItems: id === "authored-explore-cover" ? 1 : items.length,
    maxItems: items.length,
    additionalItems: false,
    description:
      "Fixed ordered parameters for this renderer. Return every block exactly once in this order; do not add explanatory blocks.",
  };
}

/** Fixed renderer parameters, not executable layout trees. The complete schema
 * travels with each formal generation batch; summaries are scheduling aids only.
 */
export function recipeParameterContract(
  recipe: DesignRecipe,
  supportedKinds: RecipeParameterContract["supportedKinds"] = [recipe.kind],
): RecipeParameterContract {
  return {
    id: recipe.id,
    schemaVersion: 1,
    supportedKinds,
    semanticDescription: recipe.accepts
      .map((kind) => descriptions[kind])
      .join(" "),
    scenes: recipe.scenes || [],
    rendererKey: `${recipe.renderer}:${recipe.id}`,
    capacity: {
      minEntries: recipe.minEntries,
      maxEntries: recipe.maxEntries,
      requiresImage: recipe.requiresImage,
    },
    parameterSchema: object(
      {
        title: {
          ...text(
            "Audience-facing headline preserving the original topic.",
            64,
          ),
          minLength: 1,
        },
        blocks: fixedBlocks(recipe),
        textPresentation: textPresentationSchema(),
      },
      ["title", "blocks"],
    ),
    importance: { title: 3, blocks: 7 },
    generationPolicy: {
      title: ["user-fact", "derived", "creative"],
      blocks: ["user-fact", "derived", "creative", "simulated"],
      assets: ["existing-reference-only"],
    },
    fallbackPolicy: {
      missingContent: "derive-or-labeled-example",
      missingAsset: "search-or-native-placeholder",
      omitCandidate: false,
    },
    themeBindings: [
      "palette.background",
      "palette.surface",
      "palette.ink",
      "palette.muted",
      "palette.accent",
      "palette.line",
      "typography.heading",
      "typography.body",
      "typography.code",
      "geometry",
    ],
  };
}

/** Shared recipes are one part of the formal catalog; host-specific renderer
 * definitions register through the same contract constructor during migration.
 */
export const RECIPE_PARAMETER_CONTRACTS: readonly RecipeParameterContract[] =
  DESIGN_RECIPES.filter(
    (recipe, index, recipes) =>
      recipes.findIndex((other) => other.id === recipe.id) === index,
  ).map((recipe) =>
    recipeParameterContract(
      recipe,
      DESIGN_RECIPES.filter((other) => other.id === recipe.id).map(
        (other) => other.kind,
      ),
    ),
  );
