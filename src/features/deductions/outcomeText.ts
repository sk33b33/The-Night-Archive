import type { DeductionOutcome } from '../../domain/deduction';

/** Player-facing wording for each outcome. Procedural, not punitive. */
export const OUTCOME_TEXT: Record<DeductionOutcome, { readonly title: string; readonly body: string }> = {
  correct: {
    title: 'Findings accepted',
    body: 'Each finding is supported by the records you cited. The review is complete.',
  },
  partial: {
    title: 'Findings partly accepted',
    body: 'Some of your findings hold. Others go beyond what the records support.',
  },
  incomplete: {
    title: 'Findings incomplete',
    body: 'Your conclusions may hold, but the records you cited do not yet show them.',
  },
  incorrect: {
    title: 'Findings not accepted',
    body: 'These conclusions are not supported by the records. Nothing is lost: review the file and submit again.',
  },
};
