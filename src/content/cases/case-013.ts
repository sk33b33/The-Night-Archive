import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type DocumentEvidence, type EvidenceId, type RegisterEntry } from '../../domain/evidence';
import { CASE_013_QUESTIONS } from './case-013-deduction';
import { EXCHANGE_STAFF, FACILITY_STAFF, POLICE_STAFF, RAILWAY_STAFF } from './case-013-registers';

/**
 * Case 013 — Ward (Season 2). Canon: docs/cases/case-013-bible.md
 * (approved; end beat A). One register lists a Ward. Who Ward was, beyond
 * a post and two dates, is not established.
 */
export const CASE_013_IDS = {
  crossref: evidenceId('c013-crossref'),
  railway: evidenceId('c013-railway-register'),
  facility: evidenceId('c013-facility-register'),
  exchange: evidenceId('c013-exchange-register'),
  police: evidenceId('c013-police-register'),
  courier: evidenceId('c013-courier-log'),
  report: evidenceId('c013-incident-report'),
  roster: evidenceId('c013-roster'),
  sb07: evidenceId('c013-sb07-line'),
  note: evidenceId('c013-crossref-note'),
  nightDesk: evidenceId('c013-night-desk-log'),
} as const;

export const WARD_DISCOVERY = 'c013-ward-search';

const register = (
  id: EvidenceId,
  title: string,
  reference: string,
  stamp: string,
  heading: string,
  entries: readonly RegisterEntry[],
): DocumentEvidence => ({
  id,
  kind: 'document',
  title,
  reference,
  description: `${entries.length} entries.`,
  unlock: { type: 'initial' },
  document: {
    stamp,
    heading,
    blocks: [
      {
        type: 'table',
        caption: 'Staff',
        columns: ['Name', 'Post', 'From', 'To'],
        rows: entries.map((x) => [x.name, x.post, x.from, x.to]),
      },
    ],
  },
});

export const CASE_013: CaseDefinition = {
  id: caseId('case-013'),
  number: '013',
  title: 'Ward',
  location: 'Records facility, Bellwether — 1981 registers',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-012'),
  briefing: {
    summary: 'Not station staff. Then whose?',
    assignment: [
      'The 1981 report names its caller as Elias Ward, station staff. The station’s roster has no Ward.',
      'Cross-reference the 1981 staff registers. Establish which records name a Ward, and what they say. Record only what the evidence supports.',
    ],
    reportId: CASE_013_IDS.report,
  },
  evidence: [
    {
      id: CASE_013_IDS.report,
      kind: 'document',
      title: 'Incident report, 1981',
      reference: 'File 013 · Item 1',
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
      id: CASE_013_IDS.crossref,
      kind: 'registry',
      title: 'Staff cross-reference, 1981',
      reference: 'File 013 · Item 2',
      description: 'Four 1981 staff registers, searched at once.',
      unlock: { type: 'initial' },
      registers: [
        { id: 'railway', label: 'Railway district staff, 1981', source: CASE_013_IDS.railway, entries: RAILWAY_STAFF },
        { id: 'facility', label: 'Records facility staff, 1979–1983', source: CASE_013_IDS.facility, entries: FACILITY_STAFF },
        { id: 'exchange', label: 'Telephone exchange staff, Bellwether, 1981', source: CASE_013_IDS.exchange, entries: EXCHANGE_STAFF },
        { id: 'police', label: 'Police division, Bellwether, 1981', source: CASE_013_IDS.police, entries: POLICE_STAFF },
      ],
      revealsOnSearch: { term: 'ward', discovery: WARD_DISCOVERY },
      catalogue: [
        { label: 'Registers', value: '4' },
        { label: 'Search', value: 'Whole words: a surname or an initial' },
      ],
    },
    register(
      CASE_013_IDS.railway,
      'Railway district staff, 1981',
      'File 013 · Item 3',
      'Railway district',
      'Staff register — Bellwether district, 1981',
      RAILWAY_STAFF,
    ),
    register(
      CASE_013_IDS.facility,
      'Records facility staff, 1979–1983',
      'File 013 · Item 4',
      'Staff register',
      'Staff register — Records facility, Bellwether, 1979–1983',
      FACILITY_STAFF,
    ),
    register(
      CASE_013_IDS.exchange,
      'Telephone exchange staff, 1981',
      'File 013 · Item 5',
      'Exchange',
      'Staff list — Bellwether telephone exchange, 1981',
      EXCHANGE_STAFF,
    ),
    register(
      CASE_013_IDS.police,
      'Police division staff, 1981',
      'File 013 · Item 6',
      'Police',
      'Nominal roll — Bellwether police division, 1981',
      POLICE_STAFF,
    ),
    {
      id: CASE_013_IDS.courier,
      kind: 'document',
      title: 'Courier log, 13–14 October 1981',
      reference: 'File 013 · Item 7',
      description: 'Records facility couriers signing out and in.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Courier log',
        heading: 'Courier log — Records facility, 13–14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Date', 'Time', 'Courier', 'Out / In', 'Destination', 'Purpose'],
            rows: [
              ['13 Oct', '16:05', 'S. Lyle', 'Out', 'Council offices', 'Delivery'],
              ['13 Oct', '17:20', 'S. Lyle', 'In', '—', '—'],
              ['13 Oct', '22:40', 'E. Ward', 'Out', 'Bellwether station', 'Collection'],
              ['14 Oct', '08:10', 'S. Lyle', 'Out', 'Magistrates’ court', 'Delivery'],
              ['14 Oct', '09:45', 'S. Lyle', 'In', '—', '—'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_013_IDS.roster,
      kind: 'document',
      title: 'Duty roster, 1981',
      reference: 'File 013 · Item 8',
      description: 'A copy of the Bellwether night duty roster.',
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
      id: CASE_013_IDS.sb07,
      kind: 'document',
      title: 'Sealing inventory, SB-07 line',
      reference: 'File 013 · Item 9',
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
    {
      id: CASE_013_IDS.note,
      kind: 'document',
      title: 'Cross-reference note',
      reference: 'File 013 · Item 2a',
      description: 'What the search for “Ward” found across the four registers.',
      unlock: { type: 'discovery', discoveryId: WARD_DISCOVERY },
      document: {
        stamp: 'Examiner',
        heading: 'Cross-reference note — surname “Ward”, 1981 registers',
        blocks: [
          {
            type: 'paragraph',
            text: 'One register lists a Ward: records facility staff, E. Ward, courier, March 1980 to 31 October 1981.',
          },
          {
            type: 'paragraph',
            text: 'The railway, exchange and police registers list no Ward. The railway register’s E. Warden is a different surname.',
          },
          { type: 'paragraph', text: 'The register gives an initial only. No first name is recorded.' },
        ],
      },
    },
    // Approved end beat A: the night desk record Case 012's timeline had no
    // source for comes on file. One line, no signature. Never explained.
    {
      id: CASE_013_IDS.nightDesk,
      kind: 'document',
      title: 'Night desk log, 13–14 October 1981',
      reference: 'File 013 · Item 10',
      description: 'Records facility, night desk.',
      unlock: { type: 'caseClosed', caseId: caseId('case-013') },
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
    },
  ],
  boardRules: [
    {
      from: CASE_013_IDS.facility,
      to: CASE_013_IDS.report,
      relation: 'same-subject',
      reason: 'Both records name a Ward in 1981. Whether it is the same person is not recorded.',
    },
    {
      from: CASE_013_IDS.roster,
      to: CASE_013_IDS.report,
      relation: 'contradicts',
      reason: 'The report gives the caller as station staff. The roster has no Ward.',
    },
    {
      from: CASE_013_IDS.courier,
      to: CASE_013_IDS.facility,
      relation: 'same-subject',
      reason: 'Both records name E. Ward, courier.',
    },
    {
      from: CASE_013_IDS.courier,
      to: CASE_013_IDS.report,
      relation: 'same-subject',
      reason: 'The courier log sends E. Ward to Bellwether station at 22:40; the report concerns the same station that night.',
    },
    {
      from: CASE_013_IDS.railway,
      to: CASE_013_IDS.roster,
      relation: 'corroborates',
      reason: 'Neither record lists a Ward at Bellwether. Both give Hale, Okafor and Brennan.',
    },
    {
      from: CASE_013_IDS.note,
      to: CASE_013_IDS.crossref,
      relation: 'derived-from',
      reason: 'The note records what the search for “Ward” found.',
    },
  ],
  questions: CASE_013_QUESTIONS,
};
