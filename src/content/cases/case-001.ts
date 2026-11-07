import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import {
  CASE_001_FILTERED_CLIP,
  CASE_001_REEL,
  SECOND_VOICE_DISCOVERY,
  VOICE_ISOLATION,
} from './case-001-audio';
import { CASE_001_QUESTIONS } from './case-001-deduction';

/**
 * Case 001 — The Missing Recording. Canon lives in CLAUDE.md.
 *
 * Content rules: records state only what their authors would have written.
 * Nothing here names the caller, explains the recording, or connects the
 * records for the player. Contradictions are left for the player to find.
 * The filtered segment unlocks only after the player reveals the second
 * voice with the voice isolation filter.
 */
export const CASE_001_IDS = {
  report: evidenceId('c001-incident-report'),
  audioReel: evidenceId('c001-audio-reel'),
  filteredSegment: evidenceId('c001-filtered-segment'),
  timetable: evidenceId('c001-timetable'),
  maintenance: evidenceId('c001-maintenance-record'),
  roster: evidenceId('c001-duty-roster'),
} as const;

export const CASE_001: CaseDefinition = {
  id: caseId('case-001'),
  number: '001',
  title: 'The Missing Recording',
  location: 'Bellwether Railway Station',
  accessLevel: 1,
  briefing: {
    summary:
      'A night call from Bellwether Railway Station, closed without action. A recording was logged against the report.',
    assignment: [
      'This report has been flagged for review. An audio reel and supporting station records were filed alongside it.',
      'Establish whether the report is complete and accurate. Record only what the evidence supports.',
    ],
    reportId: CASE_001_IDS.report,
  },
  evidence: [
    {
      id: CASE_001_IDS.report,
      kind: 'document',
      title: 'Incident report',
      reference: 'File 001 · Item 1',
      description: 'The official report of the call, as filed.',
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
              { label: 'Location', value: 'Bellwether Railway Station' },
              { label: 'Caller', value: 'Elias Ward (station staff)' },
              { label: 'Outcome', value: 'No incident confirmed' },
            ],
          },
          { type: 'paragraph', text: 'Caller reported unusual activity near the east platform.' },
          {
            type: 'paragraph',
            text: 'Area was checked. No incident confirmed. No further action recorded.',
          },
        ],
      },
      // Approved end beat of Case 002: the file changes. Never explained.
      amendments: [
        {
          id: 'filed-m',
          whenCaseClosed: caseId('case-002'),
          block: { type: 'annotation', text: 'Filed. — M.' },
        },
      ],
    },
    {
      id: CASE_001_IDS.audioReel,
      kind: 'audio',
      title: 'Audio reel',
      reference: 'File 001 · Item 2',
      description: 'A reel filed alongside the incident report. No transcript on file.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Format', value: 'Quarter-inch tape reel' },
        { label: 'Source', value: 'Station announcement system, Bellwether' },
        { label: 'Filed with', value: 'Incident report, 14 October 1981' },
        { label: 'Running time', value: '0:50' },
        { label: 'Transcript', value: 'None on file' },
      ],
      timeline: CASE_001_REEL,
      filters: [VOICE_ISOLATION],
      fixedFilters: [],
    },
    {
      id: CASE_001_IDS.filteredSegment,
      kind: 'audio',
      title: 'Filtered segment',
      reference: 'File 001 · Item 2a',
      description: 'A section of the audio reel, isolated with the voice filter.',
      unlock: { type: 'discovery', discoveryId: SECOND_VOICE_DISCOVERY },
      catalogue: [
        { label: 'Derived from', value: 'Audio reel (File 001 · Item 2), 0:30–0:46' },
        { label: 'Processing', value: 'Voice isolation filter' },
        { label: 'Running time', value: '0:16' },
      ],
      timeline: CASE_001_FILTERED_CLIP,
      filters: [VOICE_ISOLATION],
      fixedFilters: [VOICE_ISOLATION.id],
    },
    {
      id: CASE_001_IDS.timetable,
      kind: 'document',
      title: 'Night timetable',
      reference: 'File 001 · Item 3',
      description: 'Departures from Bellwether for the night of the report.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Station timetable',
        heading: 'Bellwether — night departures, Wednesday 14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Departures after 23:00',
            columns: ['Departs', 'Service', 'Platform', 'Status'],
            rows: [
              ['23:05', 'Stopping service to Carrow Junction', '1', 'Ran'],
              ['00:20', 'Stopping service to Carrow Junction', '1', 'Ran'],
              ['01:15', 'Mail service', '2', 'Ran'],
              ['02:10', 'Last service to Carrow Junction', '1', 'Cancelled'],
            ],
          },
          { type: 'annotation', text: '02:10 cancelled. No replacement service.' },
        ],
      },
    },
    {
      id: CASE_001_IDS.maintenance,
      kind: 'document',
      title: 'Maintenance record',
      reference: 'File 001 · Item 4',
      description: 'Works register entry for the east platform.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Works register',
        heading: 'Works register — Bellwether Railway Station, east platform',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Asset', value: 'East platform access door' },
              { label: 'Work', value: 'Door sealed. Frame welded and boarded.' },
              { label: 'Completed', value: '1979 (day and month illegible)' },
              { label: 'Status', value: 'Sealed' },
            ],
          },
          {
            type: 'paragraph',
            text: 'Door not to be reopened without written authority from the district engineer.',
          },
        ],
      },
    },
    {
      id: CASE_001_IDS.roster,
      kind: 'document',
      title: 'Duty roster',
      reference: 'File 001 · Item 5',
      description: 'Staff rostered at Bellwether for the night shift.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Duty roster',
        heading: 'Night duty roster — Bellwether Railway Station, 13–14 October 1981',
        blocks: [
          {
            type: 'table',
            caption: 'Rostered staff',
            columns: ['Name', 'Role', 'Shift'],
            rows: [
              ['R. Hale', 'Station supervisor', '22:00–06:00'],
              ['D. Okafor', 'Porter', '22:00–06:00'],
              ['T. Brennan', 'Signal box', '22:00–06:00'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Only the staff listed above were rostered at this station for the night shift.',
          },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_001_IDS.report,
      to: CASE_001_IDS.roster,
      relation: 'contradicts',
      reason:
        'The report names Elias Ward, station staff, as the caller. The night roster for Bellwether does not list him.',
    },
    {
      from: CASE_001_IDS.report,
      to: CASE_001_IDS.audioReel,
      relation: 'omits',
      reason:
        'The reel was filed with the report, but the report does not mention anything heard on it, including the words about the east door.',
    },
    {
      from: CASE_001_IDS.report,
      to: CASE_001_IDS.filteredSegment,
      relation: 'omits',
      reason: 'The second voice on the reel is not mentioned anywhere in the report.',
    },
    {
      from: CASE_001_IDS.audioReel,
      to: CASE_001_IDS.timetable,
      relation: 'corroborates',
      reason:
        'The announcement on the reel and the timetable both record the 02:10 service as cancelled.',
    },
    {
      from: CASE_001_IDS.audioReel,
      to: CASE_001_IDS.maintenance,
      relation: 'same-subject',
      reason:
        'The voice on the reel refers to the east door. The works register records that door as sealed since 1979.',
    },
    {
      from: CASE_001_IDS.filteredSegment,
      to: CASE_001_IDS.audioReel,
      relation: 'derived-from',
      reason: 'The filtered segment is a processed copy of 0:30–0:46 of the reel.',
    },
  ],
  questions: CASE_001_QUESTIONS,
};
