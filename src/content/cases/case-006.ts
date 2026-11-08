import { ARCHIVE_DESK } from '../archive';
import { FILE_0091 } from '../anomalies/file-0091';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type CctvFrame } from '../../domain/evidence';
import type { PhotoRegion } from '../../domain/photoView';
import { CASE_006_QUESTIONS } from './case-006-deduction';

/**
 * Case 006 — Someone Is Watching. Canon: docs/cases/case-006-bible.md
 * (approved). Set on the player's current shift. The figure is never
 * identified and its face is never in frame.
 */
export const VIEWPOINT_DISCOVERY = 'c006-viewpoint';

export const CASE_006_IDS = {
  cctv: evidenceId('c006-cctv'),
  still: evidenceId('c006-still'),
  viewpoint: evidenceId('c006-viewpoint-note'),
  photo: evidenceId('c006-photograph'),
  access: evidenceId('c006-access-log'),
  shift: evidenceId('c006-shift-log'),
  camera: evidenceId('c006-camera-record'),
  calls: evidenceId('c006-call-log-extract'),
} as const;

// Regions share the 400×300 layout of the File 0091 photograph.
const WINDOW: PhotoRegion = {
  id: 'window',
  label: 'Window',
  note: 'The window on the left wall, blinds down. Same angle, same height.',
  x: 0.055,
  y: 0.06,
  width: 0.295,
  height: 0.345,
  revealsOnMatch: VIEWPOINT_DISCOVERY,
};
const DOOR = (note: string): PhotoRegion => ({
  id: 'night-entrance',
  label: 'Night entrance',
  note,
  x: 0.62,
  y: 0.18,
  width: 0.11,
  height: 0.39,
});
const TRAY = (note: string): PhotoRegion => ({
  id: 'unfiled-tray',
  label: 'Unfiled tray',
  note,
  x: 0.685,
  y: 0.62,
  width: 0.15,
  height: 0.1,
});
const FIGURE: PhotoRegion = {
  id: 'figure',
  label: 'Figure at position 7',
  note: 'A figure standing at position 7, back to the camera. The face is not visible in this frame.',
  x: 0.665,
  y: 0.27,
  width: 0.175,
  height: 0.71,
};

const empty = 'The reading room. Position 7 is empty.';
const frame = (
  time: string,
  scene: CctvFrame['scene'],
  description: string,
  regions: PhotoRegion[] = [],
): CctvFrame => ({ time, scene, description, regions });

const FRAMES: CctvFrame[] = [
  frame('22:00:00', { door: 'shut', lamp: false }, `${empty} The lamp is off.`),
  frame('22:02:40', { door: 'shut', lamp: true, archivist: true }, 'The night archivist is seated at position 7, back to the camera. The lamp is on.'),
  frame('23:05:10', { door: 'shut', lamp: true }, `${empty} The lamp is on.`),
  frame('23:10:04', { door: 'ajar', lamp: true }, `${empty} The night-entrance door on the far wall stands open.`, [
    DOOR('The night-entrance door stands open. No one is in frame.'),
  ]),
  frame('23:11:30', { door: 'shut', lamp: true }, `${empty} The night-entrance door is shut.`, [
    DOOR('The night-entrance door is shut again.'),
  ]),
  frame('23:15:20', { door: 'shut', lamp: true, archivist: true }, 'The night archivist is seated at position 7.'),
  frame('03:30:15', { door: 'shut', lamp: true }, `${empty} The lamp is on.`),
  frame('03:40:02', { door: 'shut', lamp: true, figure: true }, 'A figure stands at position 7, back to the camera, at the Unfiled tray.', [
    FIGURE,
    TRAY('Something white is being placed in the tray.'),
  ]),
  frame('03:40:31', { door: 'shut', lamp: true }, `${empty} The Unfiled tray holds something white.`, [
    TRAY('Something white lies in the tray.'),
  ]),
  frame('03:50:05', { door: 'shut', lamp: true, archivist: true }, 'The night archivist is seated at position 7.'),
  frame('04:05:00', { door: 'shut', lamp: true, archivist: true }, 'The night archivist is seated at position 7, turned towards the Unfiled tray.'),
  frame('04:10:00', { door: 'shut', lamp: true, archivist: true }, 'The night archivist is seated at position 7.'),
];

export const CASE_006: CaseDefinition = {
  id: caseId('case-006'),
  number: '006',
  title: 'Someone Is Watching',
  location: 'Records facility, Bellwether — tonight',
  accessLevel: 1,
  availableAfter: caseId('case-005'),
  briefing: {
    summary: 'Tonight’s reading-room footage, pulled after File 0091 was found at your desk.',
    assignment: [
      'Security has pulled tonight’s reading-room footage after File 0091 was found at your workstation.',
      'Establish what the records show about the night. Record only what the evidence supports.',
    ],
    reportId: CASE_006_IDS.shift,
  },
  evidence: [
    {
      id: CASE_006_IDS.cctv,
      kind: 'cctv',
      title: 'Camera 2 footage',
      reference: 'File 006 · Item 1',
      description: 'Tonight’s time-lapse footage from reading-room camera 2.',
      unlock: { type: 'initial' },
      artwork: 'reading-room-camera-2',
      frames: FRAMES,
      catalogue: [
        { label: 'Camera', value: 'Reading room, camera 2' },
        { label: 'Recording', value: 'Time-lapse, tonight 22:00 to 04:10' },
        { label: 'Frames', value: String(FRAMES.length) },
      ],
    },
    {
      id: CASE_006_IDS.still,
      kind: 'photo',
      title: 'Camera 2 still, 03:40',
      reference: 'File 006 · Item 2',
      description: 'A single frame exported from camera 2 for inspection.',
      unlock: { type: 'initial' },
      artwork: 'camera-2-still-0340',
      alt: 'Monochrome CCTV still timed 03:40:02: a figure stands at position 7, back to the camera, placing something white in the Unfiled tray. The window is on the left wall.',
      caption: 'Camera 2, 03:40:02. Exported frame.',
      regions: [WINDOW, FIGURE, TRAY('Something white is being placed in the tray.')],
      catalogue: [{ label: 'Exported from', value: 'Camera 2 footage (Item 1), frame 03:40:02' }],
    },
    {
      id: CASE_006_IDS.viewpoint,
      kind: 'document',
      title: 'Viewpoint note',
      reference: 'File 006 · Item 2a',
      description: 'A note comparing the still with the File 0091 photograph.',
      unlock: { type: 'discovery', discoveryId: VIEWPOINT_DISCOVERY },
      document: {
        stamp: 'Security',
        heading: 'Viewpoint note — camera 2 still and File 0091 photograph',
        blocks: [
          {
            type: 'paragraph',
            text: 'The window, the door, the shelf, and the desk at position 7 appear at the same angle and height in both.',
          },
          {
            type: 'paragraph',
            text: 'The File 0091 photograph shares camera 2’s viewpoint: north-east corner, 2.4 m.',
          },
        ],
      },
    },
    {
      id: CASE_006_IDS.photo,
      kind: 'photo',
      title: 'File 0091 photograph',
      reference: 'File 006 · Item 3',
      description: 'A copy of the photograph held in File 0091.',
      unlock: { type: 'initial' },
      artwork: 'workstation-na07',
      alt: FILE_0091.photograph.alt,
      caption: FILE_0091.photograph.caption,
      regions: [WINDOW, ...FILE_0091.photograph.regions],
      catalogue: [{ label: 'Copy of', value: 'File 0091, Item 1' }],
    },
    {
      id: CASE_006_IDS.access,
      kind: 'document',
      title: 'Night-entrance access log',
      reference: 'File 006 · Item 4',
      description: 'Badge entries at the night entrance tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Access control',
        heading: 'Night entrance — badge entries, tonight',
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Time', 'Badge', 'Door'],
            rows: [['22:02', 'Night archivist', 'Night entrance']],
          },
          { type: 'paragraph', text: 'No further entries until 06:00.' },
        ],
      },
    },
    {
      id: CASE_006_IDS.shift,
      kind: 'document',
      title: 'Your shift log',
      reference: 'File 006 · Item 5',
      description: 'The night archivist’s own log for tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Shift log',
        heading: `Shift log — night archivist, Workstation ${ARCHIVE_DESK.workstation}, tonight`,
        blocks: [
          {
            type: 'table',
            caption: 'Entries',
            columns: ['Time', 'Entry'],
            rows: [
              ['22:02', 'On shift.'],
              ['23:05–23:15', 'Retrieval, stack room.'],
              ['03:30–03:50', 'Break, staff room.'],
              ['04:05', 'Item found in Unfiled tray (File 0091). Recorded.'],
            ],
          },
        ],
      },
    },
    {
      id: CASE_006_IDS.camera,
      kind: 'document',
      title: 'Camera installation record',
      reference: 'File 006 · Item 6',
      description: 'Estates record for reading-room camera 2.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Estates',
        heading: 'Camera installation record — reading room, camera 2',
        blocks: [
          {
            type: 'fields',
            fields: [
              { label: 'Mounted', value: 'North-east corner, 2.4 m' },
              { label: 'Installed', value: '1998' },
              { label: 'Covers', value: 'Positions 5–8 and the far wall, including the night entrance' },
            ],
          },
        ],
      },
    },
    {
      id: CASE_006_IDS.calls,
      kind: 'document',
      title: 'Call log extract',
      reference: 'File 006 · Item 7',
      description: 'An extract from the control room call log of November 1986.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Control room',
        heading: 'Call log extract — call 6',
        blocks: [
          {
            type: 'table',
            caption: 'Call 6',
            columns: ['Call', 'Date', 'Time', 'Address reported', 'Result'],
            rows: [['6', '', '23:10', 'Records facility, night entrance', 'Not attended.']],
          },
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_006_IDS.cctv,
      to: CASE_006_IDS.access,
      relation: 'contradicts',
      reason: 'The footage shows the night-entrance door open at 23:10. The access log records no badge entry after 22:02.',
    },
    {
      from: CASE_006_IDS.cctv,
      to: CASE_006_IDS.shift,
      relation: 'corroborates',
      reason: 'The footage shows position 7 without the night archivist during the logged break, 03:30–03:50.',
    },
    {
      from: CASE_006_IDS.still,
      to: CASE_006_IDS.cctv,
      relation: 'derived-from',
      reason: 'The still is exported from the footage, frame 03:40:02.',
    },
    {
      from: CASE_006_IDS.viewpoint,
      to: CASE_006_IDS.still,
      relation: 'derived-from',
      reason: 'The viewpoint note is made by comparing the still with the File 0091 photograph.',
    },
    {
      from: CASE_006_IDS.camera,
      to: CASE_006_IDS.still,
      relation: 'same-subject',
      reason: 'Both records concern reading-room camera 2.',
    },
    {
      from: CASE_006_IDS.calls,
      to: CASE_006_IDS.cctv,
      relation: 'same-subject',
      reason: 'Both records concern the night entrance at 23:10.',
    },
  ],
  questions: CASE_006_QUESTIONS,
};
