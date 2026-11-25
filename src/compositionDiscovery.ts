import {applicableCompositions, FORMAL_COMPOSITIONS} from './formalCompositions.js';
import type {CompositionKind} from './recipeParameters.js';
import type {DesignRecipe} from './designSystem.js';

// Decisions affect discovery only. Historical parameter schemas and renderers
// keep their original identity, including when a saved design is edited.
export const MERGED_COMPOSITIONS: Readonly<Record<string, string>> = {
  'article-chart-1': 'article-chart-0',
  'article-chart-2': 'article-chart-0',
  'article-checklist-1': 'article-checklist-0',
  'article-comparison-2': 'article-comparison-0',
  'article-features-3': 'article-features-2',
  'article-features-4': 'article-features-2',
  'article-process-2': 'article-process-1',
  'article-summary-2': 'article-summary-1',
  'edition:ribbons': 'edition:arc',
  'edition:sweep': 'edition:arc',
  'edition:competitors': 'edition:matrix',
  'edition:facing': 'edition:proof',
  'reference:authored-reference-list': 'reference:authored-reference-vision',
  'semantic:presentation:authored-explore-focus': 'semantic:presentation:semantic-prose-editorial',
  'semantic:presentation:authored-image-inset': 'semantic:presentation:authored-image-banner',
  'semantic:presentation:bookend-cover-panel': 'semantic:presentation:bookend-cover-editorial',
  'semantic:presentation:authored-explore-action-plan': 'semantic:presentation:authored-explore-workflow',
  'semantic:presentation:authored-explore-worksheet': 'semantic:presentation:authored-explore-ledger',
  'semantic:presentation:bookend-closing-split': 'semantic:presentation:bookend-closing-editorial',
  'semantic:presentation:semantic-parameters-split': 'semantic:presentation:semantic-parameters-stack',
  'social:hiring-openings': 'social:hiring-benefits',
  'social:note-question': 'social:note-marker',
  'social:note-checklist': 'social:checklist',
  'social:testimonial': 'social:quote',
  'social:course': 'social:steps',
};

export const RETIRED_COMPOSITIONS: ReadonlySet<string> = new Set([
  // Nested translucent mats, halftone dots and a gradient compete with one headline.
  'edition:watermark',
]);

// These layouts explain multiple records, series or instructions. Keep their
// body-illustration and original product roles; give covers a single focal point.
export const ARTICLE_BODY_ONLY: ReadonlySet<string> = new Set([
  'edition:corners', 'edition:demo', 'edition:opening',
  'reference:authored-reference-vision', 'reference:authored-reference-sustainable',
  'reference:authored-reference-bars', 'reference:authored-reference-share',
  'reference:authored-reference-trend', 'reference:authored-reference-comparison',
  'social:time-notice', 'social:bento', 'social:report', 'social:comparison', 'social:myth',
  'social:case-study', 'social:notice', 'social:split-bar-compare', 'social:benchmark-bars',
  'social:usage-breakdown', 'social:organization', 'social:research-highlight', 'social:product-showcase',
  'semantic:social:time-notice', 'semantic:social:authored-founder-comparison',
  'semantic:presentation:authored-explore-overview', 'semantic:presentation:authored-explore-pillars',
  'semantic:presentation:authored-explore-comparison', 'semantic:presentation:authored-explore-chart',
  'semantic:presentation:authored-feature-bento', 'semantic:presentation:authored-feature-index',
  'semantic:presentation:authored-comparison-panels', 'semantic:presentation:authored-parameter-cards',
]);

export function isDiscoverableComposition(id: string, kind: CompositionKind): boolean {
  return !Object.hasOwn(MERGED_COMPOSITIONS, id) && !RETIRED_COMPOSITIONS.has(id)
    && (kind !== 'article-cover' || !ARTICLE_BODY_ONLY.has(id));
}

export function discoverCompositions(kind: CompositionKind, ratio: number, explicitId?: string) {
  const compatible = applicableCompositions(kind, ratio, explicitId);
  return explicitId ? compatible : compatible.filter(contract => isDiscoverableComposition(contract.id, kind));
}

// The same recipe name can identify a native catalog or a semantic renderer.
// Keep local selection consistent without touching user blueprints and saved IDs.
const hiddenRecipes = new Set(FORMAL_COMPOSITIONS.filter(contract =>
  contract.recipe && !isDiscoverableComposition(contract.id, 'presentation')
).map(contract => contract.recipe!.renderer + ':' + contract.recipe!.id));

export function isDiscoverableRecipe(recipe: Pick<DesignRecipe, 'id' | 'renderer'>): boolean {
  return !hiddenRecipes.has(recipe.renderer + ':' + recipe.id);
}
