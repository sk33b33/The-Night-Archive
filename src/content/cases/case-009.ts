import { ARCHIVE_DESK } from '../archive';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type PhotoEvidence } from '../../domain/evidence';
import { CASE_009_QUESTIONS } from './case-009-deduction';
import {
  glyphRegions,
  HAND_SAMPLES,
  SAMPLES_DISCOVERY,
  SPECIMEN_DISCOVERY,
  type HandSampleKey,
} from './case-009-hands';

/**
 * Case 009 — The Hand (Season 2). Canon: docs/cases/case-009-bible.md
 * (approved; end beat A). One hand, consistent with a 1979 "M."; never an
 * identity link to the player.
 */
export const CASE_009_IDS = {
  slip: evidenceId('c009-slip'),
  calendar: evidenceId('c009-sample-calendar'),
  ledger0091: evidenceId('c009-sample-0091'),
  ledger14oct: evidenceId('c009-sample-14oct'),
  filedM: evidenceId('c009-sample-filed-m'),
  specimen: evidenceId('c009-specimen'),
  register: evidenceId('c009-staff-register'),
  method: evidenceId('c009-method-note'),
  specimenNote: evidenceId('c009-specimen-note'),
  samplesNote: evidenceId('c009-samples-note'),
  envelope: evidenceId('c009-envelope'),
  post: evidenceId('c009-post-record'),
} as const;

const sample = (
  key: HandSampleKey,
  id: PhotoEvidence['id'],
  title: string,
  reference: string,
  description: string,
  alt: string,
  source: string,
): PhotoEvidence => ({
  id,
  kind: 'photo',
  title,
  reference,
  description,
  unlock: { type: 'initial' },
  artwork: `hand-${key}`,
  alt,
  caption: source,
  regions: glyphRegions(HAND_SAMPLES[key]),
  catalogue: [{ label: 'Source', value: source }],
});

export const CASE_009: CaseDefinition = {
  id: caseId('case-009'),
  number: '009',
  title: 'The Hand',
  location: 'Records facility, Bellwether — tonight, 05:20',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-008'),
  briefing: {
    summary: 'The envelope holds a handwritten intake slip. Whose hand is it?',
    assignment: [
      'The envelope delivered to your desk holds a single handwritten intake slip, numbered 0094.',
      'Establish what the records can say about the hand that wrote it. Record only what the evidence supports.',
    ],
    reportId: CASE_009_IDS.register,
  },
  evidence: [
    sample('slip', CASE_009_IDS.slip, 'The 0094 intake slip', 'File 0094 · Item 1', 'The slip found in the envelope.',
      'A handwritten intake slip in blue ink. Number 0094, time 06:00, description Photograph, filed by M.', 'Intake slip, from the envelope delivered tonight.'),
    sample('calendar', CASE_009_IDS.calendar, 'Sample: calendar note', 'File 0094 · Item 2', 'Enlargement of the note on the Harrow Lane calendar.',
      'Handwriting in blue ink: Inspector — 10:00.', 'From the calendar, 14 Harrow Lane, March 1984 (File 002).'),
    sample('ledger0091', CASE_009_IDS.ledger0091, 'Sample: “0091”', 'File 0094 · Item 3', 'Enlargement of the number on the desk papers.',
      'Handwriting in blue ink: 0091.', 'From the intake ledger page in the File 0091 photograph (October 1981).'),
    sample('ledger14oct', CASE_009_IDS.ledger14oct, 'Sample: “14 Oct”', 'File 0094 · Item 4', 'Enlargement of the date on the voided ledger line.',
      'Handwriting in blue ink: 14 Oct.', 'From the intake ledger, October 1981, line 0091 (File 0091).'),
    sample('filedM', CASE_009_IDS.filedM, 'Sample: “Filed. — M.”', 'File 0094 · Item 5', 'Enlargement of the annotation on the 1981 incident report.',
      'Handwriting in blue ink: Filed. — M.', 'From the incident report, Bellwether Railway Station (File 001).'),
    sample('specimen', CASE_009_IDS.specimen, 'Specimen signature card', 'File 0094 · Item 6', 'The specimen signature on file for the night archivist post, 1979.',
      'A specimen signature card: Post, night archivist. Signed M. Recorded 1979.', 'Staff records, specimen signatures, 1979.'),
    {
      id: CASE_009_IDS.register,
      kind: 'document',
      title: 'Staff register extract',
      reference: 'File 0094 · Item 7',
      description: 'The facility’s staff register for the night archivist post.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Staff register',
        heading: 'Staff register — Records facility, Bellwether',
        blocks: [
          {
            type: 'table',
            caption: 'Night archivist post',
            columns: ['Post', 'Holder', 'From', 'To', 'Specimen'],
            rows: [['Night archivist', 'M. —', '1979', '1983', 'On file']],
          },
          { type: 'paragraph', text: 'Surname withheld.' },
        ],
      },
      // Approved end beat A: a second date, in the same hand. Never explained.
      amendments: [
        {
          id: 'tonight',
          whenCaseClosed: caseId('case-009'),
          setCell: { blockIndex: 0, row: 0, column: 3, value: '1983 — tonight' },
        },
      ],
    },
    {
      id: CASE_009_IDS.method,
      kind: 'document',
      title: 'Examiner’s method note',
      reference: 'File 0094 · Item 8',
      description: 'How handwriting is compared, and what a comparison can show.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Examiner',
        heading: 'Handwriting comparison — method',
        blocks: [
          { type: 'paragraph', text: 'Samples are compared by letterform: here, a crossed capital M, a 0 left open at the top, and a slanted 1.' },
          { type: 'paragraph', text: 'The strongest conclusion the method allows is that samples are “consistent with” one hand. It cannot show that one person wrote them.' },
        ],
      },
    },
    {
      id: CASE_009_IDS.specimenNote,
      kind: 'document',
      title: 'Specimen comparison note',
      reference: 'File 0094 · Item 6a',
      description: 'A comparison with the 1979 specimen signature.',
      unlock: { type: 'discovery', discoveryId: SPECIMEN_DISCOVERY },
      document: {
        stamp: 'Examiner',
        heading: 'Comparison note — 1979 specimen signature',
        blocks: [{ type: 'paragraph', text: 'The crossed capital M is consistent with the 1979 specimen signature for the night archivist post.' }],
      },
    },
    {
      id: CASE_009_IDS.samplesNote,
      kind: 'document',
      title: 'Sample comparison note',
      reference: 'File 0094 · Item 3a',
      description: 'A comparison of the handwriting samples with each other.',
      unlock: { type: 'discovery', discoveryId: SAMPLES_DISCOVERY },
      document: {
        stamp: 'Examiner',
        heading: 'Comparison note — handwriting samples',
        blocks: [
          { type: 'paragraph', text: 'The samples share their letterforms: the crossed M, the open 0, the slanted 1.' },
          { type: 'paragraph', text: 'They are consistent with one hand.' },
        ],
      },
    },
    {
      id: CASE_009_IDS.envelope,
      kind: 'object',
      title: 'The envelope (opened)',
      reference: 'File 0094 · Item 9',
      description: 'The internal-mail envelope delivered to your desk, now opened.',
      unlock: { type: 'initial' },
      details: [
        { label: 'Item', value: 'Internal-mail envelope' },
        { label: 'Addressed', value: `Night archivist, ${ARCHIVE_DESK.workstation}` },
        { label: 'Seal', value: 'Broken (opened 05:20)' },
        { label: 'Contents', value: '1 intake slip' },
      ],
      provenance: [
        { date: 'Tonight, 05:10', holder: 'Night porter (J.T.)', location: 'Position 7, reading room', action: 'Delivered' },
        { date: 'Tonight, 05:15', holder: `Night archivist (Workstation ${ARCHIVE_DESK.workstation})`, location: 'Position 7, reading room', action: 'Received. Not opened.' },
        { date: 'Tonight, 05:20', holder: `Night archivist (Workstation ${ARCHIVE_DESK.workstation})`, location: 'Position 7, reading room', action: 'Opened' },
      ],
      linked: [CASE_009_IDS.slip],
    },
    {
      id: CASE_009_IDS.post,
      kind: 'document',
      title: 'Night archivist post record',
      reference: 'File 0094 · Item 10',
      description: 'The current staffing record for the post at your workstation.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Staffing',
        heading: `Post record — night archivist, Workstation ${ARCHIVE_DESK.workstation}`,
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Post', value: 'Night archivist' },
              { label: 'Workstation', value: ARCHIVE_DESK.workstation },
              { label: 'Holder', value: 'M. —' },
            ],
          },
          { type: 'paragraph', text: 'Surname withheld.' },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_009_IDS.slip,
      to: CASE_009_IDS.specimen,
      relation: 'corroborates',
      reason: 'Both carry the same crossed capital M.',
    },
    {
      from: CASE_009_IDS.slip,
      to: CASE_009_IDS.ledger0091,
      relation: 'corroborates',
      reason: 'Both carry the same 0, left open at the top.',
    },
    {
      from: CASE_009_IDS.register,
      to: CASE_009_IDS.specimen,
      relation: 'same-subject',
      reason: 'The register lists the 1979 night archivist “M.” with a specimen on file; this is that specimen.',
    },
    {
      from: CASE_009_IDS.register,
      to: CASE_009_IDS.post,
      relation: 'same-subject',
      reason: 'Both records list the holder of the night archivist post as “M. —”, surname withheld.',
    },
    {
      from: CASE_009_IDS.specimenNote,
      to: CASE_009_IDS.specimen,
      relation: 'derived-from',
      reason: 'The note is made by comparing the specimen signature with the other samples.',
    },
    {
      from: CASE_009_IDS.samplesNote,
      to: CASE_009_IDS.ledger0091,
      relation: 'derived-from',
      reason: 'The note is made by comparing the samples, including the “0091” enlargement.',
    },
  ],
  questions: CASE_009_QUESTIONS,
};
