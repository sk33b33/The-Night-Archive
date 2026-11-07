import { caseId, type CaseDefinition } from '../../domain/case';

/**
 * Case 001 — The Missing Recording. Canon lives in CLAUDE.md.
 *
 * The briefing reproduces only what the official report claims. It must not
 * hint at who the caller was or resolve anything the evidence later contests.
 */
export const CASE_001: CaseDefinition = {
  id: caseId('case-001'),
  number: '001',
  title: 'The Missing Recording',
  location: 'Bellwether Railway Station',
  accessLevel: 1,
  briefing: {
    summary:
      'A night call from Bellwether Railway Station, closed without action. A recording was logged against the report.',
    report: {
      heading: 'Incident report — Bellwether Railway Station',
      fields: [
        { label: 'Date', value: '14 October 1981' },
        { label: 'Report time', value: '03:40' },
        { label: 'Location', value: 'Bellwether Railway Station' },
        { label: 'Caller', value: 'Elias Ward' },
        { label: 'Outcome', value: 'No incident confirmed' },
      ],
      body: [
        'Caller reported unusual activity near the east platform.',
        'Area was checked. No incident confirmed. No further action recorded.',
      ],
    },
    assignment: [
      'This report has been flagged for review. An audio reel and supporting station records were filed alongside it.',
      'Establish whether the report is complete and accurate. Record only what the evidence supports.',
    ],
  },
};
