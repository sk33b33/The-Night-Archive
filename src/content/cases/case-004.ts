import { ARCHIVE_DESK } from '../archive';
import { FILE_0091 } from '../anomalies/file-0091';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { CASE_004_QUESTIONS } from './case-004-deduction';

/**
 * Case 004 — File 0091. Canon: docs/cases/case-004-bible.md (approved).
 * Provenance only. Never settle the date or explain the workstation.
 */
export const DESK_PAPERS_DISCOVERY = 'c004-desk-papers';

export const CASE_004_IDS = {
  photo: evidenceId('c004-photograph'),
  papers: evidenceId('c004-desk-papers'),
  print: evidenceId('c004-print'),
  ledger: evidenceId('c004-intake-ledger'),
  orders: evidenceId('c004-order-book'),
  building: evidenceId('c004-building-history'),
  register: evidenceId('c004-asset-register'),
} as const;

export const CASE_004: CaseDefinition = {
  id: caseId('case-004'),
  number: '004',
  title: 'File 0091',
  location: 'Records facility, Bellwether',
  accessLevel: 1,
  availableAfter: caseId('case-003'),
  replacesAnomaly: FILE_0091.id,
  briefing: {
    summary: 'An unregistered file holding one photograph. No intake record.',
    assignment: [
      'File 0091 has been assigned for review. It has no intake record and holds a single photograph.',
      'Establish how it entered the archive. Record only what the evidence supports.',
    ],
    reportId: CASE_004_IDS.ledger,
  },
  evidence: [
    {
      id: CASE_004_IDS.photo,
      kind: 'photo',
      title: 'File 0091 photograph',
      reference: 'File 0091 · Item 1',
      description: 'The photograph held in File 0091.',
      unlock: { type: 'initial' },
      artwork: 'workstation-na07',
      alt: FILE_0091.photograph.alt,
      caption: FILE_0091.photograph.caption,
      regions: [
        ...FILE_0091.photograph.regions,
        {
          id: 'desk-papers',
          label: 'Papers on the desk',
          note: 'Loose papers on the desk, with handwriting on the top sheet. An enlargement has been made.',
          x: 0.1,
          y: 0.64,
          width: 0.18,
          height: 0.17,
          revealsDiscovery: DESK_PAPERS_DISCOVERY,
        },
      ],
      catalogue: [
        { label: 'Date imprint', value: '14 OCT 1981' },
        { label: 'Intake record', value: 'None' },
      ],
    },
    {
      id: CASE_004_IDS.papers,
      kind: 'photo',
      title: 'Desk papers enlargement',
      reference: 'File 0091 · Item 1a',
      description: 'An enlargement of the papers on the desk in the photograph.',
      unlock: { type: 'discovery', discoveryId: DESK_PAPERS_DISCOVERY },
      artwork: 'desk-papers',
      alt: 'Enlargement of an intake-ledger page. Entries 0089 and 0090 are complete. Below them, the number 0091 is written in fresh blue ink; the rest of the line is blank.',
      caption: 'Enlargement from Item 1. Intake-ledger page.',
      regions: [
        {
          id: 'entry-0091',
          label: 'Entry 0091',
          note: 'The number 0091, in blue ink. No date, description, or initials. Not ruled through.',
          // The ledger page is drawn rotated by −2°, so the 0091 line sits lower on the left.
          x: 0.09,
          y: 0.63,
          width: 0.29,
          height: 0.1,
        },
      ],
      catalogue: [
        { label: 'Derived from', value: 'File 0091 photograph (Item 1)' },
        { label: 'Processing', value: 'Photographic enlargement' },
      ],
    },
    {
      id: CASE_004_IDS.print,
      kind: 'object',
      title: 'The print',
      reference: 'File 0091 · Item 2',
      description: 'The photographic print itself, as recorded by the property store.',
      unlock: { type: 'initial' },
      details: [
        { label: 'Item', value: 'Colour photographic print, 6 × 4 in' },
        { label: 'Reverse', value: 'Stamp: “Kessler Photo, Bellwether”. No order number.' },
        { label: 'Paper', value: 'Backprint code for 1980–82 stock' },
      ],
      provenance: [
        {
          date: 'Current shift',
          holder: `Night archivist (Workstation ${ARCHIVE_DESK.workstation})`,
          location: 'Unfiled tray, reading room',
          action: 'Found and recorded',
        },
      ],
      linked: [CASE_004_IDS.orders, CASE_004_IDS.ledger],
    },
    {
      id: CASE_004_IDS.ledger,
      kind: 'document',
      title: 'Intake ledger, October 1981',
      reference: 'File 0091 · Item 3',
      description: 'The archive’s intake numbers for October 1981.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake ledger',
        heading: 'Intake ledger — Records facility, October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['No.', 'Date', 'Description', 'Filed by'],
            rows: [
              ['0089', '12 Oct 1981', 'Lost property returns', 'R.K.'],
              ['0090', '13 Oct 1981', 'Council minutes, September', 'R.K.'],
              ['0091', '', '[Line ruled through]', ''],
              ['0092', '15 Oct 1981', 'Correspondence, Highways', 'R.K.'],
            ],
          },
          { type: 'paragraph', text: 'Numbers are issued in sequence. A voided number is not reissued.' },
        ],
      },
      // Approved end beat A: the voided line gains a date. Never explained.
      amendments: [
        {
          id: 'dated-0091',
          whenCaseClosed: caseId('case-004'),
          setCell: { blockIndex: 0, row: 2, column: 1, value: '14 Oct' },
        },
      ],
    },
    {
      id: CASE_004_IDS.orders,
      kind: 'document',
      title: 'Kessler Photo order book',
      reference: 'File 0091 · Item 4',
      description: 'Order book extract from a Bellwether photographic lab.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Kessler Photo',
        heading: 'Order book — Kessler Photo, 3 Market Street, Bellwether',
        blocks: [
          {
            type: 'table',
            caption: 'Orders, October 1981',
            columns: ['Order', 'In', 'Account', 'Work', 'Collected'],
            rows: [
              ['4469', '14 Oct', 'Counter', '1 film, prints', '15 Oct'],
              ['4470', '15 Oct', 'Counter', '2 films, prints', '17 Oct'],
              ['4471', '15 Oct', 'Records facility, night', '1 film, 1 print', '16 Oct, signature illegible'],
            ],
          },
          { type: 'paragraph', text: 'Order numbers are not carried onto prints.' },
        ],
      },
    },
    {
      id: CASE_004_IDS.building,
      kind: 'document',
      title: 'Building history',
      reference: 'File 0091 · Item 5',
      description: 'Works history of the records facility.',
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
      id: CASE_004_IDS.register,
      kind: 'document',
      title: 'Asset register',
      reference: 'File 0091 · Item 6',
      description: 'The asset register entry for this workstation.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Asset register',
        heading: FILE_0091.register.heading,
        blocks: [{ type: 'fields', fields: FILE_0091.register.fields }],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_004_IDS.ledger,
      to: CASE_004_IDS.papers,
      relation: 'same-subject',
      reason: 'The ledger voids the number 0091. The papers in the photograph show 0091 being written on an intake page.',
    },
    {
      from: CASE_004_IDS.papers,
      to: CASE_004_IDS.photo,
      relation: 'derived-from',
      reason: 'The enlargement is made from the papers on the desk in the photograph.',
    },
    {
      from: CASE_004_IDS.print,
      to: CASE_004_IDS.orders,
      relation: 'corroborates',
      reason: 'The print is stamped by Kessler Photo, and the order book records a single print on the facility’s night account.',
    },
    {
      from: CASE_004_IDS.building,
      to: CASE_004_IDS.photo,
      relation: 'contradicts',
      reason: 'The photograph shows a reading-room desk. The building history records no reading room until 1997–98.',
    },
    {
      from: CASE_004_IDS.register,
      to: CASE_004_IDS.photo,
      relation: 'contradicts',
      reason: 'The photograph is dated 14 October 1981. The register records workstation NA-07 as installed in 1998.',
    },
    {
      from: CASE_004_IDS.building,
      to: CASE_004_IDS.register,
      relation: 'corroborates',
      reason: 'Both records place the reading room and its workstations in 1997–98.',
    },
  ],
  questions: CASE_004_QUESTIONS,
};
