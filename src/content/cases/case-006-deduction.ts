import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 006 findings (approved bible). Someone was at the player's desk
 * during the player's break; the night entrance opened with no badge; the
 * File 0091 photograph shares camera 2's viewpoint. Never identify the
 * figure, never accept "it was you", "M.", or "Mara".
 */
const id = {
  cctv: evidenceId('c006-cctv'),
  still: evidenceId('c006-still'),
  viewpoint: evidenceId('c006-viewpoint-note'),
  access: evidenceId('c006-access-log'),
  shift: evidenceId('c006-shift-log'),
} as const;

export const CASE_006_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'position-7',
    prompt: 'Who was at position 7 at 03:40?',
    options: [
      { id: 'you', text: 'You, the night archivist.' },
      { id: 'unknown', text: 'Someone who cannot be identified, while you were on break.' },
      { id: 'm', text: '“M.”' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.cctv, id.shift], anyOf: [] },
    hints: [
      'Where were you at 03:40, according to your own log?',
      'Your shift log puts you in the staff room from 03:30 to 03:50. The footage never shows the figure’s face.',
    ],
    citationHint: 'Your answer may hold. Cite the footage and your shift log.',
    finding: 'Someone who cannot be identified was at position 7 at 03:40, while the night archivist was on break.',
  },
  {
    id: 'night-entrance',
    prompt: 'Did anyone come in through the night entrance after 22:02?',
    options: [
      { id: 'no', text: 'No. The access log shows no entry.' },
      { id: 'door-no-badge', text: 'The door opened at 23:10, but no badge entry is recorded.' },
      { id: 'figure-entered', text: 'Yes. The figure entered at 23:10.' },
    ],
    supportedOptionId: 'door-no-badge',
    requires: { allOf: [id.cctv, id.access], anyOf: [] },
    hints: [
      'Step through the footage around 23:10 and watch the far wall.',
      'The door stands open in one frame. Compare that with the badge entries in the access log.',
    ],
    citationHint: 'Your answer may hold. Cite the footage and the access log.',
    finding: 'The night entrance opened at 23:10 with no badge entry recorded.',
  },
  {
    id: 'viewpoint',
    prompt: 'Where was the File 0091 photograph taken from?',
    options: [
      { id: 'desk', text: 'From the desk at position 7.' },
      { id: 'camera-2-viewpoint', text: 'From camera 2’s viewpoint.' },
      { id: 'camera-2', text: 'It was taken by camera 2.' },
    ],
    supportedOptionId: 'camera-2-viewpoint',
    requires: { allOf: [id.viewpoint], anyOf: [] },
    hints: [
      'Compare the still from camera 2 with the File 0091 photograph.',
      'Match the window in both photographs, then cite what the comparison shows.',
    ],
    citationHint: 'Your answer may hold. Cite the record of the comparison.',
    finding: 'The File 0091 photograph was taken from camera 2’s viewpoint.',
  },
  {
    kind: 'ordering',
    id: 'tonight',
    prompt: 'Put tonight’s events in order.',
    items: [
      { id: 'figure', text: 'A figure is at position 7.' },
      { id: 'found', text: 'File 0091 is found in the Unfiled tray.' },
      { id: 'door', text: 'The night-entrance door stands open.' },
      { id: 'break-ends', text: 'Your break ends.' },
      { id: 'on-shift', text: 'You come on shift.' },
      { id: 'break-begins', text: 'Your break begins.' },
    ],
    supportedOrder: ['on-shift', 'door', 'break-begins', 'figure', 'break-ends', 'found'],
    requires: { allOf: [id.shift, id.cctv], anyOf: [] },
    hints: [
      'Your shift log and the footage’s timestamps give every time you need.',
      '22:02, 23:10, 03:30, 03:40, 03:50, 04:05.',
    ],
    citationHint: 'Your order may hold. Cite your shift log and the footage.',
    finding: 'The door opened at 23:10; the figure was at position 7 at 03:40, inside your 03:30–03:50 break.',
  },
  {
    kind: 'multi',
    id: 'someone-else',
    prompt: 'Which records place someone other than you in the reading room tonight?',
    options: [
      { id: 'cctv', text: 'The camera 2 footage' },
      { id: 'still', text: 'The camera 2 still' },
      { id: 'access', text: 'The access log' },
      { id: 'shift', text: 'Your shift log' },
      { id: 'call-log', text: 'The call log extract' },
    ],
    supportedOptionIds: ['cctv', 'still'],
    requires: { allOf: [], anyOf: [id.cctv, id.still] },
    hints: [
      'Which records actually show a person who is not you?',
      'Only the camera shows the figure. The logs record you, a door, and a call — not another person.',
    ],
    missingHint: 'Your selection leaves out a record that shows the figure.',
    extraHint: 'Your selection includes a record that does not show anyone else.',
    citationHint: 'Your selection may hold. Cite the footage or the still.',
    finding: 'Only camera 2’s footage and still place someone other than the night archivist in the reading room.',
  },
];
