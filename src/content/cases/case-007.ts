import { ARCHIVE_DESK } from '../archive';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { CASE_001_REEL, VOICE_ISOLATION } from './case-001-audio';
import { CASE_007_QUESTIONS } from './case-007-deduction';
import { CASE_007_TONIGHT, RECORDINGS_MATCH_DISCOVERY } from './case-007-audio';

/**
 * Case 007 — The Impossible Call. Canon: docs/cases/case-007-bible.md
 * (approved: reveal level 1, final beat A). Establishes the call and its
 * impossibility; never who placed it, who answers, or how.
 */
export const CASE_007_IDS = {
  tonight: evidenceId('c007-tonight'),
  comparison: evidenceId('c007-comparison-note'),
  extensionLog: evidenceId('c007-extension-log'),
  routing: evidenceId('c007-routing-record'),
  register: evidenceId('c007-extension-register'),
  reel: evidenceId('c007-reel-1981'),
  post: evidenceId('c007-post-record'),
  report: evidenceId('c007-incident-report'),
} as const;

export const CASE_007: CaseDefinition = {
  id: caseId('case-007'),
  number: '007',
  title: 'The Impossible Call',
  location: 'Records facility, Bellwether — tonight',
  accessLevel: 1,
  availableAfter: caseId('case-006'),
  briefing: {
    summary: 'A call to your desk at 03:40 tonight that you never heard.',
    assignment: [
      `The log for extension ${ARCHIVE_DESK.workstation} shows a call at 03:40 tonight, while you were on break. The answerphone on your desk recorded it.`,
      'Establish what reached your desk. Record only what the evidence supports.',
    ],
    reportId: CASE_007_IDS.extensionLog,
  },
  evidence: [
    {
      id: CASE_007_IDS.tonight,
      kind: 'audio',
      title: 'NA-07 answerphone recording',
      reference: 'File 007 · Item 1',
      description: 'The call recorded on your desk’s answerphone tonight.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Recorded', value: 'Tonight, 03:40:00' },
        { label: 'Extension', value: ARCHIVE_DESK.workstation },
        { label: 'Running time', value: '0:31' },
      ],
      timeline: CASE_007_TONIGHT,
      filters: [VOICE_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_007_IDS.comparison,
      kind: 'document',
      title: 'Audio comparison note',
      reference: 'File 007 · Item 1a',
      description: 'A note comparing tonight’s recording with the 1981 reel.',
      unlock: { type: 'discovery', discoveryId: RECORDINGS_MATCH_DISCOVERY },
      document: {
        stamp: 'Audio comparison',
        heading: 'Comparison note — NA-07 recording (tonight) and audio reel (1981)',
        blocks: [
          {
            type: 'paragraph',
            text: 'The two recordings match segment for segment: the announcement, the clock chime, and both voices.',
          },
          { type: 'paragraph', text: 'Tonight’s recording is clearer.' },
        ],
      },
    },
    {
      id: CASE_007_IDS.extensionLog,
      kind: 'document',
      title: 'Extension log',
      reference: 'File 007 · Item 2',
      description: `Calls to extension ${ARCHIVE_DESK.workstation} tonight.`,
      unlock: { type: 'initial' },
      document: {
        stamp: 'Telephone system',
        heading: `Extension log — ${ARCHIVE_DESK.workstation}, tonight`,
        blocks: [
          {
            type: 'table',
            caption: 'Calls',
            columns: ['Time', 'Direction', 'Duration', 'Answered', 'Recorded', 'Origin'],
            rows: [['03:40:00', 'Incoming', '0:31', 'No', 'Yes', 'External, exchange route BW-4']],
          },
        ],
      },
    },
    {
      id: CASE_007_IDS.routing,
      kind: 'document',
      title: 'Exchange routing record',
      reference: 'File 007 · Item 3',
      description: 'The Bellwether exchange record for route BW-4.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Exchange',
        heading: 'Routing record — route BW-4',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Route', value: 'BW-4' },
              { label: 'Origin', value: 'Bellwether Railway Station, kiosk, east platform' },
              { label: 'In service', value: '1974' },
              { label: 'Withdrawn', value: '1983' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_007_IDS.register,
      kind: 'document',
      title: 'Extension register',
      reference: 'File 007 · Item 4',
      description: 'The facility’s register of telephone extensions.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Estates',
        heading: 'Extension register — reading room',
        blocks: [
          {
            type: 'table',
            caption: 'Extensions',
            columns: ['Extension', 'Location', 'Created'],
            rows: [
              ['NA-06', 'Reading room, position 6', '1998'],
              ['NA-07', 'Reading room, position 7', '1998'],
              ['NA-08', 'Reading room, position 8', '1998'],
            ],
          },
          { type: 'paragraph', text: 'No extension numbered NA-07 existed before 1998.' },
        ],
      },
    },
    {
      id: CASE_007_IDS.reel,
      kind: 'audio',
      title: 'Audio reel, 1981',
      reference: 'File 007 · Item 5',
      description: 'A copy of the reel from File 001.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Copy of', value: 'File 001, Item 2' },
        { label: 'Running time', value: '0:50' },
      ],
      timeline: CASE_001_REEL,
      filters: [VOICE_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_007_IDS.post,
      kind: 'document',
      title: 'Night archivist post record',
      reference: 'File 007 · Item 6',
      description: 'The staffing record for the post at your workstation.',
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
    {
      id: CASE_007_IDS.report,
      kind: 'document',
      title: 'Incident report, 1981',
      reference: 'File 007 · Item 7',
      description: 'A copy of the Case 001 incident report, as it now reads.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Official record',
        heading: 'Incident report — Bellwether Railway Station',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Date', value: '14 October 1981' },
              { label: 'Report time', value: '03:40' },
              { label: 'Caller', value: 'Elias Ward (station staff)' },
            ],
          },
          { type: 'annotation', text: 'Report time 03:40: received at extension NA-07.' },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_007_IDS.extensionLog,
      to: CASE_007_IDS.routing,
      relation: 'contradicts',
      reason: 'The log records tonight’s call arriving by route BW-4. The routing record says BW-4 was withdrawn in 1983.',
    },
    {
      from: CASE_007_IDS.extensionLog,
      to: CASE_007_IDS.register,
      relation: 'contradicts',
      reason: 'The call is logged at NA-07, an extension the register says did not exist before 1998. Its 1981 counterpart was received there too.',
    },
    {
      from: CASE_007_IDS.tonight,
      to: CASE_007_IDS.reel,
      relation: 'corroborates',
      reason: 'Tonight’s recording and the 1981 reel have the same segments: announcement, chime, and both voices.',
    },
    {
      from: CASE_007_IDS.comparison,
      to: CASE_007_IDS.tonight,
      relation: 'derived-from',
      reason: 'The comparison note is made from tonight’s recording and the 1981 reel.',
    },
    {
      from: CASE_007_IDS.report,
      to: CASE_007_IDS.extensionLog,
      relation: 'same-subject',
      reason: 'Both records give 03:40 and extension NA-07.',
    },
    {
      from: CASE_007_IDS.post,
      to: CASE_007_IDS.tonight,
      relation: 'same-subject',
      reason: 'The post record concerns the holder of NA-07; tonight’s recording was left for whoever answers NA-07.',
    },
  ],
  questions: CASE_007_QUESTIONS,
};
