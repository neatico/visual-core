import type { SourceDocument } from "./content.js";

/** Input provenance and adaptation permissions are independent of suitability scores. */
export interface ContentBrief {
  version: 1;
  originalInput: string;
  /** Explicitly edited content; the initial submission remains immutable. */
  revisedInput?: string;
  revisedInputIllustrative?: boolean;
  mode: "source-backed" | "creative";
  language?: string;
  creativeAllowed: boolean;
  simulationAllowed: boolean;
  sourceIds: string[];
}

export function createContentBrief(source: SourceDocument): ContentBrief {
  if (
    !source ||
    source.version !== 1 ||
    typeof source.text !== "string" ||
    !source.text.trim() ||
    !Array.isArray(source.segments) ||
    !source.segments.length
  )
    throw new Error("CONTENT_BRIEF_INVALID");
  const provenance = source.provenance;
  if (
    provenance &&
    (!["creative-draft", "user-revision"].includes(provenance.kind) ||
      typeof provenance.original !== "string" ||
      !provenance.original.trim() ||
      typeof provenance.disclosure !== "string" ||
      !provenance.disclosure.trim() ||
      (provenance.originalMode !== undefined &&
        (provenance.kind !== "user-revision" ||
          !["source-backed", "creative"].includes(provenance.originalMode))) ||
      (provenance.illustrative !== undefined &&
        (provenance.kind !== "user-revision" || typeof provenance.illustrative !== "boolean")) ||
      (provenance.simulationAllowed !== undefined &&
        typeof provenance.simulationAllowed !== "boolean") ||
      (provenance.language !== undefined &&
        (typeof provenance.language !== "string" ||
          !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/.test(provenance.language))))
  )
    throw new Error("CONTENT_BRIEF_INVALID");
  const sourceIds = source.segments.map((segment) => segment.id);
  if (
    sourceIds.some((id) => typeof id !== "string" || !id) ||
    new Set(sourceIds).size !== sourceIds.length
  )
    throw new Error("CONTENT_BRIEF_INVALID");
  return validateContentBrief({
    version: 1,
    originalInput: provenance?.original || source.text,
    ...(provenance?.kind === "user-revision" ? { revisedInput: source.text } : {}),
    ...(provenance?.kind === "user-revision" && provenance.illustrative ? { revisedInputIllustrative: true } : {}),
    mode: provenance?.kind === "user-revision" ? provenance.originalMode || "source-backed" : provenance ? "creative" : "source-backed",
    ...(provenance?.language ? { language: provenance.language } : {}),
    creativeAllowed: true,
    simulationAllowed: true,
    sourceIds,
  });
}

export function validateContentBrief(value: unknown): ContentBrief {
  const brief = value as ContentBrief;
  if (
    !brief ||
    brief.version !== 1 ||
    typeof brief.originalInput !== "string" ||
    !brief.originalInput.trim() ||
    brief.originalInput.length > 20000 ||
    (brief.revisedInput !== undefined &&
      (typeof brief.revisedInput !== "string" || !brief.revisedInput.trim() || brief.revisedInput.length > 20000)) ||
    (brief.revisedInputIllustrative !== undefined &&
      (typeof brief.revisedInputIllustrative !== "boolean" || brief.revisedInput === undefined)) ||
    !["source-backed", "creative"].includes(brief.mode) ||
    typeof brief.creativeAllowed !== "boolean" ||
    typeof brief.simulationAllowed !== "boolean" ||
    (brief.simulationAllowed && !brief.creativeAllowed) ||
    (brief.language !== undefined &&
      (typeof brief.language !== "string" ||
        !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/.test(brief.language))) ||
    !Array.isArray(brief.sourceIds) ||
    !brief.sourceIds.length ||
    brief.sourceIds.length > 1024 ||
    new Set(brief.sourceIds).size !== brief.sourceIds.length ||
    brief.sourceIds.some(
      (id) => typeof id !== "string" || !id || id.length > 160,
    )
  )
    throw new Error("CONTENT_BRIEF_INVALID");
  return {
    version: 1,
    originalInput: brief.originalInput,
    ...(brief.revisedInput !== undefined ? { revisedInput: brief.revisedInput } : {}),
    ...(brief.revisedInputIllustrative !== undefined ? { revisedInputIllustrative: brief.revisedInputIllustrative } : {}),
    mode: brief.mode,
    ...(brief.language ? { language: brief.language } : {}),
    creativeAllowed: brief.creativeAllowed,
    simulationAllowed: brief.simulationAllowed,
    sourceIds: [...brief.sourceIds],
  };
}
