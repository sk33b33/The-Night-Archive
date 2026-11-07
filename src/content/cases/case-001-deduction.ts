import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 001 findings. Canon: the report is unreliable/incomplete; the
 * recording contains information the report omits; the caller's identity
 * remains unknown. No option that names a caller can be supported.
 */
const id = {
  report: evidenceId('c001-incident-report'),
  audioReel: evidenceId('c001-audio-reel'),
  filteredSegment: evidenceId('c001-filtered-segment'),
  roster: evidenceId('c001-duty-roster'),
} as const;

export const CASE_001_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'report-reliability',
    prompt: 'Can the official report be relied on as filed?',
    options: [
      { id: 'reliable', text: 'Yes. It is accurate and complete.' },
      { id: 'unreliable', text: 'No. It is unreliable or incomplete.' },
      { id: 'falsified', text: 'No. It was deliberately falsified.' },
    ],
    supportedOptionId: 'unreliable',
    requires: { allOf: [], anyOf: [id.roster, id.audioReel, id.filteredSegment] },
    hints: [
      'Compare what the report states with the other station records for that night.',
      'The report names its caller as station staff. Check the night duty roster.',
    ],
    citationHint:
      'Your answer about the report may hold, but cite a record that shows the problem with it.',
    finding: 'The official report is unreliable or incomplete.',
  },
  {
    id: 'recording-content',
    prompt: 'What does the recording show, set against the report?',
    options: [
      { id: 'nothing-new', text: 'Nothing beyond what the report records.' },
      { id: 'omitted', text: 'Information the report leaves out.' },
      { id: 'incident-proven', text: 'Proof that an incident took place at the east door.' },
    ],
    supportedOptionId: 'omitted',
    requires: { allOf: [id.report], anyOf: [id.audioReel, id.filteredSegment] },
    hints: [
      'Listen to the whole reel, then reread the report.',
      'The report mentions nothing heard on the reel. Cite both the report and the recording.',
    ],
    citationHint:
      'Your answer about the recording may hold. Cite the report and the recording together.',
    finding: 'The recording contains information the official report omits.',
  },
  {
    id: 'caller-identity',
    prompt: 'Who made the call?',
    options: [
      { id: 'elias-ward', text: 'Elias Ward, as the report states.' },
      { id: 'mara', text: 'Mara.' },
      { id: 'second-voice', text: 'The second voice on the reel.' },
      { id: 'unknown', text: 'The records cannot establish who made the call.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.roster], anyOf: [] },
    hints: [
      'Ask what the records actually establish about the caller, and nothing more.',
      'The roster undermines the name in the report, and neither voice on the reel is identified.',
    ],
    citationHint: 'Your answer may hold. Cite the record that casts doubt on the name in the report.',
    finding: 'The caller’s identity remains unknown.',
  },
];
