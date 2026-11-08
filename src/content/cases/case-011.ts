import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { CASE_011_QUESTIONS } from './case-011-deduction';
import { LOCATION_DISCOVERY, PHOTO_0094_REGIONS, SEALING_REGIONS } from './case-011-storage';

/**
 * Case 011 — Storage B (Season 2). Canon: docs/cases/case-011-bible.md
 * (approved; end beat A). The records show absence, never an act.
 */
export const CASE_011_IDS = {
  photo: evidenceId('c011-photograph'),
  sealing: evidenceId('c011-sealing-photograph'),
  inventory: evidenceId('c011-inventory'),
  clearance: evidenceId('c011-clearance'),
  accession: evidenceId('c011-accession'),
  history: evidenceId('c011-building-history'),
  ledger: evidenceId('c011-intake-ledger'),
  location: evidenceId('c011-location-note'),
  note: evidenceId('c011-day-note'),
} as const;

/** Row of the SB-07 line in the inventory table (end beat amends its contents). */
const SB07_ROW = 1;

export const CASE_011: CaseDefinition = {
  id: caseId('case-011'),
  number: '011',
  title: 'Storage B',
  location: 'Records facility, Bellwether — tonight, 06:07',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-010'),
  briefing: {
    summary: 'The 0094 photograph: a room that is not on the plan, and three boxes.',
    assignment: [
      'At 06:07 the day archivist found the File 0094 photograph in the Unfiled tray. It shows a room with steel shelving, a barred window and three archive boxes.',
      'Establish what room it shows, and reconcile the boxes against the records. Record only what the evidence supports.',
    ],
    reportId: CASE_011_IDS.note,
  },
  evidence: [
    {
      id: CASE_011_IDS.note,
      kind: 'document',
      title: 'Day archivist’s note, 06:07',
      reference: 'File 0094 · Item 1',
      description: 'P. Nash’s note on what was found in the Unfiled tray.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Day desk',
        heading: 'Note — position 7, 06:07',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Found', value: 'One photograph, Unfiled tray' },
              { label: 'Filed as', value: '0094' },
              { label: 'Imprint', value: 'None' },
              { label: 'Room shown', value: 'Not recognised. Not on the current plan.' },
              { label: 'Day archivist', value: 'P. Nash' },
            ],
          },
          { type: 'paragraph', text: 'Passed to the night archivist for review before close of shift.' },
        ],
      },
    },
    {
      id: CASE_011_IDS.photo,
      kind: 'photo',
      title: 'File 0094 photograph',
      reference: 'File 0094 · Item 2',
      description: 'Found in the Unfiled tray at 06:07.',
      unlock: { type: 'initial' },
      artwork: 'storage-b-0094',
      alt: 'A small room in cold light: two steel shelving bays plated BAY A and BAY B, a barred window in the right-hand wall, and three archive boxes on otherwise empty shelves.',
      caption: 'No date on the print. Filed as 0094.',
      regions: PHOTO_0094_REGIONS,
      catalogue: [
        { label: 'Intake', value: '0094' },
        { label: 'Imprint', value: 'None' },
        { label: 'Found', value: 'Unfiled tray, tonight 06:07 (day archivist)' },
      ],
    },
    {
      id: CASE_011_IDS.sealing,
      kind: 'photo',
      title: 'Storage B at sealing, 1981',
      reference: 'File 0094 · Item 3',
      description: 'Estates photograph taken when Storage B was sealed.',
      unlock: { type: 'initial' },
      artwork: 'storage-b-1981',
      alt: 'A small room under flash: two steel shelving bays plated BAY A and BAY B, every shelf full of labelled archive boxes, and a barred window in the right-hand wall. Date imprint 16 10 81.',
      caption: 'Storage B, first floor east, 16 October 1981.',
      regions: SEALING_REGIONS,
      catalogue: [
        { label: 'Taken by', value: 'Estates' },
        { label: 'Date', value: '16 October 1981 (imprint)' },
      ],
    },
    {
      id: CASE_011_IDS.inventory,
      kind: 'document',
      title: 'Sealing inventory, 1981',
      reference: 'File 0094 · Item 4',
      description: 'The contents of Storage B when it was sealed.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Inventory',
        heading: 'Storage B — sealing inventory, 16 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Contents',
            columns: ['Shelf', 'Boxes', 'Contents'],
            rows: [
              ['Bay A, shelf 1', 'SB-01 – SB-06', 'Facility correspondence, 1962–70'],
              ['Bay A, shelf 2', 'SB-07', 'Deposited 15 Oct 1981, night archivist. Contents: not listed.'],
              ['Bay A, shelf 2', 'SB-08 – SB-12', 'Facility correspondence, 1971–76'],
              ['Bay A, shelves 3–4', 'SB-13 – SB-24', 'Intake ledgers, 1962–80'],
              ['Bay B, shelves 1–2', 'SB-25 – SB-36', 'Estates drawings'],
              ['Bay B, shelves 3–4', 'SB-37 – SB-48', 'Staff files, closed'],
              ['Total', '48 boxes', 'SB-01 to SB-48'],
            ],
          },
          { type: 'paragraph', text: 'Room sealed on completion. Key to Estates.' },
          { type: 'annotation', text: 'Inventory taken by: M., night archivist.' },
        ],
      },
      // Approved end beat A: the SB-07 line's contents, in the same hand.
      // A record's claim, never established, never explained.
      amendments: [
        {
          id: 'sb07-contents',
          whenCaseClosed: caseId('case-011'),
          setCell: {
            blockIndex: 0,
            row: SB07_ROW,
            column: 2,
            value: 'Deposited 15 Oct 1981, night archivist. Contents: east door key, Bellwether.',
          },
        },
      ],
    },
    {
      id: CASE_011_IDS.clearance,
      kind: 'document',
      title: 'Refit clearance list, 1997',
      reference: 'File 0094 · Item 5',
      description: 'Estates’ record of emptying Storage B for the refit.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Estates',
        heading: 'Refit clearance — Storage B, 3 November 1997',
        blocks: [
          {
            type: 'table',
            caption: 'Boxes',
            columns: ['Boxes', 'Status'],
            rows: [
              ['SB-01 – SB-06', 'Transferred to stack room'],
              ['SB-07', 'Not found'],
              ['SB-08 – SB-30', 'Transferred to stack room'],
              ['SB-31', 'Not found'],
              ['SB-32 – SB-48', 'Transferred to stack room'],
            ],
          },
          {
            type: 'fields',
            fields: [
              { label: 'Transferred', value: '46' },
              { label: 'Not found', value: '2' },
              { label: 'Cleared by', value: 'Estates (R.D.)' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_011_IDS.accession,
      kind: 'document',
      title: 'Stack room accession, 1997',
      reference: 'File 0094 · Item 6',
      description: 'What the stack room recorded receiving from Storage B.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Stack room',
        heading: 'Accession — received from Storage B, 4 November 1997',
        blocks: [
          {
            type: 'table',
            caption: 'Received',
            columns: ['Boxes', 'Count'],
            rows: [
              ['SB-01 – SB-06', '6'],
              ['SB-08 – SB-30', '23'],
              ['SB-32 – SB-39', '8'],
              ['SB-41 – SB-48', '8'],
              ['Total received', '45'],
            ],
          },
          { type: 'paragraph', text: 'Shelved in the stack room, rows 14–16.' },
        ],
      },
    },
    {
      id: CASE_011_IDS.history,
      kind: 'document',
      title: 'Building history (copy)',
      reference: 'File 0094 · Item 7',
      description: 'Estates’ record of works, as filed with File 0091.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Estates',
        heading: 'Building history — Records facility, Bellwether',
        blocks: [
          {
            type: 'table',
            caption: 'Works',
            columns: ['Year', 'Work'],
            rows: [
              ['1962', 'Facility opened'],
              ['1981', 'First floor, east: Storage B (sealed)'],
              ['1997–98', 'Refit. Storage B converted to the reading room'],
              ['1998', 'Reading room workstations installed (NA-01 to NA-12)'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_011_IDS.ledger,
      kind: 'document',
      title: 'Intake ledger, tonight',
      reference: 'File 0094 · Item 8',
      description: 'Intake numbers issued tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake ledger',
        heading: 'Intake ledger — Records facility, tonight',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['No.', 'Time', 'Description', 'Filed by'],
            rows: [
              ['0093', '03:40', 'Photograph', 'M.'],
              ['0094', '06:00', 'Photograph', 'M.'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_011_IDS.location,
      kind: 'document',
      title: 'Location note',
      reference: 'File 0094 · Item 2a',
      description: 'The File 0094 photograph compared with the sealing photograph.',
      unlock: { type: 'discovery', discoveryId: LOCATION_DISCOVERY },
      document: {
        stamp: 'Examiner',
        heading: 'Location note — File 0094 photograph',
        blocks: [
          {
            type: 'paragraph',
            text: 'The File 0094 photograph shows Storage B: the same barred east window and the same two shelving bays as the sealing photograph of 16 October 1981.',
          },
          {
            type: 'paragraph',
            text: 'Three boxes remain on the shelves. Their labels read SB-07, SB-31 and SB-40, in the positions the inventory gives them.',
          },
          { type: 'paragraph', text: 'The print carries no date. When it was taken is not recorded.' },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_011_IDS.clearance,
      to: CASE_011_IDS.accession,
      relation: 'contradicts',
      reason: 'The clearance list transferred 46 boxes, including SB-40. The stack room received 45, and SB-40 is not among them.',
    },
    {
      from: CASE_011_IDS.inventory,
      to: CASE_011_IDS.sealing,
      relation: 'corroborates',
      reason: 'Both records show 48 boxes in Storage B on 16 October 1981.',
    },
    {
      from: CASE_011_IDS.clearance,
      to: CASE_011_IDS.photo,
      relation: 'same-subject',
      reason: 'The two boxes the clearance list could not find, SB-07 and SB-31, are on the shelves in the photograph.',
    },
    {
      from: CASE_011_IDS.history,
      to: CASE_011_IDS.inventory,
      relation: 'corroborates',
      reason: 'Both records give 1981 for the sealing of Storage B.',
    },
    {
      from: CASE_011_IDS.location,
      to: CASE_011_IDS.photo,
      relation: 'derived-from',
      reason: 'The note is made by comparing the File 0094 photograph with the sealing photograph.',
    },
    {
      from: CASE_011_IDS.ledger,
      to: CASE_011_IDS.photo,
      relation: 'same-subject',
      reason: 'The ledger records 0094 as a photograph, filed tonight at 06:00.',
    },
  ],
  questions: CASE_011_QUESTIONS,
};
