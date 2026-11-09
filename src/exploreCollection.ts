import type { DesignRecipe, DesignTheme } from "./designSystem.js";
import type { ContentPage, SemanticKind } from "./content.js";

export const DEFAULT_PRESENTATION_THEME = "explore-teal";
/** The proven Explore editorial colorways, plus eight complementary directions. */
const colors = [
  ["teal", "#214B4A", "#E1EEEB", "#F7FAF9", "#1C3533"],
  ["slate", "#3F5477", "#E6EAF1", "#F9FAFC", "#1D283B"],
  ["cobalt", "#2847A9", "#E5EBFC", "#F8FAFF", "#19294E"],
  ["clay", "#9D4F32", "#F8E7DE", "#FFFAF6", "#3F2920"],
  ["terracotta", "#AC3F25", "#FBE5DC", "#FFFAF5", "#3E241B"],
  ["lavender", "#6A497B", "#EEE6F5", "#FCFAFD", "#34243D"],
  ["petrol", "#315664", "#E2EDF1", "#F8FBFC", "#223E48"],
  ["sand", "#6D5140", "#EFE4D8", "#FCFAF7", "#392C23"],
  ["indigo", "#43387D", "#EAE5F6", "#FAF9FD", "#292444"],
  ["olive", "#4F633A", "#E8EEDC", "#FBFCF8", "#2D3824"],
  ["rose", "#9B3E61", "#F6E2EB", "#FFFAFC", "#402332"],
  ["wine", "#7A3048", "#EFDEE5", "#FCF8FA", "#39202C"],
  ["sunflower", "#8A5D12", "#F7EBC6", "#FFFDF5", "#392F1D"],
  ["seafoam", "#216C62", "#DDF0E8", "#F7FCFA", "#193D36"],
  ["graphite", "#D5B98C", "#30343A", "#1B1E23", "#F5F2EA"],
  ["midnight", "#91B7DE", "#22344C", "#132236", "#F3F6FA"],
  ["ice", "#27697B", "#DDEFF5", "#F8FCFE", "#193C49"],
  ["copper", "#9A563B", "#F1E2D7", "#FCF9F5", "#3F2C23"],
] as const;
export const EXPLORE_THEMES: readonly DesignTheme[] = colors.map(
  ([id, accent, surface, background, ink]) => ({
    id: `explore-${id}`,
    palette: { accent, surface, background, ink, muted: ink, line: surface },
    typography: {
      heading: "Playfair Display",
      body: "Inter",
      code: "JetBrains Mono",
      headingWeight: 600,
    },
    geometry: { radius: 4, spacing: 1.1, rule: "hairline" },
  }),
);
export const EXPLORE_LAYOUTS = [
  [
    "cover",
    "paragraph",
    0,
    0,
    "Open with a spacious editorial headline, a short premise and an optional real photograph.",
  ],
  [
    "overview",
    "features",
    2,
    4,
    "Orient readers with a numbered overview of parallel subjects.",
  ],
  [
    "section",
    "paragraph",
    0,
    0,
    "Introduce one new section or central principle in a strong color field.",
  ],
  [
    "pillars",
    "features",
    2,
    3,
    "Explain two or three equally important ideas in spacious editorial columns.",
  ],
  [
    "focus",
    "paragraph",
    0,
    0,
    "Develop one idea in an asymmetric reading composition.",
  ],
  [
    "workflow",
    "steps",
    2,
    4,
    "Show an ordered workflow with explicit actions and useful descriptions.",
  ],
  [
    "timeline",
    "steps",
    2,
    4,
    "Present a short chronological sequence on a horizontal reading axis.",
  ],
  [
    "comparison",
    "comparison",
    2,
    2,
    "Compare two supplied alternatives with corresponding points.",
  ],
  [
    "worksheet",
    "parameters",
    2,
    4,
    "Explain named fields with their concrete values and instructions.",
  ],
  [
    "photo-story",
    "image",
    0,
    0,
    "Use a real contextual photograph beside a concise explanation.",
  ],
  [
    "quote",
    "quote",
    0,
    0,
    "Give an exact source statement room to breathe, retaining supplied attribution.",
  ],
  [
    "chart",
    "chart",
    2,
    6,
    "Compare source-backed quantities in labeled bars with the original unit.",
  ],
  [
    "ledger",
    "parameters",
    2,
    5,
    "Arrange named facts and explanations in a flat editorial ledger.",
  ],
  [
    "faq",
    "features",
    2,
    3,
    "Answer a small set of meaningful questions with concise responses.",
  ],
  [
    "action-plan",
    "steps",
    2,
    3,
    "Make the next few actions prominent, with descriptions that explain the work.",
  ],
  [
    "closing",
    "paragraph",
    0,
    0,
    "Close with one clear takeaway and a concrete next action.",
  ],
] as const;
export const EXPLORE_RECIPES: readonly DesignRecipe[] = EXPLORE_LAYOUTS.map(
  ([id, kind, min, max]) => ({
    id: `authored-explore-${id}`,
    kind: "presentation",
    renderer: "semantic",
    automatic: true,
    family: kind === "paragraph" ? `hero-explore-${id}` : kind,
    minEntries: min,
    maxEntries: max,
    accepts: (["cover", "photo-story"].includes(id)
      ? ["paragraph", "image"]
      : [kind]) as SemanticKind[],
    requiresImage: id === "photo-story",
  }),
);
export function exploreCompositionFits(page: ContentPage, id: string): boolean {
  if (!id.startsWith("authored-explore-")) return true;
  const variant = id.slice("authored-explore-".length);
  if (variant === "cover") return page.purpose === "cover";
  if (variant === "closing") return page.purpose === "conclude";
  if (["cover", "conclude"].includes(page.purpose)) return false;
  if (variant === "section")
    return (
      page.blocks.length === 1 &&
      page.blocks[0].kind === "paragraph" &&
      page.blocks[0].text.length <= 160
    );
  return true;
}
