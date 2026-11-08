import { ARCHIVE_DESK, FINALE } from '../archive';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { CASE_001_REEL, VOICE_ISOLATION } from './case-001-audio';
import { CASE_007_TONIGHT } from './case-007-audio';
import { CASE_014_QUESTIONS } from './case-014-deduction';

/**
 * Case 014 — The Night Archivist (Season 2 finale). Canon:
 * docs/cases/case-014-bible.md (approved, reveal level 2). A record names
 * "Mara —". The case closes on a one-time choice: file 0094, or don't.
 * Neither is marked as right, and neither explains anything.
 */
export const CASE_014_IDS = {
  slip: evidenceId('c014-slip'),
  procedure: evidenceId('c014-procedure'),
  ledger: evidenceId('c014-intake-ledger'),
  post: evidenceId('c014-post-record'),
  tonight: evidenceId('c014-tonight'),
  reel: evidenceId('c014-reel-1981'),
  comparison: evidenceId('c014-comparison-note'),
  extensionLog: evidenceId('c014-extension-log'),
  exchange: evidenceId('c014-exchange'),
  nightDesk: evidenceId('c014-night-desk-log'),
  dates: evidenceId('c014-dates'),
} as const;

const C14 = caseId(FINALE.caseId);
const filed = { id: FINALE.choiceId, value: 'filed' } as const;
const unfiled = { id: FINALE.choiceId, value: 'unfiled' } as const;

export const CASE_014: CaseDefinition = {
  id: C14,
  number: '014',
  title: 'The Night Archivist',
  location: 'Records facility, Bellwether — tonight, 06:10',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-013'),
  briefing: {
    summary: 'The 03:40 call, assembled. Then one last intake.',
    assignment: [
      'The shift is over, except for intake 0094. It is in the ledger, but an intake is filed only when the receiving archivist signs the slip, and the slip is unsigned.',
      'Assemble what the records say about the 03:40 call, in 1981 and tonight. Establish whom the second voice addresses. Then close the shift. Record only what the evidence supports.',
    ],
    reportId: CASE_014_IDS.slip,
  },
  evidence: [
    {
      id: CASE_014_IDS.slip,
      kind: 'document',
      title: 'Intake slip 0094',
      reference: 'File 014 · Item 1',
      description: 'The handwritten slip from the envelope, as it stands.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake slip',
        heading: 'Intake slip — 0094',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Number', value: '0094' },
              { label: 'Time', value: '06:00' },
              { label: 'Description', value: 'Photograph' },
              { label: 'Filed by', value: 'M.' },
              { label: 'Received by', value: '—' },
            ],
          },
          { type: 'paragraph', text: 'Handwritten in blue ink. The “Received by” line is blank.' },
        ],
      },
      amendments: [
        {
          id: 'signed',
          whenCaseClosed: C14,
          whenChoice: filed,
          block: { type: 'paragraph', text: `Received by: night archivist, ${ARCHIVE_DESK.workstation}. 06:12.` },
        },
      ],
    },
    {
      id: CASE_014_IDS.procedure,
      kind: 'document',
      title: 'Intake procedure',
      reference: 'File 014 · Item 2',
      description: 'How an intake is filed.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Procedure',
        heading: 'Intake procedure — Records facility',
        blocks: [
          { type: 'paragraph', text: 'An intake is filed when the receiving archivist signs the slip.' },
          { type: 'paragraph', text: 'Until then the ledger line is provisional.' },
          { type: 'paragraph', text: 'An intake not signed by close of shift is recorded as not filed.' },
        ],
      },
    },
    {
      id: CASE_014_IDS.ledger,
      kind: 'document',
      title: 'Intake ledger, tonight',
      reference: 'File 014 · Item 3',
      description: 'Intake numbers issued tonight, with their status.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake ledger',
        heading: 'Intake ledger — Records facility, tonight',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['No.', 'Time', 'Description', 'Filed by', 'Status'],
            rows: [
              ['0093', '03:40', 'Photograph', 'M.', 'Filed'],
              ['0094', '06:00', 'Photograph', 'M.', 'Provisional'],
            ],
          },
        ],
      },
      amendments: [
        { id: 'filed', whenCaseClosed: C14, whenChoice: filed, setCell: { blockIndex: 0, row: 1, column: 4, value: 'Filed' } },
        { id: 'unfiled', whenCaseClosed: C14, whenChoice: unfiled, setCell: { blockIndex: 0, row: 1, column: 4, value: 'Not filed' } },
      ],
    },
    {
      id: CASE_014_IDS.post,
      kind: 'document',
      title: 'Post record, NA-07 (full)',
      reference: 'File 014 · Item 4',
      description: 'The personnel copy of the post record for your workstation.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Personnel',
        heading: `Post record (personnel copy) — night archivist, Workstation ${ARCHIVE_DESK.workstation}`,
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Post', value: 'Night archivist' },
              { label: 'Workstation', value: ARCHIVE_DESK.workstation },
              { label: 'Holder', value: 'Mara —' },
            ],
          },
          { type: 'paragraph', text: 'Surname withheld.' },
        ],
      },
    },
    {
      id: CASE_014_IDS.tonight,
      kind: 'audio',
      title: 'NA-07 answerphone recording',
      reference: 'File 014 · Item 5',
      description: 'A copy of tonight’s 03:40 recording.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Copy of', value: 'File 007, Item 1' },
        { label: 'Recorded', value: 'Tonight, 03:40:00' },
        { label: 'Running time', value: '0:31' },
      ],
      timeline: CASE_007_TONIGHT,
      filters: [VOICE_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_014_IDS.reel,
      kind: 'audio',
      title: 'Audio reel, 1981',
      reference: 'File 014 · Item 6',
      description: 'A copy of the reel from File 001.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Copy of', value: 'File 001, Item 2' },
        { label: 'Running time', value: '0:50' },
      ],
      timeline: CASE_001_REEL,
      filters: [VOICE_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_014_IDS.comparison,
      kind: 'document',
      title: 'Audio comparison note',
      reference: 'File 014 · Item 7',
      description: 'A copy of the Case 007 comparison note.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Audio comparison',
        heading: 'Comparison note — NA-07 recording (tonight) and audio reel (1981)',
        blocks: [
          {
            type: 'paragraph',
            text: 'The two recordings match segment for segment: the announcement, the clock chime, and both voices.',
          },
          { type: 'paragraph', text: 'Tonight’s recording is clearer.' },
        ],
      },
    },
    {
      id: CASE_014_IDS.extensionLog,
      kind: 'document',
      title: 'Extension log, NA-07, tonight',
      reference: 'File 014 · Item 8',
      description: 'A copy of tonight’s extension log.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Telephony',
        heading: `Extension log — ${ARCHIVE_DESK.workstation}, tonight`,
        blocks: [
          {
            type: 'table',
            caption: 'Calls',
            columns: ['Time', 'Direction', 'Duration', 'Status', 'Origin'],
            rows: [['03:40:00', 'Incoming', '0:31', 'Not answered, recorded', 'External, exchange route BW-4']],
          },
        ],
      },
    },
    {
      id: CASE_014_IDS.exchange,
      kind: 'document',
      title: 'Exchange record, route BW-4, 1981',
      reference: 'File 014 · Item 9',
      description: 'A copy of the 1981 kiosk call record.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Exchange',
        heading: 'Exchange record — route BW-4 (kiosk, east platform), 14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Calls',
            columns: ['Time', 'Direction', 'Duration', 'Destination'],
            rows: [['03:40', 'Outgoing', '0:31', 'Not recorded']],
          },
        ],
      },
    },
    {
      id: CASE_014_IDS.nightDesk,
      kind: 'document',
      title: 'Night desk log, 1981',
      reference: 'File 014 · Item 10',
      description: 'A copy of the records facility night desk log, 13–14 October 1981.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Night desk',
        heading: 'Night desk log — Records facility, 13–14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Time', 'Entry'],
            rows: [['03:40', 'Call received from E. Ward. Not filed.']],
          },
          { type: 'paragraph', text: 'No signature.' },
        ],
      },
      // The unfiled ending: a second line, in the blue hand. Never explained.
      amendments: [
        { id: 'not-filed', whenCaseClosed: C14, whenChoice: unfiled, appendRow: { blockIndex: 0, row: ['06:12', 'Not filed.'] } },
      ],
    },
    {
      id: CASE_014_IDS.dates,
      kind: 'document',
      title: 'Dates on file',
      reference: 'File 014 · Item 11',
      description: 'Dates from the records reviewed this shift, in one place.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Examiner',
        heading: 'Dates on file — the east door, route BW-4, and NA-07',
        blocks: [
          {
            type: 'table',
            caption: 'Dates',
            columns: ['Date', 'Record', 'Entry'],
            rows: [
              ['1979', 'Works register', 'East platform door sealed'],
              ['14 Oct 1981, 03:40', 'Exchange record', 'Outgoing call from the east platform kiosk, route BW-4'],
              ['1983', 'Routing record', 'Route BW-4 withdrawn'],
              ['1998', 'Extension register', 'Extension NA-07 created'],
              ['Tonight, 03:40', 'Extension log', 'Incoming call to NA-07, route BW-4'],
            ],
          },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_014_IDS.post,
      to: CASE_014_IDS.tonight,
      relation: 'same-subject',
      reason: 'The post record names the holder of NA-07 “Mara —”; the second voice on the recording says “Mara”.',
    },
    {
      from: CASE_014_IDS.tonight,
      to: CASE_014_IDS.reel,
      relation: 'corroborates',
      reason: 'The two recordings match segment for segment.',
    },
    {
      from: CASE_014_IDS.exchange,
      to: CASE_014_IDS.extensionLog,
      relation: 'corroborates',
      reason: 'Both log a 0:31 call at 03:40, by route BW-4.',
    },
    {
      from: CASE_014_IDS.nightDesk,
      to: CASE_014_IDS.exchange,
      relation: 'same-subject',
      reason: 'Both record a call at 03:40 on 14 October 1981.',
    },
    {
      from: CASE_014_IDS.procedure,
      to: CASE_014_IDS.slip,
      relation: 'same-subject',
      reason: 'The procedure says an intake is filed when the slip is signed; the 0094 slip is unsigned.',
    },
    {
      from: CASE_014_IDS.comparison,
      to: CASE_014_IDS.tonight,
      relation: 'derived-from',
      reason: 'The note is made by comparing tonight’s recording with the 1981 reel.',
    },
  ],
  questions: CASE_014_QUESTIONS,
  closingChoice: {
    id: FINALE.choiceId,
    heading: 'Close the shift: intake 0094',
    body: [
      'Intake 0094 is in the ledger, provisional. The slip’s “Received by” line is blank.',
      'An intake is filed when the receiving archivist signs the slip.',
    ],
    options: [
      {
        value: 'filed',
        label: 'Sign and file 0094',
        consequence: 'You sign the slip as the receiving archivist, and intake 0094 is filed.',
      },
      {
        value: 'unfiled',
        label: 'Leave 0094 unfiled',
        consequence: 'The slip stays unsigned, and intake 0094 is recorded as not filed.',
      },
    ],
  },
};
