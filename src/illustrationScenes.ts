/** One vocabulary for model contracts, validation and native editable renderers. */
export const COMPOSITION_ILLUSTRATIONS = [
  'document','collaboration','review','feedback','sequence','comparison','structure','symbol',
  'software','security','analytics','education','health','nature','finance','logistics',
  'camping','landscape','route','cooking','climate','access',
] as const;
export type IllustrationScene = typeof COMPOSITION_ILLUSTRATIONS[number];
export const ILLUSTRATION_GUIDANCE = 'Choose a concrete subject supported by this item: camping for a tent/campsite, landscape for scenery/desert, route for travel/navigation, cooking for food preparation, climate for weather/aridity, access for land-entry rules; software, security, analytics, education, health, nature, finance or logistics for those subjects. Use document, collaboration, review, feedback, sequence, comparison or structure only for an actual document, people working together, checking, revision, ordered actions, alternatives or organization. symbol is a neutral fallback. Never choose by list position or reuse an unrelated diagram to fill a slot.';

/** Resolve a declared scene ID; prose is never a source of renderer decisions. */
export function resolveIllustrationScene(value:string):IllustrationScene|undefined {
 return (COMPOSITION_ILLUSTRATIONS as readonly string[]).includes(value)?value as IllustrationScene:undefined;
}

/** @deprecated Supply a declared scene to resolveIllustrationScene instead.
 * Retain the export for compatibility, without interpreting either prose argument. */
export function illustrationSubject(value:string,_context=''):IllustrationScene|undefined {
 return resolveIllustrationScene(value);
}
