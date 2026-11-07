import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { BACKGROUND_ISOLATION, CASE_003_CALL, ROOM_SOUND_DISCOVERY } from './case-003-audio';
import { CASE_003_QUESTIONS } from './case-003-deduction';

/**
 * Case 003 — The Unknown Caller. Canon: docs/cases/case-003-bible.md
 * (approved). Records never identify the caller or explain the addresses.
 */
export const CASE_003_IDS = {
  callLog: evidenceId('c003-call-log'),
  recording: evidenceId('c003-recording'),
  analysis: evidenceId('c003-background-analysis'),
  fault: evidenceId('c003-fault-report'),
  handset: evidenceId('c003-handset'),
  trace: evidenceId('c003-trace'),
  attendance: evidenceId('c003-attendance'),
} as const;

const NIGHTLY = 'Attended. Nothing found.';

export const CASE_003: CaseDefinition = {
  id: caseId('case-003'),
  number: '003',
  title: 'The Unknown Caller',
  location: 'Bellwether',
  accessLevel: 1,
  availableAfter: caseId('case-002'),
  briefing: {
    summary: 'Five night calls from a call box, each about a different house. Closed as a hoax.',
    assignment: [
      'Over five nights in November 1986 an anonymous caller reported a man watching a house, a different address each time. The file was closed as a hoax.',
      'Establish where the calls came from and what the records can say about the caller. Record only what the evidence supports.',
    ],
    reportId: CASE_003_IDS.callLog,
  },
  evidence: [
    {
      id: CASE_003_IDS.callLog,
      kind: 'document',
      title: 'Control room call log',
      reference: 'File 003 · Item 1',
      description: 'Five calls logged by the police control room.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Control room',
        heading: 'Call log — anonymous reports, 3–7 November 1986',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Caller', value: 'Would not give name' },
              { label: 'Stated location', value: 'Station Road call box' },
              { label: 'Report', value: 'A man watching a house' },
            ],
          },
          {
            type: 'table',
            caption: 'Calls received',
            columns: ['Call', 'Date', 'Time', 'Address reported', 'Result'],
            rows: [
              ['1', 'Mon 3 Nov', '23:10', '4 Mill Street', NIGHTLY],
              ['2', 'Tue 4 Nov', '23:14', '27 Church Road', NIGHTLY],
              ['3', 'Wed 5 Nov', '23:12', '9 Canal Row', NIGHTLY],
              ['4', 'Thu 6 Nov', '23:21', '2 Station Road', NIGHTLY],
              ['5', 'Fri 7 Nov', '23:25', '12 Harrow Lane', NIGHTLY],
            ],
          },
          { type: 'paragraph', text: 'Finding: hoax calls from a public call box. Caller not traced. No further action.' },
        ],
      },
      // Approved end beat: a sixth call appears in the log. Never explained.
      amendments: [
        {
          id: 'sixth-call',
          whenCaseClosed: caseId('case-003'),
          appendRow: { blockIndex: 1, row: ['6', '', '23:10', 'Records facility, night entrance', 'Not attended.'] },
        },
      ],
    },
    {
      id: CASE_003_IDS.recording,
      kind: 'audio',
      title: 'Recording of call 5',
      reference: 'File 003 · Item 2',
      description: 'The control room’s recording of the fifth call.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Format', value: 'Control room logging tape, extract' },
        { label: 'Call', value: '5 — Friday 7 November 1986, 23:25' },
        { label: 'Running time', value: '0:22' },
      ],
      timeline: CASE_003_CALL,
      filters: [BACKGROUND_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_003_IDS.analysis,
      kind: 'document',
      title: 'Background analysis',
      reference: 'File 003 · Item 2a',
      description: 'An engineer’s note on the background of the fifth call.',
      unlock: { type: 'discovery', discoveryId: ROOM_SOUND_DISCOVERY },
      document: {
        stamp: 'Engineer’s note',
        heading: 'Background analysis — recording of call 5',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Analysed by', value: 'Exchange engineer' },
              { label: 'Date', value: 'Monday 10 November 1986' },
            ],
          },
          {
            type: 'paragraph',
            text: 'With the voices suppressed, the recording carries a clock ticking close to the handset and a kettle coming to the boil.',
          },
          {
            type: 'paragraph',
            text: 'No traffic, wind, or kiosk door is audible. The call was made from indoors.',
          },
        ],
      },
    },
    {
      id: CASE_003_IDS.fault,
      kind: 'document',
      title: 'Call box fault report',
      reference: 'File 003 · Item 3',
      description: 'Exchange fault report for the Station Road call box.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Exchange fault report',
        heading: 'Fault report — kiosk 3, Station Road',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Reported', value: 'Saturday 1 November 1986' },
              { label: 'Fault', value: 'Handset cord cut' },
              { label: 'Action', value: 'Handset removed for repair' },
              { label: 'Out of service', value: '1–10 November 1986' },
              { label: 'Returned to service', value: 'Tuesday 11 November 1986' },
            ],
          },
          { type: 'paragraph', text: 'Kiosk unusable while the handset is removed.' },
        ],
      },
    },
    {
      id: CASE_003_IDS.handset,
      kind: 'object',
      title: 'Call box handset',
      reference: 'File 003 · Item 4',
      description: 'The handset from the Station Road call box, as held by the property store.',
      unlock: { type: 'initial' },
      details: [
        { label: 'Item', value: 'Telephone handset, kiosk 3, Station Road' },
        { label: 'Condition', value: 'Cord cut close to the handset' },
        { label: 'Property tag', value: 'PS/86/1101' },
      ],
      provenance: [
        { date: 'Sat 1 Nov 1986', holder: 'Exchange engineer', location: 'Kiosk 3, Station Road', action: 'Removed for repair' },
        { date: 'Sat 1 Nov 1986', holder: 'Property store', location: 'Bellwether exchange', action: 'Tagged and stored' },
        { date: 'Tue 11 Nov 1986', holder: 'Exchange engineer', location: 'Kiosk 3, Station Road', action: 'Refitted' },
      ],
      linked: [CASE_003_IDS.fault, CASE_003_IDS.callLog],
    },
    {
      id: CASE_003_IDS.trace,
      kind: 'document',
      title: 'Malicious-call trace',
      reference: 'File 003 · Item 5',
      description: 'The exchange trace run on the fifth call.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Exchange trace',
        heading: 'Malicious-call trace — Bellwether exchange',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Requested', value: 'Friday 7 November 1986, 09:00 (after call 4)' },
              { label: 'Run on', value: 'Call 5, 23:25' },
              { label: 'Result', value: 'Private line, ex-directory' },
              { label: 'Exchange', value: 'Bellwether' },
              { label: 'Subscriber', value: '[redacted]' },
            ],
          },
          { type: 'paragraph', text: 'Subscriber details withheld.' },
        ],
      },
    },
    {
      id: CASE_003_IDS.attendance,
      kind: 'document',
      title: 'Attendance notes',
      reference: 'File 003 · Item 6',
      description: 'Officers’ notes from each address.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Attendance notes',
        heading: 'Attendance notes — addresses reported, 3–7 November 1986',
        blocks: [
          {
            type: 'table',
            caption: 'Addresses attended',
            columns: ['Address', 'Attended', 'Note'],
            rows: [
              ['4 Mill Street', '23:31', 'Occupant unaware. Front window lit.'],
              ['27 Church Road', '23:36', 'Occupant unaware. Front window lit.'],
              ['9 Canal Row', '23:29', 'Occupant unaware. Front window lit.'],
              ['2 Station Road', '23:40', 'Occupant unaware. Front window lit.'],
              ['12 Harrow Lane', '23:44', 'Occupant (Mrs J. Pell) unaware. Front window lit.'],
            ],
          },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_003_IDS.callLog,
      to: CASE_003_IDS.fault,
      relation: 'contradicts',
      reason: 'The caller said they were at the Station Road call box. It was out of service from 1 to 10 November.',
    },
    {
      from: CASE_003_IDS.callLog,
      to: CASE_003_IDS.handset,
      relation: 'contradicts',
      reason: 'During every call, the call box’s handset was tagged and stored at the exchange.',
    },
    {
      from: CASE_003_IDS.fault,
      to: CASE_003_IDS.handset,
      relation: 'corroborates',
      reason: 'Both records give 1 November for the handset’s removal and 11 November for its return.',
    },
    {
      from: CASE_003_IDS.recording,
      to: CASE_003_IDS.callLog,
      relation: 'contradicts',
      reason: 'The caller says “Station Road call box”, but the room sound on the recording is a clock and a kettle.',
    },
    {
      from: CASE_003_IDS.analysis,
      to: CASE_003_IDS.recording,
      relation: 'derived-from',
      reason: 'The analysis is made from the recording of call 5.',
    },
    {
      from: CASE_003_IDS.trace,
      to: CASE_003_IDS.recording,
      relation: 'same-subject',
      reason: 'Both records concern call 5, on Friday 7 November at 23:25.',
    },
  ],
  questions: CASE_003_QUESTIONS,
};
