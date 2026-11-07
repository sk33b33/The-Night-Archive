import type { EvidenceId } from './evidence';

/**
 * Deductions: authored questions with deterministic evaluation. A finding
 * holds only if the answer is supported AND the cited evidence shows it.
 * Unsupported theories are never accepted, and hints make sure the player
 * is never stuck. Pure; no React.
 */

export type DeductionOutcome = 'correct' | 'partial' | 'incomplete' | 'incorrect';

/** Per-question result. Kept internal to feedback; never shown as a score. */
export type FindingResult = 'holds' | 'uncited' | 'unsupported';

export interface DeductionOption {
  readonly id: string;
  readonly text: string;
}

export interface EvidenceRequirement {
  /** Every one of these must be cited. */
  readonly allOf: readonly EvidenceId[];
  /** At least one of these must be cited (ignored when empty). */
  readonly anyOf: readonly EvidenceId[];
}

export interface DeductionQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly DeductionOption[];
  /** The only answer the records support. */
  readonly supportedOptionId: string;
  readonly requires: EvidenceRequirement;
  /** Progressive hints, gentlest first. */
  readonly hints: readonly string[];
  /** Shown when the answer is right but the citations do not show it. */
  readonly citationHint: string;
  /** The accepted finding, as recorded once the case closes. */
  readonly finding: string;
}

export interface DeductionSubmission {
  readonly answers: Readonly<Record<string, string>>;
  readonly citations: Readonly<Record<string, readonly EvidenceId[]>>;
}

export interface DeductionAttempt extends DeductionSubmission {
  readonly submittedAt: string;
  readonly outcome: DeductionOutcome;
}

export interface DeductionEvaluation {
  readonly outcome: DeductionOutcome;
  readonly results: Readonly<Record<string, FindingResult>>;
}

export function citationsSatisfy(
  requirement: EvidenceRequirement,
  cited: readonly EvidenceId[],
): boolean {
  const set = new Set<string>(cited);
  return (
    requirement.allOf.every((id) => set.has(id)) &&
    (requirement.anyOf.length === 0 || requirement.anyOf.some((id) => set.has(id)))
  );
}

export function evaluateFinding(
  question: DeductionQuestion,
  submission: DeductionSubmission,
): FindingResult {
  if (submission.answers[question.id] !== question.supportedOptionId) return 'unsupported';
  return citationsSatisfy(question.requires, submission.citations[question.id] ?? [])
    ? 'holds'
    : 'uncited';
}

/**
 * Overall outcome:
 * - correct: every finding holds.
 * - incomplete: no unsupported answers, but some lack citations.
 * - partial: some answers are unsupported, others are right.
 * - incorrect: every answer is unsupported.
 */
export function evaluateDeduction(
  questions: readonly DeductionQuestion[],
  submission: DeductionSubmission,
): DeductionEvaluation {
  const results: Record<string, FindingResult> = {};
  for (const q of questions) results[q.id] = evaluateFinding(q, submission);
  const values = Object.values(results);
  const unsupported = values.filter((r) => r === 'unsupported').length;
  let outcome: DeductionOutcome;
  if (values.every((r) => r === 'holds')) outcome = 'correct';
  else if (unsupported === 0) outcome = 'incomplete';
  else if (unsupported === values.length) outcome = 'incorrect';
  else outcome = 'partial';
  return { outcome, results };
}

export function isComplete(questions: readonly DeductionQuestion[], submission: DeductionSubmission): boolean {
  return questions.every((q) => q.options.some((o) => o.id === submission.answers[q.id]));
}

export function isSolved(attempts: readonly DeductionAttempt[]): boolean {
  return attempts.some((a) => a.outcome === 'correct');
}

/**
 * The hint for the latest failed attempt: about the first finding that does
 * not hold, getting more specific with each failed attempt.
 */
export function hintFor(
  questions: readonly DeductionQuestion[],
  attempts: readonly DeductionAttempt[],
): string | null {
  const latest = attempts[attempts.length - 1];
  if (!latest || latest.outcome === 'correct') return null;
  const { results } = evaluateDeduction(questions, latest);
  const question = questions.find((q) => results[q.id] !== 'holds');
  if (!question) return null;
  if (results[question.id] === 'uncited') return question.citationHint;
  const failed = attempts.filter((a) => a.outcome !== 'correct').length;
  return question.hints[Math.min(failed, question.hints.length) - 1] ?? null;
}
