import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 010 findings (approved bible). The badge records put the night
 * archivist in the stack room at 06:00; camera 2 shows someone at position
 * 7; only the handover log says the night archivist was there. Never accept
 * that the player was in two places, a motive, "M.", or a mechanism.
 */
const id = {
  doorLog: evidenceId('c010-door-log'),
  cctv: evidenceId('c010-cctv'),
  handover: evidenceId('c010-handover-log'),
  comparison: evidenceId('c010-handover-note'),
} as const;

export const CASE_010_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'badge-0600',
    prompt: 'Where do the badge records place the night archivist at 06:00?',
    options: [
      { id: 'stack-room', text: 'In the stack room.' },
      { id: 'position-7', text: 'At position 7, in the reading room.' },
      { id: 'none', text: 'Nowhere. No badge record covers 06:00.' },
    ],
    supportedOptionId: 'stack-room',
    requires: { allOf: [id.doorLog], anyOf: [] },
    hints: ['Find the badge entries either side of 06:00.', 'Into the stack room at 05:50, out at 06:04.'],
    citationHint: 'Your answer may hold. Cite the door and badge log.',
    finding: 'At 06:00 the badge records place the night archivist in the stack room.',
  },
  {
    id: 'camera-0600',
    prompt: 'What does camera 2 show at position 7 at 06:00?',
    options: [
      { id: 'night-archivist', text: 'The night archivist, handing over.' },
      { id: 'someone', text: 'Someone seated with the day archivist; the face is not visible.' },
      { id: 'empty', text: 'An empty desk.' },
    ],
    supportedOptionId: 'someone',
    requires: { allOf: [id.cctv], anyOf: [] },
    hints: ['Step the footage to 06:00.', 'At 06:00:10 someone is seated at position 7. Can the footage say who?'],
    citationHint: 'Your answer may hold. Cite the footage.',
    finding: 'At 06:00 camera 2 shows someone seated at position 7 with the day archivist; the face is not visible.',
  },
  {
    kind: 'multi',
    id: 'says-desk',
    prompt: 'Which records say the night archivist was at position 7 at 06:00?',
    options: [
      { id: 'handover', text: 'The handover log' },
      { id: 'door', text: 'The door and badge log' },
      { id: 'shift', text: 'Your shift log' },
      { id: 'cctv', text: 'The camera 2 footage' },
      { id: 'ledger', text: 'The intake ledger' },
    ],
    supportedOptionIds: ['handover'],
    requires: { allOf: [id.handover], anyOf: [] },
    hints: [
      'A record must say who, not only that someone was there.',
      'The footage shows someone. Only one record names the night archivist at the desk.',
    ],
    missingHint: 'Your selection leaves out the record that says so.',
    extraHint: 'Your selection includes a record that does not place the night archivist at position 7.',
    citationHint: 'Your selection may hold. Cite the handover log.',
    finding: 'Only the handover log places the night archivist at position 7 at 06:00.',
  },
  {
    id: 'hand',
    prompt: 'Is the “M.” in the handover log consistent with the hand of slip 0094?',
    options: [
      { id: 'consistent', text: 'Yes. It is consistent with it.' },
      { id: 'same-person', text: 'Yes. The same person wrote both.' },
      { id: 'no', text: 'No.' },
    ],
    supportedOptionId: 'consistent',
    requires: { allOf: [id.comparison], anyOf: [] },
    hints: ['Compare the handover “M.” with the slip.', 'Match the crossed M, and remember what a comparison can show.'],
    citationHint: 'Your answer may hold. Cite the comparison note.',
    finding: 'The “M.” in the handover log is consistent with the hand of slip 0094.',
  },
  {
    id: 'seated',
    prompt: 'Who was seated at position 7 at 06:00?',
    options: [
      { id: 'you', text: 'You, the night archivist.' },
      { id: 'nash', text: 'P. Nash, the day archivist.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.cctv, id.doorLog], anyOf: [] },
    hints: [
      'The day archivist is standing in the footage.',
      'Your badge is in the stack room, and the seated figure’s face is never in frame.',
    ],
    citationHint: 'Your answer may hold. Cite the footage and the door log.',
    finding: 'Who was seated at position 7 at 06:00 cannot be established.',
  },
];
