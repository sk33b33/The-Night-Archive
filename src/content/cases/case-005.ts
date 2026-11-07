import { FILE_0091 } from '../anomalies/file-0091';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import type { PhotoRegion } from '../../domain/photoView';
import { CASE_005_QUESTIONS } from './case-005-deduction';

/**
 * Case 005 — The Wrong Date. Canon: docs/cases/case-005-bible.md (approved).
 * Proves the date wrong; never explains how.
 */
export const BADGE_MATCH_DISCOVERY = 'c005-badge-match';

export const CASE_005_IDS = {
  photo: evidenceId('c005-photograph'),
  installation: evidenceId('c005-installation-photo'),
  comparison: evidenceId('c005-comparison-note'),
  manual: evidenceId('c005-camera-manual'),
  catalogue: evidenceId('c005-catalogue'),
  paper: evidenceId('c005-paper-sheet'),
  companies: evidenceId('c005-companies-register'),
  register: evidenceId('c005-asset-register'),
} as const;

/** The terminal badge, at the same place in both photographs (same desk, same position). */
const badge = (note: string): PhotoRegion => ({
  id: 'terminal-badge',
  label: 'Terminal badge',
  note,
  x: 0.525,
  y: 0.5,
  width: 0.105,
  height: 0.07,
  revealsOnMatch: BADGE_MATCH_DISCOVERY,
});

const assetLabel = FILE_0091.photograph.regions.find((r) => r.id === 'asset-label');

export const CASE_005: CaseDefinition = {
  id: caseId('case-005'),
  number: '005',
  title: 'The Wrong Date',
  location: 'Records facility, Bellwether',
  accessLevel: 1,
  availableAfter: caseId('case-004'),
  briefing: {
    summary: 'Can the date on File 0091 be relied on?',
    assignment: [
      'Following the review of File 0091, specialist records have been gathered on a single question: can the date on its photograph be relied on?',
      'Record only what the evidence supports.',
    ],
    reportId: CASE_005_IDS.manual,
  },
  evidence: [
    {
      id: CASE_005_IDS.photo,
      kind: 'photo',
      title: 'File 0091 photograph',
      reference: 'File 005 · Item 1',
      description: 'A copy of the photograph held in File 0091.',
      unlock: { type: 'initial' },
      artwork: 'workstation-na07',
      alt: `${FILE_0091.photograph.alt} A small maker’s badge on the terminal casing reads HALDEN 486.`,
      caption: FILE_0091.photograph.caption,
      regions: [
        ...FILE_0091.photograph.regions,
        badge('A maker’s badge on the terminal casing reads HALDEN 486.'),
      ],
      catalogue: [
        { label: 'Date imprint', value: '14 OCT 1981' },
        { label: 'Copy of', value: 'File 0091, Item 1' },
      ],
    },
    {
      id: CASE_005_IDS.installation,
      kind: 'photo',
      title: 'Installation photograph',
      reference: 'File 005 · Item 2',
      description: 'An Estates photograph of the reading room, taken at installation.',
      unlock: { type: 'initial' },
      artwork: 'reading-room-1998',
      alt: 'Daylight photograph of a reading-room desk with a terminal labelled NA-07 and a maker’s badge reading HALDEN 486. No lamp and no papers. A tag on the desk edge reads 7. There is no date imprint.',
      caption: 'Reading room, position 7. Installed 2 February 1998.',
      regions: [
        ...(assetLabel ? [assetLabel] : []),
        badge('A maker’s badge on the terminal casing reads HALDEN 486.'),
        {
          id: 'position-tag',
          label: 'Position tag',
          note: 'A tag taped to the desk edge reads 7.',
          x: 0.095,
          y: 0.555,
          width: 0.075,
          height: 0.06,
        },
      ],
      catalogue: [
        { label: 'Taken by', value: 'Estates department' },
        { label: 'Date', value: 'Monday 2 February 1998 (recorded on the mount; no imprint)' },
      ],
    },
    {
      id: CASE_005_IDS.comparison,
      kind: 'document',
      title: 'Estates comparison note',
      reference: 'File 005 · Item 2a',
      description: 'A note comparing the two photographs.',
      unlock: { type: 'discovery', discoveryId: BADGE_MATCH_DISCOVERY },
      document: {
        stamp: 'Estates',
        heading: 'Comparison note — File 0091 photograph and installation photograph',
        blocks: [
          {
            type: 'paragraph',
            text: 'Same desk, same terminal, same position. Terminal badge HALDEN 486 and asset label NA-07 appear in both.',
          },
          { type: 'paragraph', text: 'Lamp and papers differ.' },
        ],
      },
    },
    {
      id: CASE_005_IDS.manual,
      kind: 'document',
      title: 'Camera manual extract',
      reference: 'File 005 · Item 3',
      description: 'From the manual of a date-back camera.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Manual',
        heading: 'Date-back camera — setting the date',
        blocks: [
          {
            type: 'paragraph',
            text: 'The date is set by hand using the dials on the back of the camera, and may be set to any date from 1980 to 2019.',
          },
          { type: 'paragraph', text: 'The date shown is printed onto the film as each photograph is taken.' },
        ],
      },
    },
    {
      id: CASE_005_IDS.catalogue,
      kind: 'document',
      title: 'Halden product catalogue',
      reference: 'File 005 · Item 4',
      description: 'A manufacturer’s catalogue page, 1996.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Halden',
        heading: 'Halden product catalogue, 1996 — Terminals',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Model', value: 'Halden 486' },
              { label: 'Case', value: 'Beige, maker’s badge lower right' },
              { label: 'Introduced', value: 'March 1996' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_005_IDS.paper,
      kind: 'document',
      title: 'Paper data sheet',
      reference: 'File 005 · Item 5',
      description: 'Manufacturer’s data for the paper of the File 0091 print.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Data sheet',
        heading: 'Colour photographic paper — backprint codes',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Backprint on File 0091 print', value: 'K80' },
              { label: 'Meaning', value: 'Stock manufactured in 1980' },
              { label: 'Shelf life', value: 'Two years' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_005_IDS.companies,
      kind: 'document',
      title: 'Companies register extract',
      reference: 'File 005 · Item 6',
      description: 'The register entry for Kessler Photo.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Companies register',
        heading: 'Kessler Photo — 3 Market Street, Bellwether',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Incorporated', value: '1971' },
              { label: 'Dissolved', value: '1989' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_005_IDS.register,
      kind: 'document',
      title: 'Asset register',
      reference: 'File 005 · Item 7',
      description: 'The asset register entry for this workstation (copy).',
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
      from: CASE_005_IDS.manual,
      to: CASE_005_IDS.photo,
      relation: 'contradicts',
      reason: 'The photograph’s date comes from an imprint; the manual says the imprint can be set by hand to any date.',
    },
    {
      from: CASE_005_IDS.catalogue,
      to: CASE_005_IDS.photo,
      relation: 'contradicts',
      reason: 'The photograph is dated 1981, but the terminal in it, a Halden 486, was introduced in March 1996.',
    },
    {
      from: CASE_005_IDS.installation,
      to: CASE_005_IDS.photo,
      relation: 'same-subject',
      reason: 'Both photographs show reading-room position 7: the same desk and terminal.',
    },
    {
      from: CASE_005_IDS.comparison,
      to: CASE_005_IDS.installation,
      relation: 'derived-from',
      reason: 'The comparison note is made from the installation photograph and the File 0091 photograph.',
    },
    {
      from: CASE_005_IDS.paper,
      to: CASE_005_IDS.companies,
      relation: 'corroborates',
      reason: 'Both records place the making of the print before 1990: paper from 1980, a lab dissolved in 1989.',
    },
    {
      from: CASE_005_IDS.register,
      to: CASE_005_IDS.installation,
      relation: 'corroborates',
      reason: 'Both records give 1998 for the installation of NA-07.',
    },
  ],
  questions: CASE_005_QUESTIONS,
};
