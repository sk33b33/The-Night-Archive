import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 002 findings (approved bible). Supported: the vacancy finding is
 * unreliable; the inspection was expected (calendar enlargement, required);
 * who lived there cannot be established. Never accept Ellery as occupant,
 * the house as empty, or a motive for the inspector.
 */
const id = {
  inspection: evidenceId('c002-inspection-report'),
  meter: evidenceId('c002-meter-card'),
  kitchen: evidenceId('c002-kitchen-photo'),
  calendar: evidenceId('c002-calendar-enlargement'),
  tenancy: evidenceId('c002-tenancy-register'),
} as const;

export const CASE_002_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'property-vacant',
    prompt: 'Was 14 Harrow Lane vacant on 2 March 1984?',
    options: [
      { id: 'vacant', text: 'Yes, as the inspection records.' },
      { id: 'occupied', text: 'No. It showed signs of recent occupation.' },
      { id: 'former-tenant', text: 'No. The former tenant had returned.' },
    ],
    supportedOptionId: 'occupied',
    requires: { allOf: [], anyOf: [id.meter, id.kitchen, id.calendar] },
    hints: [
      'Set the inspection’s finding against the other records of the house in early 1984.',
      'A disconnected supply should not use electricity. Check the meter card, and look closely at the kitchen.',
    ],
    citationHint: 'Your answer may hold. Cite a record that shows the house in use in 1984.',
    finding: 'The inspection’s finding of vacancy is unreliable: the house showed signs of occupation in 1984.',
  },
  {
    id: 'inspection-expected',
    prompt: 'Did anyone in the house know the inspection was coming?',
    options: [
      { id: 'unknown-visit', text: 'No. Nothing suggests anyone knew.' },
      { id: 'calendar', text: 'Yes. The house’s own calendar records it.' },
      { id: 'tipped-off', text: 'Yes. The inspector warned the occupant.' },
    ],
    supportedOptionId: 'calendar',
    requires: { allOf: [id.calendar], anyOf: [] },
    hints: [
      'Examine the kitchen photograph region by region.',
      'Look closely at the calendar on the kitchen wall, then cite what it shows.',
    ],
    citationHint: 'Your answer may hold. Cite the record that shows the visit was written down.',
    finding: 'Someone in the house knew the inspection was coming: it is written in the house’s calendar.',
  },
  {
    id: 'occupant',
    prompt: 'Who was living at 14 Harrow Lane?',
    options: [
      { id: 'ellery', text: 'M. Ellery, the last recorded tenant.' },
      { id: 'pell', text: 'Mrs J. Pell, the neighbour.' },
      { id: 'unknown', text: 'The records cannot establish who.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.tenancy], anyOf: [] },
    hints: [
      'Ask what the records actually say about who lived there after 1982.',
      'The tenancy register shows Ellery left in November 1982, and nothing names anyone after that.',
    ],
    citationHint: 'Your answer may hold. Cite the record of who lived there, and when they left.',
    finding: 'Who was living at 14 Harrow Lane in 1984 cannot be established.',
  },
];
