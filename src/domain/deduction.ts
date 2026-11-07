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

interface QuestionBase {
  readonly id: string;
  readonly prompt: string;
  readonly requires: EvidenceRequirement;
  /** Progressive hints, gentlest first. */
  readonly hints: readonly string[];
  /** Shown when the answer is right but the citations do not show it. */
  readonly citationHint: string;
  /** The accepted finding, as recorded once the case closes. */
  readonly finding: string;
}

/** Choose one answer. */
export interface ChoiceQuestion extends QuestionBase {
  readonly kind?: 'choice';
  readonly options: readonly DeductionOption[];
  /** The only answer the records support. */
  readonly supportedOptionId: string;
}

/**
 * Put events in order. The answer is stored as the item IDs joined by
 * commas, so attempts keep the same save shape as choice questions.
 */
export interface OrderingQuestion extends QuestionBase {
  readonly kind: 'ordering';
  /** Items in the order first shown to the player (not the answer). */
  readonly items: readonly DeductionOption[];
  /** The only order the records support. */
  readonly supportedOrder: readonly string[];
}

export type DeductionQuestion = ChoiceQuestion | OrderingQuestion;

export function isOrdering(question: DeductionQuestion): question is OrderingQuestion {
  return question.kind === 'ordering';
}

export function encodeOrder(ids: readonly string[]): string {
  return ids.join(',');
}

/** The player's current order for an ordering question (initial order if untouched). */
export function orderOf(question: OrderingQuestion, answer: string | undefined): string[] {
  const known = new Set(question.items.map((i) => i.id));
  const ids = (answer ?? '').split(',').filter((id) => known.has(id));
  return ids.length === question.items.length && new Set(ids).size === ids.length
    ? ids
    : question.items.map((i) => i.id);
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
  const answer = submission.answers[question.id];
  const supported = isOrdering(question)
    ? encodeOrder(orderOf(question, answer)) === encodeOrder(question.supportedOrder)
    : answer === question.supportedOptionId;
  if (!supported) return 'unsupported';
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

/** Every choice question answered. Ordering questions always have an order. */
export function isComplete(questions: readonly DeductionQuestion[], submission: DeductionSubmission): boolean {
  return questions.every(
    (q) => isOrdering(q) || q.options.some((o) => o.id === submission.answers[q.id]),
  );
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
