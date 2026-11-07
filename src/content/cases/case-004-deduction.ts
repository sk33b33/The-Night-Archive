import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 004 findings (approved bible). Provenance only: the date of the
 * photograph is Case 005's question and is never settled here. Never accept
 * that the player, or anyone named, filed it.
 */
const id = {
  photo: evidenceId('c004-photograph'),
  papers: evidenceId('c004-desk-papers'),
  print: evidenceId('c004-print'),
  ledger: evidenceId('c004-intake-ledger'),
  orders: evidenceId('c004-order-book'),
} as const;

export const CASE_004_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'intake',
    prompt: 'Did File 0091 come into the archive through intake?',
    options: [
      { id: 'lost-record', text: 'Yes, but its intake record has been lost.' },
      { id: 'voided', text: 'No. The number was reserved in 1981 and voided.' },
      { id: 'never-used', text: 'No. The number 0091 was never used.' },
    ],
    supportedOptionId: 'voided',
    requires: { allOf: [id.ledger], anyOf: [] },
    hints: [
      'Intake numbers run in sequence. Look at October 1981.',
      'In the intake ledger, 0091 sits between 0090 and 0092, ruled through.',
    ],
    citationHint: 'Your answer may hold. Cite the record of intake numbers.',
    finding: 'File 0091 did not come through intake: the number was reserved in 1981 and voided.',
  },
  {
    id: 'papers',
    prompt: 'What is written on the papers on the desk in the photograph?',
    options: [
      { id: 'illegible', text: 'Nothing legible.' },
      { id: 'ledger-0091', text: 'The number 0091, on an intake-ledger page.' },
      { id: 'order', text: 'A Kessler Photo order.' },
    ],
    supportedOptionId: 'ledger-0091',
    requires: { allOf: [id.papers], anyOf: [] },
    hints: [
      'Examine the photograph region by region.',
      'Look closely at the papers on the desk, then cite the enlargement.',
    ],
    citationHint: 'Your answer may hold. Cite the record that shows the papers closely.',
    finding: 'The photograph shows the number 0091 being written on an intake-ledger page.',
  },
  {
    id: 'print-origin',
    prompt: 'Is the print in File 0091 the print from Kessler order 4471?',
    options: [
      { id: 'yes', text: 'Yes. The lab and the account match.' },
      { id: 'other-lab', text: 'No. It came from another lab.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.print, id.orders], anyOf: [] },
    hints: [
      'Compare what the order book records with what is on the back of the print.',
      'The print carries the lab’s stamp but no order number, and the order book says numbers were not printed.',
    ],
    citationHint: 'Your answer may hold. Cite both the print and the order book.',
    finding: 'Whether the print in File 0091 is the print from order 4471 cannot be established.',
  },
  {
    kind: 'multi',
    id: 'placed-in-1981',
    prompt: 'Which records place the photograph, or its print, in 1981?',
    options: [
      { id: 'imprint', text: 'The date imprint on the photograph' },
      { id: 'paper', text: 'The paper stock of the print' },
      { id: 'order', text: 'The Kessler order book' },
      { id: 'register', text: 'The asset register' },
      { id: 'building', text: 'The building history' },
    ],
    supportedOptionIds: ['imprint', 'order', 'paper'],
    requires: { allOf: [id.photo, id.print], anyOf: [] },
    hints: [
      'Sort the records by which way they point: towards 1981, or away from it.',
      'The imprint, the paper, and the order book point to 1981. The register and the building history point to 1998.',
    ],
    missingHint: 'Your selection leaves out a record that points to 1981.',
    extraHint: 'Your selection includes a record that points away from 1981.',
    citationHint: 'Your selection may hold. Cite the photograph and the print.',
    finding:
      'The date imprint, the print’s paper, and the order book point to 1981; the asset register and building history do not.',
  },
];
