import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 003 findings (approved bible). Supported: not from the call box; the
 * fifth call came from a private ex-directory line; the caller cannot be
 * identified; and the order of events. Never accept "hoax", Mrs Pell, a
 * named address as the caller, or any link to earlier cases.
 */
const id = {
  callLog: evidenceId('c003-call-log'),
  fault: evidenceId('c003-fault-report'),
  handset: evidenceId('c003-handset'),
  trace: evidenceId('c003-trace'),
} as const;

export const CASE_003_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'call-box',
    prompt: 'Were the calls made from the Station Road call box?',
    options: [
      { id: 'yes', text: 'Yes, as the caller said.' },
      { id: 'no', text: 'No. The call box could not be used that week.' },
      { id: 'another-box', text: 'No. They came from a different call box.' },
    ],
    supportedOptionId: 'no',
    requires: { allOf: [], anyOf: [id.fault, id.handset] },
    hints: [
      'Check what state the call box was in that week.',
      'The fault report and the property store both show where the handset was from 1 November.',
    ],
    citationHint: 'Your answer may hold. Cite a record that shows the call box could not be used.',
    finding: 'The calls were not made from the Station Road call box.',
  },
  {
    id: 'fifth-call-origin',
    prompt: 'Where did the fifth call come from?',
    options: [
      { id: 'call-box', text: 'A public call box.' },
      { id: 'private-line', text: 'A private, ex-directory line on the Bellwether exchange.' },
      { id: 'harrow-lane', text: '12 Harrow Lane.' },
    ],
    supportedOptionId: 'private-line',
    requires: { allOf: [id.trace], anyOf: [] },
    hints: [
      'One record follows the fifth call back through the exchange.',
      'The malicious-call trace gives the kind of line, not a person or an address.',
    ],
    citationHint: 'Your answer may hold. Cite the record that traced the call.',
    finding: 'The fifth call came from a private, ex-directory line on the Bellwether exchange.',
  },
  {
    id: 'caller',
    prompt: 'Who made the calls?',
    options: [
      { id: 'hoaxer', text: 'A hoaxer, as the file concluded.' },
      { id: 'pell', text: 'Mrs J. Pell.' },
      { id: 'unknown', text: 'The records cannot establish who.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.trace], anyOf: [] },
    hints: [
      'Ask what the records can actually say about the person, as opposed to the line.',
      'The trace names no subscriber: it was redacted. Nothing else identifies the caller.',
    ],
    citationHint: 'Your answer may hold. Cite the record that should have named the line’s subscriber.',
    finding: 'Who made the calls cannot be established.',
  },
  {
    kind: 'ordering',
    id: 'sequence',
    prompt: 'Put these events in the order they happened.',
    items: [
      { id: 'call-5', text: 'The fifth call is made.' },
      { id: 'refitted', text: 'The handset is refitted to the call box.' },
      { id: 'call-1', text: 'The first call is made.' },
      { id: 'trace-requested', text: 'A trace is requested.' },
      { id: 'removed', text: 'The call box handset is removed for repair.' },
    ],
    supportedOrder: ['removed', 'call-1', 'trace-requested', 'call-5', 'refitted'],
    requires: { allOf: [id.fault, id.trace], anyOf: [] },
    hints: [
      'Every event has a date in the records. Line them up.',
      'The handset was removed on 1 November; the trace was requested on the morning of 7 November.',
    ],
    citationHint: 'Your order may hold. Cite the records that date the handset’s removal and the trace.',
    finding:
      'The handset was removed before the first call and refitted after the last; the trace was requested before the fifth call.',
  },
];
