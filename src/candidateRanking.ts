/** Versioned scoring shared by generation, recommendation previews, and exports. */
export const CANDIDATE_RANKING_VERSION = 1 as const;
export type CandidateState = "pending" | "ready" | "degraded" | "failed";
export type ParameterSource =
  | "user-fact"
  | "derived"
  | "creative"
  | "simulated";
export interface ParameterAssessment {
  field: string;
  score: number;
  sourceType: ParameterSource;
  evidenceRef?: string[];
  requiresExampleLabel?: boolean;
}
export interface CandidateScores {
  semantic: number;
  layout: number;
  fidelity: number;
}
export interface RankedCandidate {
  compositionId: string;
  slotId: string;
  state: CandidateState;
  scores: CandidateScores;
}
const score = (value: number): number => {
  if (!Number.isFinite(value) || value < 0 || value > 100)
    throw new Error("CANDIDATE_INVALID_SCORE");
  return value;
};

/** Registry importance is normalized: adding fields never adds points by itself.
 * Optional omitted fields must be excluded by the caller; missing required fields
 * fail schema validation before ranking and cannot be repaired with a low score.
 */
export function weightedParameterScore(
  assessments: readonly ParameterAssessment[],
  importance: Readonly<Record<string, number>>,
): number {
  let weighted = 0,
    total = 0;
  const seen = new Set<string>();
  for (const assessment of assessments) {
    const weight = Object.prototype.hasOwnProperty.call(
      importance,
      assessment.field,
    )
      ? importance[assessment.field]
      : undefined;
    if (
      seen.has(assessment.field) ||
      weight === undefined ||
      !Number.isFinite(weight) ||
      weight <= 0
    )
      throw new Error("CANDIDATE_INVALID_ASSESSMENT");
    seen.add(assessment.field);
    weighted += score(assessment.score) * weight;
    total += weight;
  }
  if (!total) throw new Error("CANDIDATE_MISSING_ASSESSMENT");
  return weighted / total;
}

/** Initial experimental weights; only measured, usable candidates are ranked. */
export function candidateScore(scores: CandidateScores): number {
  return (
    Math.round(
      (0.5 * score(scores.semantic) +
        0.3 * score(scores.layout) +
        0.2 * score(scores.fidelity)) *
        1000,
    ) / 1000
  );
}

/** Stable ties do not depend on arrival order, locale, or batch registration order. */
export function rankCandidates<T extends RankedCandidate>(
  candidates: readonly T[],
): T[] {
  const identities = new Set<string>();
  for (const candidate of candidates) {
    const key = JSON.stringify([candidate.slotId, candidate.compositionId]);
    if (!candidate.slotId || !candidate.compositionId || identities.has(key))
      throw new Error("CANDIDATE_DUPLICATE_ID");
    identities.add(key);
  }
  const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  return candidates
    .filter(
      (candidate) =>
        candidate.state === "ready" || candidate.state === "degraded",
    )
    .slice()
    .sort(
      (a, b) =>
        candidateScore(b.scores) - candidateScore(a.scores) ||
        compare(a.slotId, b.slotId) ||
        compare(a.compositionId, b.compositionId),
    );
}
