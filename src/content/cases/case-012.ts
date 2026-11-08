import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type TimelineEvent } from '../../domain/evidence';
import { CASE_012_QUESTIONS } from './case-012-deduction';

/**
 * Case 012 — The East Door (Season 2). Canon: docs/cases/case-012-bible.md
 * (approved; end beat A). Bellwether, 13–14 October 1981, five station
 * records on one axis. The records disagree about the door; nothing here
 * says who opened it, or whether anyone did.
 */
export const CASE_012_IDS = {
  timeline: evidenceId('c012-timeline'),
  signal: evidenceId('c012-signal-box'),
  porter: evidenceId('c012-porter-log'),
  supervisor: evidenceId('c012-supervisor-book'),
  exchange: evidenceId('c012-exchange'),
  report: evidenceId('c012-incident-report'),
  works: evidenceId('c012-works-order'),
  sb07: evidenceId('c012-sb07-line'),
  roster: evidenceId('c012-roster'),
} as const;

const T = {
  signal: { id: 'signal', label: 'Signal box (T. Brennan)', source: CASE_012_IDS.signal },
  porter: { id: 'porter', label: 'Porter’s log (D. Okafor)', source: CASE_012_IDS.porter },
  supervisor: { id: 'supervisor', label: 'Supervisor’s book (R. Hale)', source: CASE_012_IDS.supervisor },
  exchange: { id: 'exchange', label: 'Exchange, route BW-4', source: CASE_012_IDS.exchange },
  report: { id: 'report', label: 'Incident report', source: CASE_012_IDS.report },
} as const;

const ev = (track: keyof typeof T, time: string, text: string): TimelineEvent => ({ track, time, text });

/** The night as each record gives it. Document tables below carry the same entries. */
export const NIGHT: readonly TimelineEvent[] = [
  ev('signal', '02:10', '02:10 service cancelled.'),
  ev('supervisor', '02:15', 'Station closed to the public.'),
  ev('porter', '02:20', 'Platforms swept. East door sealed, boards in place.'),
  ev('supervisor', '03:00', 'Office. Returns. (Entry runs to 03:50.)'),
  ev('signal', '03:18', 'Lights seen at the east platform end.'),
  ev('porter', '03:25', 'East door standing open. Boards stacked on the platform.'),
  ev('porter', '03:30', 'Phoned the supervisor’s office. No answer.'),
  ev('exchange', '03:40', 'Outgoing call, 0:31. Destination not recorded.'),
  ev('report', '03:40', 'Call received: unusual activity near the east platform.'),
  ev('supervisor', '04:05', 'Attended the east platform: door sealed, boarding intact, no sign of interference.'),
];

/** Rows for a source's document table, from the same events. */
const rowsFor = (track: keyof typeof T) => NIGHT.filter((e) => e.track === track).map((e) => [e.time, e.text]);

export const CASE_012: CaseDefinition = {
  id: caseId('case-012'),
  number: '012',
  title: 'The East Door',
  location: 'Bellwether Railway Station — 13–14 October 1981',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-011'),
  briefing: {
    summary: 'The station’s own records of the night, side by side.',
    assignment: [
      'The east door at Bellwether was sealed in 1979. An inventory line now says its key was deposited at the records facility the day after the report.',
      'Assemble the station’s records for the night of 13–14 October 1981 on one timeline. Establish what each record says about the east door, and in what order. Record only what the evidence supports.',
    ],
    reportId: CASE_012_IDS.works,
  },
  evidence: [
    {
      id: CASE_012_IDS.works,
      kind: 'document',
      title: 'Works order, 1979',
      reference: 'File 012 · Item 1',
      description: 'The full works order for sealing the east platform door.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Works order',
        heading: 'Works order — Bellwether, east platform access door, 1979',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Work', value: 'Door sealed. Frame welded and boarded.' },
              { label: 'Boarding', value: 'Secured by hasp and padlock' },
              { label: 'Key', value: 'To the district engineer' },
              { label: 'Completed', value: '1979 (day and month illegible)' },
            ],
          },
          { type: 'paragraph', text: 'Door not to be reopened without written authority from the district engineer.' },
        ],
      },
    },
    {
      id: CASE_012_IDS.timeline,
      kind: 'timeline',
      title: 'The night of 13–14 October 1981',
      reference: 'File 012 · Item 2',
      description: 'Five station records on one time axis, 02:00 to 04:30.',
      unlock: { type: 'initial' },
      range: { from: '02:00', to: '04:30' },
      tracks: Object.values(T),
      events: NIGHT,
      catalogue: [
        { label: 'Night', value: '13–14 October 1981' },
        { label: 'Rule', value: 'Shows only what each named record says, when it says it' },
      ],
      // Approved end beat A: a source with no record on file. Never explained.
      amendments: [
        {
          id: 'night-desk',
          whenCaseClosed: caseId('case-012'),
          appendTrack: { id: 'night-desk', label: 'Records facility, night desk, 1981' },
          events: [{ track: 'night-desk', time: '03:40', text: 'Call received from E. Ward. Not filed.' }],
        },
      ],
    },
    {
      id: CASE_012_IDS.signal,
      kind: 'document',
      title: 'Signal box register',
      reference: 'File 012 · Item 3',
      description: 'T. Brennan’s entries, night of 13–14 October 1981.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Signal box',
        heading: 'Signal box register — Bellwether, 13–14 October 1981',
        blocks: [{ type: 'table', caption: 'Entries', columns: ['Time', 'Entry'], rows: rowsFor('signal') }],
      },
    },
    {
      id: CASE_012_IDS.porter,
      kind: 'document',
      title: 'Porter’s log',
      reference: 'File 012 · Item 4',
      description: 'D. Okafor’s entries, night of 13–14 October 1981.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Porter',
        heading: 'Porter’s log — Bellwether, 13–14 October 1981',
        blocks: [{ type: 'table', caption: 'Entries', columns: ['Time', 'Entry'], rows: rowsFor('porter') }],
      },
    },
    {
      id: CASE_012_IDS.supervisor,
      kind: 'document',
      title: 'Supervisor’s occurrence book',
      reference: 'File 012 · Item 5',
      description: 'R. Hale’s entries, night of 13–14 October 1981.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Occurrence book',
        heading: 'Occurrence book — station supervisor, Bellwether, 13–14 October 1981',
        blocks: [{ type: 'table', caption: 'Entries', columns: ['Time', 'Entry'], rows: rowsFor('supervisor') }],
      },
    },
    {
      id: CASE_012_IDS.exchange,
      kind: 'document',
      title: 'Exchange record, route BW-4',
      reference: 'File 012 · Item 6',
      description: 'Calls on the east platform kiosk route, 14 October 1981.',
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
          { type: 'paragraph', text: 'Caller not recorded. Kiosk calls are not attributed.' },
        ],
      },
    },
    {
      id: CASE_012_IDS.report,
      kind: 'document',
      title: 'Incident report, 1981',
      reference: 'File 012 · Item 7',
      description: 'A copy of the Case 001 incident report, as it now reads.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Official record',
        heading: 'Incident report — Bellwether Railway Station',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Date', value: '14 October 1981' },
              { label: 'Report time', value: '03:40' },
              { label: 'Caller', value: 'Elias Ward (station staff)' },
              { label: 'Outcome', value: 'No incident confirmed' },
            ],
          },
          { type: 'paragraph', text: 'Caller reported unusual activity near the east platform.' },
          { type: 'annotation', text: 'Report time 03:40: received at extension NA-07.' },
        ],
      },
    },
    {
      id: CASE_012_IDS.roster,
      kind: 'document',
      title: 'Duty roster, 1981',
      reference: 'File 012 · Item 8',
      description: 'A copy of the night duty roster.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Duty roster',
        heading: 'Night duty roster — Bellwether Railway Station, 13–14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Rostered staff',
            columns: ['Name', 'Role', 'Shift'],
            rows: [
              ['R. Hale', 'Station supervisor', '22:00–06:00'],
              ['D. Okafor', 'Porter', '22:00–06:00'],
              ['T. Brennan', 'Signal box', '22:00–06:00'],
            ],
          },
          { type: 'paragraph', text: 'Only the staff listed above were rostered at this station for the night shift.' },
        ],
      },
    },
    {
      id: CASE_012_IDS.sb07,
      kind: 'document',
      title: 'Sealing inventory, SB-07 line',
      reference: 'File 012 · Item 9',
      description: 'A copy of one line of the Storage B inventory, as it now reads.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Inventory',
        heading: 'Storage B — sealing inventory, 16 October 1981 (extract)',
        blocks: [
          {
            type: 'table',
            caption: 'Contents',
            columns: ['Shelf', 'Boxes', 'Contents'],
            rows: [['Bay A, shelf 2', 'SB-07', 'Deposited 15 Oct 1981, night archivist. Contents: east door key, Bellwether.']],
          },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_012_IDS.porter,
      to: CASE_012_IDS.supervisor,
      relation: 'contradicts',
      reason: 'The porter’s log has the east door standing open at 03:25. The supervisor’s book has it sealed, boarding intact, at 04:05.',
    },
    {
      from: CASE_012_IDS.exchange,
      to: CASE_012_IDS.report,
      relation: 'corroborates',
      reason: 'Both records give a call at 03:40.',
    },
    {
      from: CASE_012_IDS.signal,
      to: CASE_012_IDS.porter,
      relation: 'same-subject',
      reason: 'Both records concern the east platform end, at 03:18 and 03:25.',
    },
    {
      from: CASE_012_IDS.works,
      to: CASE_012_IDS.sb07,
      relation: 'same-subject',
      reason: 'The works order gives the boarding’s padlock key to the district engineer. The inventory line names an east door key.',
    },
    {
      from: CASE_012_IDS.supervisor,
      to: CASE_012_IDS.report,
      relation: 'same-subject',
      reason: 'The supervisor attended the east platform at 04:05; the report records the area as checked.',
    },
    {
      from: CASE_012_IDS.roster,
      to: CASE_012_IDS.report,
      relation: 'contradicts',
      reason: 'The report gives the caller as station staff. The roster has no Elias Ward.',
    },
    {
      from: CASE_012_IDS.timeline,
      to: CASE_012_IDS.porter,
      relation: 'derived-from',
      reason: 'The timeline is assembled from the station’s records, including the porter’s log.',
    },
  ],
  questions: CASE_012_QUESTIONS,
};
