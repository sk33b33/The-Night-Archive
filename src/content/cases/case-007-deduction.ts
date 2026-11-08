import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 007 findings (approved bible, reveal level 1). Establish that a call
 * reached NA-07 tonight, that it matches the 1981 reel, and that its route
 * and extension make it impossible. Never accept that the player, Elias
 * Ward, or anyone named placed it, or any mechanism.
 */
const id = {
  tonight: evidenceId('c007-tonight'),
  comparison: evidenceId('c007-comparison-note'),
  extensionLog: evidenceId('c007-extension-log'),
  routing: evidenceId('c007-routing-record'),
  register: evidenceId('c007-extension-register'),
} as const;

export const CASE_007_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'what-reached',
    prompt: 'What reached extension NA-07 tonight at 03:40?',
    options: [
      { id: 'nothing', text: 'Nothing. The log is in error.' },
      { id: 'matching-call', text: 'A recorded call that matches the 1981 reel.' },
      { id: 'new-call', text: 'A new call, unrelated to 1981.' },
    ],
    supportedOptionId: 'matching-call',
    requires: { allOf: [id.extensionLog, id.comparison], anyOf: [] },
    hints: [
      'Listen to tonight’s recording beside the 1981 reel.',
      'Compare the two recordings segment by segment, then cite the extension log and what the comparison shows.',
    ],
    citationHint: 'Your answer may hold. Cite the extension log and the comparison.',
    finding: 'A recorded call reached extension NA-07 tonight at 03:40, matching the 1981 reel segment for segment.',
  },
  {
    kind: 'multi',
    id: 'impossible',
    prompt: 'Which records say this call should not have been possible?',
    options: [
      { id: 'routing', text: 'The exchange routing record' },
      { id: 'register', text: 'The extension register' },
      { id: 'extension-log', text: 'The extension log' },
      { id: 'reel', text: 'The 1981 audio reel' },
      { id: 'post', text: 'The night archivist post record' },
    ],
    supportedOptionIds: ['register', 'routing'],
    requires: { allOf: [], anyOf: [id.routing, id.register] },
    hints: [
      'A call needs a route to arrive by and an extension to arrive at.',
      'The route was withdrawn in 1983; the extension did not exist before 1998.',
    ],
    missingHint: 'Your selection leaves out a record that rules the call out.',
    extraHint: 'Your selection includes a record that does not rule the call out.',
    citationHint: 'Your selection may hold. Cite the routing record or the extension register.',
    finding: 'The routing record and the extension register both rule the call out.',
  },
  {
    kind: 'ordering',
    id: 'route',
    prompt: 'Put these in order.',
    items: [
      { id: 'received', text: 'A call is received at NA-07 (tonight).' },
      { id: 'withdrawn', text: 'Route BW-4 is withdrawn (1983).' },
      { id: 'in-service', text: 'Route BW-4 enters service (1974).' },
      { id: 'created', text: 'Extension NA-07 is created (1998).' },
    ],
    supportedOrder: ['in-service', 'withdrawn', 'created', 'received'],
    requires: { allOf: [id.routing, id.register], anyOf: [] },
    hints: [
      'Each item carries its year.',
      'The route was gone fifteen years before the extension existed.',
    ],
    citationHint: 'Your order may hold. Cite the routing record and the extension register.',
    finding: 'Route BW-4 was withdrawn fifteen years before extension NA-07 was created.',
  },
  {
    id: 'addressed',
    prompt: 'Who is the second voice speaking to?',
    options: [
      { id: 'you', text: 'You, the night archivist.' },
      { id: 'whoever-answers', text: 'Whoever answers NA-07. The records do not say who.' },
      { id: 'elias', text: 'Elias Ward.' },
    ],
    supportedOptionId: 'whoever-answers',
    requires: { allOf: [id.tonight], anyOf: [] },
    hints: [
      'Listen to what the second voice says, and to which extension the call came.',
      'The voice uses a name. Ask whether any record ties that name to anyone.',
    ],
    citationHint: 'Your answer may hold. Cite tonight’s recording.',
    finding: 'The second voice speaks to whoever answers NA-07; the records do not say who that is.',
  },
  {
    id: 'who-placed',
    prompt: 'Who placed the call?',
    options: [
      { id: 'you', text: 'You did.' },
      { id: 'elias', text: 'Elias Ward.' },
      { id: 'unknown', text: 'It cannot be established.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.extensionLog], anyOf: [] },
    hints: [
      'Look at what the extension log records about the caller.',
      'The log gives a route, not a person, and the route no longer exists.',
    ],
    citationHint: 'Your answer may hold. Cite the extension log.',
    finding: 'Who placed the call cannot be established.',
  },
];
