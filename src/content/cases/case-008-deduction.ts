import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 008 findings (approved bible). File 0093 was filed at 03:40; its
 * photograph matches the desk as recorded at 05:12. Never accept that it
 * "predicts", that M. or the player sent or filed anything, or a mechanism.
 */
const id = {
  ledger: evidenceId('c008-intake-ledger'),
  timing: evidenceId('c008-timing-note'),
  cctv: evidenceId('c008-cctv'),
  lamp: evidenceId('c008-lamp-log'),
  post: evidenceId('c008-post-log'),
} as const;

export const CASE_008_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'filed',
    prompt: 'When was File 0093 filed?',
    options: [
      { id: '0340', text: 'At 03:40, as the intake ledger records.' },
      { id: '0512', text: 'At 05:12, when the photograph was taken.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: '0340',
    requires: { allOf: [id.ledger], anyOf: [] },
    hints: ['One record gives the time the number was issued.', 'Tonight’s intake ledger: 0093, 03:40.'],
    citationHint: 'Your answer may hold. Cite the intake ledger.',
    finding: 'File 0093 was filed at 03:40.',
  },
  {
    id: 'matches',
    prompt: 'When does the File 0093 photograph match the records of the desk?',
    options: [
      { id: '0340', text: 'At 03:40, when it was filed.' },
      { id: '0512', text: 'At 05:12, later tonight.' },
      { id: 'never', text: 'It matches no record of the desk.' },
    ],
    supportedOptionId: '0512',
    requires: { allOf: [id.timing], anyOf: [] },
    hints: [
      'Compare the photograph with camera 2’s later footage.',
      'Match the wall clock in the photograph with the exported 05:12 still.',
    ],
    citationHint: 'Your answer may hold. Cite the record of the comparison.',
    finding: 'The File 0093 photograph matches the desk as recorded at 05:12.',
  },
  {
    kind: 'ordering',
    id: 'sequence',
    prompt: 'Put these in the order they happened.',
    items: [
      { id: 'moment', text: 'The moment shown in the photograph (05:12).' },
      { id: 'received', text: 'You log the envelope as received (05:15).' },
      { id: 'filed', text: 'File 0093 is filed (03:40).' },
      { id: 'delivered', text: 'An envelope is delivered to NA-07 (05:10).' },
      { id: 'lamp', text: 'The desk lamp goes off (05:08).' },
    ],
    supportedOrder: ['filed', 'lamp', 'delivered', 'moment', 'received'],
    requires: { allOf: [id.ledger, id.cctv], anyOf: [] },
    hints: ['Every item carries its time.', 'The file comes first; everything it shows comes after.'],
    citationHint: 'Your order may hold. Cite the intake ledger and the footage.',
    finding: 'File 0093 was filed at 03:40, before every event its photograph shows.',
  },
  {
    kind: 'multi',
    id: 'desk-0512',
    prompt: 'Which records describe the desk at 05:12?',
    options: [
      { id: 'cctv', text: 'The camera 2 footage' },
      { id: 'lamp', text: 'The lamp circuit log' },
      { id: 'post', text: 'The internal post log' },
      { id: 'ledger', text: 'The intake ledger' },
      { id: 'shift', text: 'Your shift log' },
    ],
    supportedOptionIds: ['cctv', 'lamp', 'post'],
    requires: { allOf: [], anyOf: [id.cctv, id.lamp, id.post] },
    hints: [
      'Which records say what was on, or on top of, the desk shortly before 05:12?',
      'The footage shows it; the lamp log says the lamp was off; the post log says an envelope had arrived.',
    ],
    missingHint: 'Your selection leaves out a record of the desk around 05:12.',
    extraHint: 'Your selection includes a record that says nothing about the desk at 05:12.',
    citationHint: 'Your selection may hold. Cite one of those records.',
    finding: 'The footage, the lamp log, and the post log describe the desk at 05:12.',
  },
  {
    id: 'sender',
    prompt: 'Who sent the envelope?',
    options: [
      { id: 'm', text: 'M.' },
      { id: 'porter', text: 'The night porter.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.post], anyOf: [] },
    hints: ['The post log records who carried it. Does it record who sent it?', 'Sender: not recorded.'],
    citationHint: 'Your answer may hold. Cite the internal post log.',
    finding: 'Who sent the envelope cannot be established.',
  },
];
