import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 013 findings (approved bible). One register lists a Ward: E. Ward,
 * courier, records facility. Whether that is the report's "Elias Ward"
 * cannot be established. Never accept that E. Ward made the call, is
 * Elias Ward, is E. Warden, was sent by M., or opened the door.
 */
const id = {
  note: evidenceId('c013-crossref-note'),
  facility: evidenceId('c013-facility-register'),
  courier: evidenceId('c013-courier-log'),
  report: evidenceId('c013-incident-report'),
  roster: evidenceId('c013-roster'),
  sb07: evidenceId('c013-sb07-line'),
} as const;

export const CASE_013_QUESTIONS: readonly DeductionQuestion[] = [
  {
    kind: 'multi',
    id: 'registers-ward',
    prompt: 'Which 1981 registers list a Ward?',
    options: [
      { id: 'railway', text: 'Railway district staff' },
      { id: 'facility', text: 'Records facility staff' },
      { id: 'exchange', text: 'Telephone exchange staff' },
      { id: 'police', text: 'Police division staff' },
    ],
    supportedOptionIds: ['facility'],
    missingHint: 'One register does list a Ward. Search the cross-reference for the surname.',
    extraHint: 'A near match is not a match. Read the names the search returns, letter by letter.',
    requires: { allOf: [id.note], anyOf: [] },
    hints: ['Search the cross-reference for “Ward”.', 'Warden and Edwards contain the letters, not the surname.'],
    citationHint: 'Your selection may hold. Cite the cross-reference note.',
    finding: 'Of the four 1981 registers, only the records facility’s lists a Ward.',
  },
  {
    id: 'ward-post',
    prompt: 'What post did E. Ward hold?',
    options: [
      { id: 'courier', text: 'Courier, records facility, March 1980 to 31 October 1981.' },
      { id: 'station', text: 'Station staff at Bellwether, as the report says.' },
      { id: 'signalman', text: 'Signalman at Harlow Junction.' },
    ],
    supportedOptionId: 'courier',
    requires: { allOf: [id.note], anyOf: [] },
    hints: ['Read the entry the search finds.', 'The records facility register gives a post and two dates.'],
    citationHint: 'Your answer may hold. Cite the cross-reference note.',
    finding: 'E. Ward was a courier at the records facility from March 1980 to 31 October 1981.',
  },
  {
    kind: 'ordering',
    id: 'ward-order',
    prompt: 'Put these in order.',
    items: [
      { id: 'report', text: 'The report names its caller as “Elias Ward”.' },
      { id: 'ended', text: 'E. Ward’s employment at the facility ends.' },
      { id: 'joined', text: 'E. Ward joins the records facility.' },
      { id: 'sb07', text: 'Box SB-07 is deposited at the facility.' },
      { id: 'out', text: 'E. Ward signs out to Bellwether station.' },
    ],
    supportedOrder: ['joined', 'out', 'report', 'sb07', 'ended'],
    requires: { allOf: [id.facility, id.courier, id.report, id.sb07], anyOf: [] },
    hints: [
      'Each item has a date in one of the records: register, courier log, report, inventory line.',
      'March 1980; 13 Oct, 22:40; 14 Oct, 03:40; 15 Oct; 31 Oct.',
    ],
    citationHint: 'Your order may hold. It rests on four records: the register, the courier log, the report and the SB-07 line.',
    finding:
      'E. Ward joined in March 1980; signed out to Bellwether on 13 October at 22:40; the report named “Elias Ward” on 14 October at 03:40; SB-07 was deposited on 15 October; Ward’s employment ended on 31 October 1981.',
  },
  {
    id: 'after-out',
    prompt: 'What does the courier log record after E. Ward signs out?',
    options: [
      { id: 'none', text: 'No return is recorded.' },
      { id: 'returned', text: 'Ward returned at 08:10.' },
      { id: 'arrived', text: 'Ward arrived at Bellwether station.' },
    ],
    supportedOptionId: 'none',
    requires: { allOf: [id.courier], anyOf: [] },
    hints: ['Read every line of the courier log after 22:40.', 'Who signs out at 08:10?'],
    citationHint: 'Your answer may hold. Cite the courier log.',
    finding: 'The courier log records E. Ward out to Bellwether at 22:40 on 13 October 1981, and no return.',
  },
  {
    id: 'same-ward',
    prompt: 'Is the report’s “Elias Ward” the records facility’s E. Ward?',
    options: [
      { id: 'same', text: 'Yes. Same surname, same initial, the same night.' },
      { id: 'different', text: 'No. One is station staff; the other is a courier.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.note], anyOf: [id.report, id.roster] },
    hints: [
      'What does the register give for a first name?',
      'The report says station staff; the roster has no Ward. Does either record settle who “Elias Ward” was?',
    ],
    citationHint: 'Your answer may hold. Cite the cross-reference note, and the report or the roster.',
    finding:
      'Whether the report’s “Elias Ward” is the facility’s E. Ward cannot be established. The register gives only an initial, and the report’s “station staff” is not borne out by the roster.',
  },
];
