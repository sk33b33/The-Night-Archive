import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 009 findings (approved bible). One hand runs through the samples,
 * consistent with a 1979 night archivist "M."; the method allows only
 * "consistent with". Never accept that the player wrote it, that the
 * archivists are the same person, Mara, forgery, or a mechanism.
 */
const id = {
  slip: evidenceId('c009-slip'),
  specimen: evidenceId('c009-specimen'),
  register: evidenceId('c009-staff-register'),
  method: evidenceId('c009-method-note'),
  samplesNote: evidenceId('c009-samples-note'),
  post: evidenceId('c009-post-record'),
} as const;

export const CASE_009_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'one-hand',
    prompt: 'Are the handwriting samples consistent with one hand?',
    options: [
      { id: 'yes', text: 'Yes. They share the same letterforms.' },
      { id: 'no', text: 'No. They are different hands.' },
      { id: 'cannot-compare', text: 'They cannot be compared.' },
    ],
    supportedOptionId: 'yes',
    requires: { allOf: [id.samplesNote, id.method], anyOf: [] },
    hints: [
      'Compare the samples letter by letter.',
      'Match the open “0” in two samples, then cite the comparison and the method note.',
    ],
    citationHint: 'Your answer may hold. Cite the sample comparison and the method note.',
    finding: 'The handwriting samples are consistent with one hand.',
  },
  {
    id: 'standard',
    prompt: 'What is the strongest conclusion handwriting comparison allows here?',
    options: [
      { id: 'same-person', text: 'That the samples were written by the same person.' },
      { id: 'consistent', text: 'That the samples are consistent with one hand.' },
      { id: 'nothing', text: 'Nothing at all.' },
    ],
    supportedOptionId: 'consistent',
    requires: { allOf: [id.method], anyOf: [] },
    hints: ['One record explains what the comparison can and cannot show.', 'The method note: “consistent with” is the strongest conclusion.'],
    citationHint: 'Your answer may hold. Cite the method note.',
    finding: 'Handwriting comparison can show that samples are consistent with one hand, not that one person wrote them.',
  },
  {
    kind: 'multi',
    id: 'named-m',
    prompt: 'Which records name a night archivist “M.”?',
    options: [
      { id: 'register', text: 'The staff register' },
      { id: 'post', text: 'The night archivist post record' },
      { id: 'specimen', text: 'The specimen signature card' },
      { id: 'slip', text: 'The 0094 intake slip' },
      { id: 'method', text: 'The examiner’s method note' },
    ],
    supportedOptionIds: ['post', 'register'],
    requires: { allOf: [], anyOf: [id.register, id.post] },
    hints: [
      'A signature is not a record of who holds a post.',
      'Two records list the holder of the night archivist post: one from 1979, one current.',
    ],
    missingHint: 'Your selection leaves out a record that lists a night archivist “M.”.',
    extraHint: 'Your selection includes a record that does not name the post’s holder.',
    citationHint: 'Your selection may hold. Cite the staff register or the post record.',
    finding: 'The staff register (1979–1983) and the current post record both list the night archivist as “M.”.',
  },
  {
    kind: 'ordering',
    id: 'records',
    prompt: 'Put the records these samples appear in, in order of the record’s date.',
    items: [
      { id: 'slip', text: 'The 0094 intake slip (tonight).' },
      { id: 'calendar', text: 'The Harrow Lane calendar (March 1984).' },
      { id: 'specimen', text: 'The specimen signature card (1979).' },
      { id: 'ledger', text: 'The intake ledger (October 1981).' },
    ],
    supportedOrder: ['specimen', 'ledger', 'calendar', 'slip'],
    requires: { allOf: [id.register, id.slip], anyOf: [] },
    hints: ['Each record carries its date.', '1979, 1981, 1984, tonight.'],
    citationHint: 'Your order may hold. Cite the staff register and the slip.',
    finding: 'The hand appears in records dated from 1979 to tonight.',
  },
  {
    id: 'same-person',
    prompt: 'Are the 1979 night archivist and the current post holder the same person?',
    options: [
      { id: 'yes', text: 'Yes. Both are recorded as “M.”.' },
      { id: 'no', text: 'No. The register ends in 1983.' },
      { id: 'unknown', text: 'The records cannot establish it.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.register, id.post], anyOf: [] },
    hints: [
      'A shared initial is not an identity.',
      'Both surnames are withheld, and the method note allows only “consistent with”.',
    ],
    citationHint: 'Your answer may hold. Cite the staff register and the post record.',
    finding: 'Whether the 1979 night archivist and the current post holder are the same person cannot be established.',
  },
];
