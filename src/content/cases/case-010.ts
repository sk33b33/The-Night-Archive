import { ARCHIVE_DESK } from '../archive';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type CctvFrame, type PhotoEvidence, type PlanEntry } from '../../domain/evidence';
import type { PhotoRegion } from '../../domain/photoView';
import { CASE_010_QUESTIONS } from './case-010-deduction';
import { glyphRegions, HAND_SAMPLES, HANDOVER_DISCOVERY } from './case-009-hands';

/**
 * Case 010 — The Handover (Season 2). Canon: docs/cases/case-010-bible.md
 * (approved; end beat A). The plan shows only what records say.
 */
export const CASE_010_IDS = {
  plan: evidenceId('c010-floor-plan'),
  doorLog: evidenceId('c010-door-log'),
  shift: evidenceId('c010-shift-log'),
  handover: evidenceId('c010-handover-log'),
  cctv: evidenceId('c010-cctv'),
  ledger: evidenceId('c010-intake-ledger'),
  handoverM: evidenceId('c010-handover-m'),
  slip: evidenceId('c010-slip-copy'),
  comparison: evidenceId('c010-handover-note'),
} as const;

const R = {
  reading: { id: 'reading-room', label: 'Reading room', points: '20,20 220,20 220,170 20,170', labelAt: { x: 68, y: 96 } },
  stack: { id: 'stack-room', label: 'Stack room', points: '230,20 380,20 380,120 230,120' },
  staff: { id: 'staff-room', label: 'Staff room', points: '230,130 380,130 380,200 230,200' },
  night: { id: 'night-entrance', label: 'Night entrance', points: '20,180 122,180 122,280 20,280' },
  main: { id: 'main-entrance', label: 'Main entrance', points: '132,180 220,180 220,280 132,280' },
  security: { id: 'security', label: 'Security', points: '230,210 380,210 380,280 230,280' },
} as const;

const e = (room: string, text: string, source: PlanEntry['source']): PlanEntry => ({ room, text, source });
const shiftEntry = e(R.stack.id, 'Your shift log: “05:50–06:04 Returns, stack room.”', CASE_010_IDS.shift);

const seatedRegion: PhotoRegion = {
  id: 'seated',
  label: 'Seated figure',
  note: 'A figure seated at position 7, back to the camera. The face is not visible.',
  x: 0.37,
  y: 0.5,
  width: 0.24,
  height: 0.5,
};
const nashRegion: PhotoRegion = {
  id: 'day-archivist',
  label: 'Day archivist',
  note: 'The day archivist, standing at the left of the desk.',
  x: 0.13,
  y: 0.32,
  width: 0.17,
  height: 0.67,
};

const frame = (time: string, scene: CctvFrame['scene'], description: string, regions: PhotoRegion[] = []): CctvFrame => ({
  time,
  scene,
  description,
  regions,
});

const handSample = (
  key: 'handover' | 'slip',
  id: PhotoEvidence['id'],
  title: string,
  reference: string,
  description: string,
  alt: string,
  source: string,
): PhotoEvidence => ({
  id,
  kind: 'photo',
  title,
  reference,
  description,
  unlock: { type: 'initial' },
  artwork: `hand-${key}`,
  alt,
  caption: source,
  regions: glyphRegions(HAND_SAMPLES[key]),
  catalogue: [{ label: 'Source', value: source }],
});

export const CASE_010: CaseDefinition = {
  id: caseId('case-010'),
  number: '010',
  title: 'The Handover',
  location: 'Records facility, Bellwether — tonight, 06:00',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-009'),
  briefing: {
    summary: 'A handover at your desk at 06:00, while your badge was in the stack room.',
    assignment: [
      'The day archivist’s handover log records receiving the desk from the night archivist at position 7 at 06:00.',
      'Establish where the records place the night archivist at 06:00, and what happened at position 7. Record only what the evidence supports.',
    ],
    reportId: CASE_010_IDS.handover,
  },
  evidence: [
    {
      id: CASE_010_IDS.plan,
      kind: 'plan',
      title: 'Floor plan, first floor',
      reference: 'File 0094 · Item 1',
      description: 'What the records say about each room, from 05:50 to 06:05.',
      unlock: { type: 'initial' },
      rooms: Object.values(R),
      steps: [
        {
          time: '05:50',
          entries: [e(R.stack.id, 'Door log: night archivist badge in.', CASE_010_IDS.doorLog), shiftEntry],
        },
        {
          time: '05:58',
          entries: [e(R.main.id, 'Door log: day archivist badge at the main entrance.', CASE_010_IDS.doorLog), shiftEntry],
        },
        {
          time: '05:59',
          entries: [
            e(R.reading.id, 'Door log: day archivist badge into the reading room.', CASE_010_IDS.doorLog),
            e(R.reading.id, 'Camera 2: the day archivist enters.', CASE_010_IDS.cctv),
            shiftEntry,
          ],
        },
        {
          time: '06:00',
          entries: [
            e(R.reading.id, 'Camera 2: someone seated at position 7, back to camera, with the day archivist.', CASE_010_IDS.cctv),
            e(R.reading.id, 'Handover log: “Received from night archivist at position 7.”', CASE_010_IDS.handover),
            shiftEntry,
          ],
        },
        {
          time: '06:04',
          entries: [
            e(R.stack.id, 'Door log: night archivist badge out.', CASE_010_IDS.doorLog),
            e(R.reading.id, 'Camera 2: the day archivist alone at position 7.', CASE_010_IDS.cctv),
            shiftEntry,
          ],
        },
        {
          time: '06:05',
          entries: [
            e(R.reading.id, 'Your shift log: “Handover: day archivist already at desk.”', CASE_010_IDS.shift),
            e(R.reading.id, 'Camera 2: the night archivist returns to position 7.', CASE_010_IDS.cctv),
          ],
        },
      ],
      // Approved end beat A: a room not on the current plan appears. No record shown.
      amendments: [
        {
          id: 'storage-b',
          whenCaseClosed: caseId('case-010'),
          appendStep: {
            time: '06:00',
            label: '06:00 · Storage B',
            entries: [],
            extraRooms: [{ id: 'storage-b', label: 'Storage B', points: '120,30 214,30 214,162 120,162', sealed: true }],
          },
        },
      ],
      catalogue: [
        { label: 'Floor', value: 'First floor' },
        { label: 'Rule', value: 'Shows only what a named record says about a room' },
      ],
    },
    {
      id: CASE_010_IDS.doorLog,
      kind: 'document',
      title: 'Door and badge log',
      reference: 'File 0094 · Item 2',
      description: 'Badge readers and door sensors, 05:45 to 06:10.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Access control',
        heading: 'Door and badge log — first floor, tonight 05:45–06:10',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Time', 'Badge', 'Door', 'Direction'],
            rows: [
              ['05:50', 'Night archivist', 'Stack room', 'In'],
              ['05:58', 'Day archivist', 'Main entrance', 'In'],
              ['05:59', 'Day archivist', 'Reading room', 'In'],
              ['06:04', 'Night archivist', 'Stack room', 'Out'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_010_IDS.shift,
      kind: 'document',
      title: 'Your shift log (end)',
      reference: 'File 0094 · Item 3',
      description: 'The last entries in your log tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Shift log',
        heading: `Shift log — night archivist, Workstation ${ARCHIVE_DESK.workstation}, tonight (end)`,
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Time', 'Entry'],
            rows: [
              ['05:50–06:04', 'Returns, stack room.'],
              ['06:05', 'Handover: day archivist already at desk.'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_010_IDS.handover,
      kind: 'document',
      title: 'Handover log',
      reference: 'File 0094 · Item 4',
      description: 'The day archivist’s record of taking over the desk.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Handover',
        heading: `Handover log — Workstation ${ARCHIVE_DESK.workstation}, 06:00`,
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Time', value: '06:00' },
              { label: 'Received from', value: 'Night archivist, at position 7' },
              { label: 'Desk', value: 'Clear' },
              { label: 'Filed tonight', value: '0094' },
              { label: 'Day archivist', value: 'P. Nash' },
            ],
          },
          { type: 'annotation', text: 'Night archivist: M.' },
        ],
      },
    },
    {
      id: CASE_010_IDS.cctv,
      kind: 'cctv',
      title: 'Camera 2 footage, 06:00',
      reference: 'File 0094 · Item 5',
      description: 'Camera 2 footage from 05:55 to 06:06.',
      unlock: { type: 'initial' },
      artwork: 'reading-room-camera-2',
      frames: [
        frame('05:55:00', { lamp: true }, 'Position 7 is empty. The lamp is on.'),
        frame('05:59:20', { lamp: true, dayArchivist: true }, 'The day archivist enters and stands at the left of the desk.', [nashRegion]),
        frame('06:00:10', { lamp: true, dayArchivist: true, seatedFigure: true }, 'Someone is seated at position 7, back to the camera, with the day archivist beside them.', [seatedRegion, nashRegion]),
        frame('06:02:00', { lamp: true, dayArchivist: true }, 'The seat at position 7 is empty. The day archivist stands beside it.'),
        frame('06:05:00', { lamp: true, dayArchivist: true, archivist: true }, 'The night archivist returns to position 7. The day archivist is beside the desk.'),
        frame('06:06:00', { lamp: true, dayArchivist: true, archivist: true }, 'The night archivist and the day archivist at position 7.'),
      ],
      catalogue: [
        { label: 'Camera', value: 'Reading room, camera 2' },
        { label: 'Recording', value: 'Time-lapse, tonight 05:55 to 06:06' },
      ],
    },
    {
      id: CASE_010_IDS.ledger,
      kind: 'document',
      title: 'Intake ledger, tonight',
      reference: 'File 0094 · Item 6',
      description: 'Intake numbers issued tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake ledger',
        heading: 'Intake ledger — Records facility, tonight',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['No.', 'Time', 'Description', 'Filed by'],
            rows: [
              ['0093', '03:40', 'Photograph', 'M.'],
              ['0094', '06:00', 'Photograph', 'M.'],
            ],
          },
        ],
      },
    },
    handSample('handover', CASE_010_IDS.handoverM, 'Handover log: “M.”', 'File 0094 · Item 7', 'Enlargement of the handwritten “M.” in the handover log.',
      'The handover log at 06:00, with “Night archivist: M.” handwritten in blue ink.', 'From the handover log, 06:00 tonight.'),
    handSample('slip', CASE_010_IDS.slip, 'The 0094 intake slip (copy)', 'File 0094 · Item 8', 'A copy of the slip from the envelope.',
      'A handwritten intake slip in blue ink. Number 0094, time 06:00, description Photograph, filed by M.', 'Intake slip, from the envelope delivered tonight (copy).'),
    {
      id: CASE_010_IDS.comparison,
      kind: 'document',
      title: 'Handover comparison note',
      reference: 'File 0094 · Item 7a',
      description: 'A comparison of the handover “M.” with the slip.',
      unlock: { type: 'discovery', discoveryId: HANDOVER_DISCOVERY },
      document: {
        stamp: 'Examiner',
        heading: 'Comparison note — handover log “M.”',
        blocks: [
          { type: 'paragraph', text: 'The crossed capital M in the handover log is consistent with the slip numbered 0094 and with the 1979 specimen signature.' },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_010_IDS.doorLog,
      to: CASE_010_IDS.handover,
      relation: 'contradicts',
      reason: 'The handover log has the night archivist at position 7 at 06:00. The badge log has them in the stack room from 05:50 to 06:04.',
    },
    {
      from: CASE_010_IDS.doorLog,
      to: CASE_010_IDS.shift,
      relation: 'corroborates',
      reason: 'Both records put the night archivist in the stack room from 05:50 to 06:04.',
    },
    {
      from: CASE_010_IDS.cctv,
      to: CASE_010_IDS.handover,
      relation: 'corroborates',
      reason: 'The footage shows a handover at position 7 at 06:00, as the log records — though not who handed over.',
    },
    {
      from: CASE_010_IDS.handoverM,
      to: CASE_010_IDS.slip,
      relation: 'corroborates',
      reason: 'Both carry the same crossed capital M.',
    },
    {
      from: CASE_010_IDS.ledger,
      to: CASE_010_IDS.handover,
      relation: 'same-subject',
      reason: 'Both records give 0094 as filed tonight, at 06:00.',
    },
    {
      from: CASE_010_IDS.comparison,
      to: CASE_010_IDS.handoverM,
      relation: 'derived-from',
      reason: 'The note is made by comparing the handover “M.” with the slip.',
    },
  ],
  questions: CASE_010_QUESTIONS,
};
