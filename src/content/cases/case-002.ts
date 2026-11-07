import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId } from '../../domain/evidence';
import { CASE_002_TAPE } from './case-002-audio';
import { CASE_002_QUESTIONS } from './case-002-deduction';

/**
 * Case 002 — The Empty House. Canon: docs/cases/case-002-bible.md (approved).
 * Records state only what their authors would have written. Nothing names
 * the occupant or the caller, and nothing links "M." to anyone.
 */
export const CALENDAR_DISCOVERY = 'c002-calendar-note';

export const CASE_002_IDS = {
  inspection: evidenceId('c002-inspection-report'),
  welfare: evidenceId('c002-welfare-request'),
  meter: evidenceId('c002-meter-card'),
  kitchen: evidenceId('c002-kitchen-photo'),
  calendar: evidenceId('c002-calendar-enlargement'),
  tape: evidenceId('c002-answerphone'),
  tenancy: evidenceId('c002-tenancy-register'),
} as const;

export const CASE_002: CaseDefinition = {
  id: caseId('case-002'),
  number: '002',
  title: 'The Empty House',
  location: '14 Harrow Lane, Bellwether',
  accessLevel: 1,
  availableAfter: caseId('case-001'),
  briefing: {
    summary: 'A welfare check closed because the house was recorded as empty.',
    assignment: [
      'A welfare check on 14 Harrow Lane was closed after an inspection recorded the house as vacant. The records filed with it have been flagged for review.',
      'Establish whether the inspection’s finding holds. Record only what the evidence supports.',
    ],
    reportId: CASE_002_IDS.inspection,
  },
  evidence: [
    {
      id: CASE_002_IDS.inspection,
      kind: 'document',
      title: 'Inspection report',
      reference: 'File 002 · Item 1',
      description: 'The housing officer’s report that closed the welfare check.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Housing inspection',
        heading: 'Inspection report — 14 Harrow Lane, Bellwether',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Date', value: 'Friday 2 March 1984' },
              { label: 'Time of visit', value: '10:00' },
              { label: 'Officer', value: 'D.R.' },
              { label: 'Purpose', value: 'Welfare check (neighbour’s request)' },
              { label: 'Finding', value: 'Property vacant since November 1982' },
            ],
          },
          { type: 'paragraph', text: 'No occupants found. No signs of occupation.' },
          { type: 'paragraph', text: 'Utilities disconnected. No further action.' },
        ],
      },
    },
    {
      id: CASE_002_IDS.welfare,
      kind: 'document',
      title: 'Welfare check request',
      reference: 'File 002 · Item 2',
      description: 'The neighbour’s letter that asked for the check.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Correspondence',
        heading: 'Request for welfare check — 14 Harrow Lane',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'From', value: 'Mrs J. Pell, 12 Harrow Lane' },
              { label: 'Received', value: 'Monday 20 February 1984' },
            ],
          },
          {
            type: 'paragraph',
            text: 'There have been lights on at number 14 after dark, and a radio playing most nights, since about January.',
          },
          {
            type: 'paragraph',
            text: 'Nobody answers the door. I am worried someone is in there who should not be, or someone who needs help.',
          },
        ],
      },
    },
    {
      id: CASE_002_IDS.meter,
      kind: 'document',
      title: 'Meter record card',
      reference: 'File 002 · Item 3',
      description: 'Electricity board readings for the property.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Electricity board',
        heading: 'Meter record card — 14 Harrow Lane',
        blocks: [
          { type: 'fields', fields: [{ label: 'Supply', value: 'Disconnected, 12 November 1982' }] },
          {
            type: 'table',
            caption: 'Meter readings',
            columns: ['Date', 'Reading', 'Visit'],
            rows: [
              ['12 Nov 1982', '04217', 'Disconnection'],
              ['9 Jan 1984', '04217', 'Routine'],
              ['5 Mar 1984', '04561', 'Routine'],
            ],
          },
          { type: 'annotation', text: 'Reading checked twice.' },
        ],
      },
    },
    {
      id: CASE_002_IDS.kitchen,
      kind: 'photo',
      title: 'Kitchen photograph',
      reference: 'File 002 · Item 4',
      description: 'Photograph taken in the kitchen during the inspection.',
      unlock: { type: 'initial' },
      artwork: 'harrow-lane-kitchen',
      alt: 'Photograph of a kitchen in morning light: a wall calendar headed March 1984, a radio on the counter with its dial lit, and a cup on the table.',
      caption: 'Kitchen, 14 Harrow Lane. Inspection photograph, 2 March 1984.',
      // Fractions of the 400×300 artwork (see KitchenPhoto.tsx).
      regions: [
        {
          id: 'calendar',
          label: 'Wall calendar',
          note: 'A wall calendar, open at March 1984. Something is written in one of the boxes. An enlargement has been made.',
          x: 0.09,
          y: 0.12,
          width: 0.2,
          height: 0.32,
          revealsDiscovery: CALENDAR_DISCOVERY,
        },
        {
          id: 'radio',
          label: 'Radio',
          note: 'A radio on the counter. The dial is lit.',
          x: 0.09,
          y: 0.48,
          width: 0.2,
          height: 0.16,
        },
        {
          id: 'cup',
          label: 'Cup',
          note: 'A cup on the table, with something still in it.',
          x: 0.55,
          y: 0.6,
          width: 0.08,
          height: 0.08,
        },
      ],
      catalogue: [
        { label: 'Taken by', value: 'Inspecting officer, 2 March 1984' },
        { label: 'Print', value: 'Colour, 6 × 4 in' },
      ],
    },
    {
      id: CASE_002_IDS.calendar,
      kind: 'photo',
      title: 'Calendar enlargement',
      reference: 'File 002 · Item 4a',
      description: 'An enlargement of the calendar in the kitchen photograph.',
      unlock: { type: 'discovery', discoveryId: CALENDAR_DISCOVERY },
      artwork: 'harrow-lane-calendar',
      alt: 'Enlargement of a calendar page for March 1984. In the box for Friday 2 March, handwriting in blue ink reads: Inspector, 10:00.',
      caption: 'Enlargement from Item 4. Calendar, March 1984.',
      regions: [
        {
          id: 'note',
          label: 'Note on 2 March',
          note: 'Handwritten in blue ink in the box for Friday 2 March: “Inspector — 10:00”.',
          x: 0.55,
          y: 0.22,
          width: 0.15,
          height: 0.17,
        },
      ],
      catalogue: [
        { label: 'Derived from', value: 'Kitchen photograph (File 002 · Item 4)' },
        { label: 'Processing', value: 'Photographic enlargement' },
      ],
    },
    {
      id: CASE_002_IDS.tape,
      kind: 'audio',
      title: 'Answerphone cassette',
      reference: 'File 002 · Item 5',
      description: 'A cassette recovered from the answerphone in the hall.',
      unlock: { type: 'initial' },
      catalogue: [
        { label: 'Format', value: 'Answerphone microcassette' },
        { label: 'Recovered from', value: 'Hall, 14 Harrow Lane' },
        { label: 'Label', value: 'Handwritten: “1 March”' },
        { label: 'Running time', value: '0:26' },
      ],
      timeline: CASE_002_TAPE,
      filters: [],
      fixedFilters: [],
    },
    {
      id: CASE_002_IDS.tenancy,
      kind: 'document',
      title: 'Tenancy register',
      reference: 'File 002 · Item 6',
      description: 'Council tenancy register extract for Harrow Lane.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Tenancy register',
        heading: 'Tenancy register extract — Harrow Lane, Bellwether',
        blocks: [
          {
            type: 'table',
            caption: 'Tenancies',
            columns: ['No.', 'Tenant', 'From', 'To'],
            rows: [
              ['12', 'J. Pell', 'April 1961', '—'],
              ['14', 'M. Ellery', 'June 1979', 'November 1982'],
              ['16', 'R. & S. Coyle', 'August 1975', '—'],
            ],
          },
          { type: 'paragraph', text: 'Forwarding address for No. 14: not given.' },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_002_IDS.inspection,
      to: CASE_002_IDS.meter,
      relation: 'contradicts',
      reason: 'The report says the utilities were disconnected. The meter card shows electricity used between January and March 1984.',
    },
    {
      from: CASE_002_IDS.inspection,
      to: CASE_002_IDS.kitchen,
      relation: 'contradicts',
      reason: 'The report records no signs of occupation. The photograph taken at the same visit shows a calendar open at March 1984 and a radio switched on.',
    },
    {
      from: CASE_002_IDS.welfare,
      to: CASE_002_IDS.meter,
      relation: 'corroborates',
      reason: 'The neighbour reports lights and a radio since about January. The meter shows electricity used after the January reading.',
    },
    {
      from: CASE_002_IDS.calendar,
      to: CASE_002_IDS.kitchen,
      relation: 'derived-from',
      reason: 'The enlargement is made from the calendar in the kitchen photograph.',
    },
    {
      from: CASE_002_IDS.inspection,
      to: CASE_002_IDS.calendar,
      relation: 'same-subject',
      reason: 'The report records a visit at 10:00 on 2 March. The calendar has “Inspector — 10:00” written on that date.',
    },
    {
      from: CASE_002_IDS.tenancy,
      to: CASE_002_IDS.inspection,
      relation: 'corroborates',
      reason: 'Both records give November 1982 as when the last recorded tenancy ended.',
    },
  ],
  questions: CASE_002_QUESTIONS,
};
