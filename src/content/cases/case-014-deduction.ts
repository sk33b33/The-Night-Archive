import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 014 findings (approved bible, reveal level 2). The full post record
 * names the night archivist at NA-07 "Mara —"; the second voice addresses
 * that post by first name. Never accept that the player made either call,
 * that the voice is the player's, that the 1979 "M." is the player, that
 * Mara wrote the slip, or any mechanism. The findings are evaluated before
 * the closing choice and do not depend on it.
 */
const id = {
  post: evidenceId('c014-post-record'),
  tonight: evidenceId('c014-tonight'),
  reel: evidenceId('c014-reel-1981'),
  extensionLog: evidenceId('c014-extension-log'),
  exchange: evidenceId('c014-exchange'),
  nightDesk: evidenceId('c014-night-desk-log'),
  history: evidenceId('c014-dates'),
} as const;

export const CASE_014_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'named',
    prompt: 'Which record names the night archivist at NA-07, and how?',
    options: [
      { id: 'post-mara', text: 'The full post record: “Mara —”, surname withheld.' },
      { id: 'post-m', text: 'The post record: “M. —” only. No record gives a name.' },
      { id: 'register-1979', text: 'The 1979 staff register: “M. —”.' },
    ],
    supportedOptionId: 'post-mara',
    requires: { allOf: [id.post], anyOf: [] },
    hints: ['Read the full post record, not the summary seen before.', 'Look at the Holder field.'],
    citationHint: 'Your answer may hold. Cite the full post record.',
    finding: 'The full post record names the night archivist at NA-07 “Mara —”, surname withheld.',
  },
  {
    id: 'addressed',
    prompt: 'Whom does the second voice address?',
    options: [
      { id: 'night-archivist', text: 'The night archivist at NA-07, by first name.' },
      { id: 'player-self', text: 'You. It is your own voice.' },
      { id: 'ward', text: 'E. Ward, the caller.' },
      { id: 'nobody', text: 'No one in particular. “Mara” is not in any record.' },
    ],
    supportedOptionId: 'night-archivist',
    requires: { allOf: [id.post], anyOf: [id.tonight, id.reel] },
    hints: [
      'Listen to the second voice with voice isolation on, in either recording.',
      'Then compare the name it uses with the post record.',
    ],
    citationHint: 'Your answer may hold. Cite the post record and one of the recordings.',
    finding: 'In 1981 and tonight, the second voice says “Mara, don’t file this.” It addresses the night archivist at NA-07 by first name.',
  },
  {
    kind: 'multi',
    id: 'logged-0031',
    prompt: 'Which records log a 0:31 call at 03:40?',
    options: [
      { id: 'exchange', text: 'The exchange record, route BW-4 (1981)' },
      { id: 'extension', text: 'The extension log, NA-07 (tonight)' },
      { id: 'night-desk', text: 'The night desk log (1981)' },
      { id: 'post', text: 'The post record' },
    ],
    supportedOptionIds: ['exchange', 'extension'],
    missingHint: 'Two records give both the time and the length.',
    extraHint: 'At least one of those gives the time but not the length of the call.',
    requires: { allOf: [id.exchange, id.extensionLog], anyOf: [] },
    hints: ['Look for 03:40 and 0:31 together.', 'One record is from 1981, one from tonight.'],
    citationHint: 'Your selection may hold. Cite the exchange record and the extension log.',
    finding: 'The 1981 exchange record and tonight’s extension log both log a 0:31 call at 03:40.',
  },
  {
    kind: 'ordering',
    id: 'years',
    prompt: 'Put these in order.',
    items: [
      { id: 'tonight', text: 'A call reaches NA-07 at 03:40.' },
      { id: 'created', text: 'Extension NA-07 is created.' },
      { id: 'call-1981', text: 'A call leaves the east platform kiosk at 03:40.' },
      { id: 'sealed', text: 'The east door is sealed.' },
      { id: 'withdrawn', text: 'Route BW-4 is withdrawn.' },
    ],
    supportedOrder: ['sealed', 'call-1981', 'withdrawn', 'created', 'tonight'],
    requires: { allOf: [id.history], anyOf: [] },
    hints: ['Each has a year in the dates on file.', '1979, 1981, 1983, 1998, tonight.'],
    citationHint: 'Your order may hold. Cite the dates on file.',
    finding: 'The east door was sealed (1979); a call left the kiosk at 03:40 (1981); route BW-4 was withdrawn (1983); NA-07 was created (1998); a call reached NA-07 at 03:40 (tonight).',
  },
  {
    id: 'how',
    prompt: 'How did a voice recorded in 1981 know the name of tonight’s night archivist?',
    options: [
      { id: 'same-person', text: 'The 1979 “M.” and tonight’s night archivist are the same person.' },
      { id: 'recorded-tonight', text: 'The 1981 reel was recorded tonight.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.reel, id.post], anyOf: [] },
    hints: ['Is there a record that explains it?', 'The records show the name and the dates. None says how.'],
    citationHint: 'Your answer may hold. Cite the 1981 reel and the post record.',
    finding: 'How a voice recorded in 1981 addresses tonight’s night archivist by name cannot be established.',
  },
];
