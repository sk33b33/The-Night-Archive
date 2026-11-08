import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 012 findings (approved bible). The porter's log has the east door
 * open at 03:25; the supervisor's book has it sealed at 04:05. Only the
 * porter's log says it was open. Never accept anyone named opening it, a
 * lie, the SB-07 key opening it, the lights as a person, or a mechanism.
 */
const id = {
  timeline: evidenceId('c012-timeline'),
  signal: evidenceId('c012-signal-box'),
  porter: evidenceId('c012-porter-log'),
  supervisor: evidenceId('c012-supervisor-book'),
  exchange: evidenceId('c012-exchange'),
  report: evidenceId('c012-incident-report'),
  roster: evidenceId('c012-roster'),
} as const;

export const CASE_012_QUESTIONS: readonly DeductionQuestion[] = [
  {
    kind: 'ordering',
    id: 'night-order',
    prompt: 'Put what the records describe in order.',
    items: [
      { id: 'kiosk', text: 'A call leaves the east platform kiosk.' },
      { id: 'sealed', text: 'The supervisor records the door sealed, boarding intact.' },
      { id: 'lights', text: 'The signal box records lights at the east platform end.' },
      { id: 'unanswered', text: 'The porter phones the supervisor’s office; no answer.' },
      { id: 'open', text: 'The porter records the east door standing open.' },
    ],
    supportedOrder: ['lights', 'open', 'unanswered', 'kiosk', 'sealed'],
    requires: { allOf: [id.timeline], anyOf: [] },
    hints: ['The timeline puts every source on one axis.', 'Read the timeline’s list from 03:00 onwards.'],
    citationHint: 'Your order may hold. Cite the timeline.',
    finding:
      'In order: lights at the east platform end (03:18); the door recorded open (03:25); the porter’s call unanswered (03:30); the kiosk call (03:40); the door recorded sealed (04:05).',
  },
  {
    kind: 'multi',
    id: 'says-open',
    prompt: 'Which records say the east door was open that night?',
    options: [
      { id: 'porter', text: 'The porter’s log' },
      { id: 'signal', text: 'The signal box register' },
      { id: 'exchange', text: 'The exchange record' },
      { id: 'report', text: 'The incident report' },
      { id: 'supervisor', text: 'The supervisor’s occurrence book' },
    ],
    supportedOptionIds: ['porter'],
    missingHint: 'One record does say it. Read each source’s entries about the door itself.',
    extraHint:
      'At least one of those does not mention the door being open. Lights, a call, or “unusual activity” are not the door.',
    requires: { allOf: [id.porter], anyOf: [] },
    hints: ['Look for the word “open”.', 'Only one source describes the door itself as open.'],
    citationHint: 'Your selection may hold. Cite the porter’s log.',
    finding: 'Only the porter’s log says the east door was open (03:25).',
  },
  {
    kind: 'number',
    id: 'minutes',
    prompt: 'How many minutes after the door was recorded open was the kiosk call made?',
    unit: 'minutes',
    supportedValue: 15,
    nearMisses: [{ value: 10, hint: 'That is from the porter’s unanswered call. Start from the door.' }],
    requires: { allOf: [id.porter, id.exchange], anyOf: [] },
    hints: ['Find the two times: the door recorded open, and the kiosk call.', '03:25 and 03:40.'],
    citationHint: 'Your count may hold. It rests on the porter’s log and the exchange record.',
    finding: 'The kiosk call (03:40) was made 15 minutes after the door was recorded open (03:25).',
  },
  {
    id: 'door-open',
    prompt: 'Was the east door open that night?',
    options: [
      { id: 'yes', text: 'Yes. The porter’s log records it open at 03:25.' },
      { id: 'no', text: 'No. The supervisor found it sealed at 04:05.' },
      { id: 'disagree', text: 'The records disagree. It cannot be established.' },
    ],
    supportedOptionId: 'disagree',
    requires: { allOf: [id.porter, id.supervisor], anyOf: [] },
    hints: ['Read what each record says about the door, and when.', 'One says open at 03:25; the other says sealed and intact at 04:05.'],
    citationHint: 'Your answer may hold. Cite both the porter’s log and the supervisor’s book.',
    finding:
      'The porter’s log records the door open at 03:25; the supervisor’s book records it sealed, boarding intact, at 04:05. Whether it was open cannot be established.',
  },
  {
    id: 'kiosk-caller',
    prompt: 'Who used the east platform kiosk at 03:40?',
    options: [
      { id: 'ward', text: 'Elias Ward, the caller named in the report.' },
      { id: 'okafor', text: 'The porter, D. Okafor.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.exchange], anyOf: [id.roster, id.report] },
    hints: [
      'What does the exchange record say about who called?',
      'The report names a caller as station staff. Does the roster agree?',
    ],
    citationHint: 'Your answer may hold. Cite the exchange record, and the roster or the report.',
    finding: 'Who used the kiosk at 03:40 cannot be established. The exchange record does not say, and the report’s caller is not on the roster.',
  },
];
