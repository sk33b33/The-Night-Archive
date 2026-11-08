import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 011 findings (approved bible). 48 boxes sealed, 45 received, three
 * unaccounted for: SB-07 and SB-31 never found, SB-40 transferred but never
 * received. Never accept that the photograph was taken tonight, a theft,
 * SB-07's contents, the player as the 1981 "M.", or a mechanism.
 */
const id = {
  photo: evidenceId('c011-photograph'),
  inventory: evidenceId('c011-inventory'),
  clearance: evidenceId('c011-clearance'),
  accession: evidenceId('c011-accession'),
  history: evidenceId('c011-building-history'),
  ledger: evidenceId('c011-intake-ledger'),
  location: evidenceId('c011-location-note'),
} as const;

export const CASE_011_QUESTIONS: readonly DeductionQuestion[] = [
  {
    kind: 'number',
    id: 'sealed-count',
    prompt: 'How many boxes did the sealing inventory list?',
    unit: 'boxes',
    supportedValue: 48,
    nearMisses: [
      { value: 46, hint: 'That is how many the clearance list transferred. The question asks what was sealed in 1981.' },
      { value: 45, hint: 'That is how many the stack room received. The question asks what was sealed in 1981.' },
    ],
    requires: { allOf: [id.inventory], anyOf: [] },
    hints: ['The sealing inventory has a total.', 'Read the last line of the inventory table.'],
    citationHint: 'Your count may hold. Cite the sealing inventory.',
    finding: 'The sealing inventory of 16 October 1981 lists 48 boxes, SB-01 to SB-48.',
  },
  {
    kind: 'number',
    id: 'unaccounted',
    prompt: 'Reconciling the inventory, the clearance list and the accession, how many boxes are unaccounted for?',
    unit: 'boxes',
    supportedValue: 3,
    nearMisses: [
      { value: 2, hint: 'You have counted the boxes not found at clearance. Compare the clearance list with the accession too.' },
      { value: 1, hint: 'You have found the transfer gap. Check what the clearance list could not find.' },
    ],
    requires: { allOf: [id.inventory, id.clearance, id.accession], anyOf: [] },
    hints: [
      'Compare what was sealed with what the stack room received.',
      'Sealed 48; received 45. Each record has a total.',
    ],
    citationHint: 'Your count may hold. It rests on all three records: the inventory, the clearance list and the accession.',
    finding: 'Of the 48 boxes sealed in 1981, the stack room received 45. Three are unaccounted for.',
  },
  {
    kind: 'multi',
    id: 'which-boxes',
    prompt: 'Which boxes are unaccounted for?',
    options: [
      { id: 'sb07', text: 'SB-07' },
      { id: 'sb12', text: 'SB-12' },
      { id: 'sb31', text: 'SB-31' },
      { id: 'sb40', text: 'SB-40' },
      { id: 'sb48', text: 'SB-48' },
    ],
    supportedOptionIds: ['sb07', 'sb31', 'sb40'],
    missingHint: 'At least one is missing. The clearance list names two; the accession’s ranges leave out another.',
    extraHint: 'At least one of those was received by the stack room. Check the accession’s ranges.',
    requires: { allOf: [id.clearance, id.accession], anyOf: [] },
    hints: ['Read the clearance list’s “Not found” lines.', 'Then read the accession’s ranges box by box.'],
    citationHint: 'Your selection may hold. Cite the clearance list and the accession.',
    finding:
      'SB-07 and SB-31 were not found at clearance in 1997. SB-40 is listed as transferred but is not in the stack room accession.',
  },
  {
    id: 'photo-shows',
    prompt: 'What does the File 0094 photograph show?',
    options: [
      { id: 'storage-b-three', text: 'Storage B, with the three unaccounted boxes on its shelves.' },
      { id: 'storage-b-sealing', text: 'Storage B at sealing, in 1981.' },
      { id: 'stack-room', text: 'The stack room.' },
      { id: 'storage-b-tonight', text: 'Storage B as it is tonight.' },
    ],
    supportedOptionId: 'storage-b-three',
    requires: { allOf: [id.location, id.photo], anyOf: [] },
    hints: [
      'Compare the File 0094 photograph with the sealing photograph.',
      'Match the window, then read the labels on the boxes in the File 0094 photograph.',
    ],
    citationHint: 'Your answer may hold. Cite the location note and the photograph itself.',
    finding:
      'The File 0094 photograph shows Storage B, with three boxes on its shelves labelled SB-07, SB-31 and SB-40: the three unaccounted for.',
  },
  {
    id: 'photo-when',
    prompt: 'When was the File 0094 photograph taken?',
    options: [
      { id: 'tonight', text: 'Tonight, at 06:00.' },
      { id: 'sealing', text: 'On 16 October 1981, at sealing.' },
      { id: 'unknown', text: 'The records cannot establish when it was taken.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.history], anyOf: [id.ledger, id.photo] },
    hints: [
      'The ledger gives when it was filed. Is that when it was taken?',
      'The print has no date. The building history says when Storage B stopped being a storage room.',
    ],
    citationHint: 'Your answer may hold. Cite the building history, and the ledger or the photograph.',
    finding:
      'When the File 0094 photograph was taken cannot be established. It was filed tonight; the room it shows was converted in 1997–98.',
  },
];
