import { ARCHIVE_DESK } from '../archive';
import { FILE_0093, FILE_0093_REGIONS } from '../anomalies/file-0091';
import { caseId, type CaseDefinition } from '../../domain/case';
import { evidenceId, type CctvFrame } from '../../domain/evidence';
import type { PhotoRegion } from '../../domain/photoView';
import { CASE_008_QUESTIONS } from './case-008-deduction';

/**
 * Case 008 — The Next Number (Season 2). Canon: docs/cases/case-008-bible.md
 * (approved). File 0093, filed at 03:40, shows the desk as recorded at 05:12.
 * The envelope stays sealed. Nothing explains the match.
 */
export const TIMING_DISCOVERY = 'c008-timing';

export const CASE_008_IDS = {
  photo: evidenceId('c008-photograph'),
  still: evidenceId('c008-still-0512'),
  timing: evidenceId('c008-timing-note'),
  cctv: evidenceId('c008-cctv'),
  ledger: evidenceId('c008-intake-ledger'),
  post: evidenceId('c008-post-log'),
  lamp: evidenceId('c008-lamp-log'),
  envelope: evidenceId('c008-envelope'),
  shift: evidenceId('c008-shift-log'),
} as const;

/** The wall clock is matched between the photograph and the 05:12 still. */
const withMatch = (regions: readonly PhotoRegion[]): PhotoRegion[] =>
  regions.map((r) => {
    if (r.id === 'wall-clock') return { ...r, revealsOnMatch: TIMING_DISCOVERY };
    if (r.id === 'date-imprint') return { ...r, note: 'The camera’s date imprint reads tonight’s date.' };
    return r;
  });

const STILL_REGIONS: PhotoRegion[] = withMatch(FILE_0093_REGIONS).filter((r) => r.id !== 'date-imprint');

const PORTER: PhotoRegion = {
  id: 'porter',
  label: 'Night porter',
  note: 'The night porter at the left of the desk, back to the camera, leaving an envelope.',
  x: 0.13,
  y: 0.33,
  width: 0.17,
  height: 0.66,
};
const LAMP_OFF: PhotoRegion = {
  id: 'lamp',
  label: 'Desk lamp',
  note: 'The desk lamp goes off. No one is at the desk.',
  x: 0.74,
  y: 0.33,
  width: 0.16,
  height: 0.36,
};

const frame = (
  time: string,
  scene: CctvFrame['scene'],
  description: string,
  regions: PhotoRegion[] = [],
): CctvFrame => ({ time, scene, description, regions });

const FRAMES: CctvFrame[] = [
  frame('04:10:00', { lamp: true, archivist: true }, 'The night archivist is seated at position 7. The lamp is on.'),
  frame('04:40:00', { lamp: true, archivist: true }, 'The night archivist is seated at position 7.'),
  frame('05:00:30', { lamp: true }, 'Position 7 is empty. The lamp is on.'),
  frame('05:08:10', { lamp: false }, 'Position 7 is empty. The lamp has gone off.', [LAMP_OFF]),
  frame('05:10:20', { lamp: false, porter: true, envelope: true }, 'The night porter stands at the left of the desk, leaving an envelope.', [PORTER]),
  frame('05:11:00', { lamp: false, envelope: true }, 'Position 7 is empty. An envelope lies on the desk. The lamp is off.'),
  frame('05:12:00', { lamp: false, envelope: true }, 'Position 7 is empty. An envelope lies on the desk. The lamp is off. The wall clock reads 05:12.', STILL_REGIONS),
  frame('05:15:30', { lamp: false, envelope: true, archivist: true }, 'The night archivist is seated at position 7, beside the envelope.'),
  frame('05:19:10', { lamp: true, envelope: true, archivist: true }, 'The night archivist is seated. The lamp is on again.'),
  frame('05:20:00', { lamp: true, envelope: true, archivist: true }, 'The night archivist is seated at position 7.'),
];

const SHEET = (rows: string[][], caption: string, columns: string[]) =>
  ({ type: 'table', caption, columns, rows }) as const;

export const CASE_008: CaseDefinition = {
  id: caseId('case-008'),
  number: '008',
  title: 'The Next Number',
  location: 'Records facility, Bellwether — tonight, before dawn',
  accessLevel: 1,
  season: 2,
  availableAfter: caseId('case-007'),
  // Not replacesAnomaly: Case 008 becomes available the moment Case 007
  // closes, so taking over File 0093 would hide Case 007's final beat.
  // The Unfiled card stays; this case investigates it.
  briefing: {
    summary: 'File 0093 was filed at 03:40. Its photograph shows something later.',
    assignment: [
      'File 0093 was filed at 03:40 tonight. Its photograph has been flagged.',
      'Establish what the photograph shows, and when that matches the records. Record only what the evidence supports.',
    ],
    reportId: CASE_008_IDS.ledger,
  },
  evidence: [
    {
      id: CASE_008_IDS.photo,
      kind: 'photo',
      title: 'File 0093 photograph',
      reference: 'File 0093 · Item 1',
      description: 'The photograph held in File 0093.',
      unlock: { type: 'initial' },
      artwork: 'workstation-0093',
      alt: FILE_0093.photograph.alt.split('{date}').join('tonight’s date'),
      caption: FILE_0093.photograph.caption,
      regions: withMatch(FILE_0093_REGIONS),
      catalogue: [
        { label: 'Filed', value: 'Tonight, 03:40' },
        { label: 'Date imprint', value: 'Tonight' },
      ],
    },
    {
      id: CASE_008_IDS.still,
      kind: 'photo',
      title: 'Camera 2 still, 05:12',
      reference: 'File 0093 · Item 2',
      description: 'A frame exported from camera 2 at 05:12.',
      unlock: { type: 'initial' },
      artwork: 'camera-2-still-0512',
      alt: 'Monochrome CCTV still timed 05:12:00: position 7 is empty, the lamp is off, a sealed envelope lies on the desk, and the wall clock reads 05:12.',
      caption: 'Camera 2, 05:12:00. Exported frame.',
      regions: STILL_REGIONS,
      catalogue: [{ label: 'Exported from', value: 'Camera 2 footage, 04:10–05:20, frame 05:12:00' }],
    },
    {
      id: CASE_008_IDS.timing,
      kind: 'document',
      title: 'Timing note',
      reference: 'File 0093 · Item 2a',
      description: 'A note comparing the photograph with the 05:12 still.',
      unlock: { type: 'discovery', discoveryId: TIMING_DISCOVERY },
      document: {
        stamp: 'Security',
        heading: 'Timing note — File 0093 photograph and camera 2 at 05:12',
        blocks: [
          {
            type: 'paragraph',
            text: 'The File 0093 photograph matches camera 2 at 05:12: the lamp off, the envelope on the desk, the clock at 05:12.',
          },
          { type: 'paragraph', text: 'File 0093 was filed at 03:40.' },
        ],
      },
    },
    {
      id: CASE_008_IDS.cctv,
      kind: 'cctv',
      title: 'Camera 2 footage, before dawn',
      reference: 'File 0093 · Item 3',
      description: 'Camera 2 footage from 04:10 to 05:20.',
      unlock: { type: 'initial' },
      artwork: 'reading-room-camera-2',
      frames: FRAMES,
      catalogue: [
        { label: 'Camera', value: 'Reading room, camera 2' },
        { label: 'Recording', value: 'Time-lapse, tonight 04:10 to 05:20' },
        { label: 'Frames', value: String(FRAMES.length) },
      ],
    },
    {
      id: CASE_008_IDS.ledger,
      kind: 'document',
      title: 'Intake ledger, tonight',
      reference: 'File 0093 · Item 4',
      description: 'Intake numbers issued tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Intake ledger',
        heading: 'Intake ledger — Records facility, tonight',
        blocks: [
          SHEET(
            [
              ['0093', '03:40', 'Photograph', 'M.'],
              ['0094', '', 'Reserved', ''],
            ],
            'Entries',
            ['No.', 'Time', 'Description', 'Filed by'],
          ),
        ],
      },
      // Approved end beat A: 0094's time fills in. Never explained.
      amendments: [
        {
          id: 'time-0094',
          whenCaseClosed: caseId('case-008'),
          setCell: { blockIndex: 0, row: 1, column: 1, value: '06:00' },
        },
      ],
    },
    {
      id: CASE_008_IDS.post,
      kind: 'document',
      title: 'Internal post log',
      reference: 'File 0093 · Item 5',
      description: 'Internal mail delivered tonight.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Internal post',
        heading: 'Internal post log — tonight',
        blocks: [
          SHEET(
            [['05:10', '1 envelope, sealed', `Night archivist, ${ARCHIVE_DESK.workstation}`, 'Night porter (J.T.)', 'Not recorded']],
            'Deliveries',
            ['Time', 'Item', 'To', 'Courier', 'Sender'],
          ),
        ],
      },
    },
    {
      id: CASE_008_IDS.lamp,
      kind: 'document',
      title: 'Lamp circuit log',
      reference: 'File 0093 · Item 6',
      description: 'The reading-room lighting log for position 7.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Building services',
        heading: 'Lighting circuit log — reading room, circuit 7 (desk lamp)',
        blocks: [
          SHEET(
            [
              ['22:01', 'On'],
              ['05:08', 'Off'],
              ['05:19', 'On'],
            ],
            'Switching',
            ['Time', 'State'],
          ),
        ],
      },
    },
    {
      id: CASE_008_IDS.envelope,
      kind: 'object',
      title: 'The envelope',
      reference: 'File 0093 · Item 7',
      description: 'The internal-mail envelope delivered to your desk.',
      unlock: { type: 'initial' },
      details: [
        { label: 'Item', value: 'Internal-mail envelope' },
        { label: 'Addressed', value: `Night archivist, ${ARCHIVE_DESK.workstation}` },
        { label: 'Seal', value: 'Unbroken' },
      ],
      provenance: [
        { date: 'Tonight, 05:10', holder: 'Night porter (J.T.)', location: 'Position 7, reading room', action: 'Delivered' },
        {
          date: 'Tonight, 05:15',
          holder: `Night archivist (Workstation ${ARCHIVE_DESK.workstation})`,
          location: 'Position 7, reading room',
          action: 'Received. Not opened.',
        },
      ],
      linked: [CASE_008_IDS.post, CASE_008_IDS.shift],
    },
    {
      id: CASE_008_IDS.shift,
      kind: 'document',
      title: 'Your shift log (continued)',
      reference: 'File 0093 · Item 8',
      description: 'Your own log, from 04:05.',
      unlock: { type: 'initial' },
      document: {
        stamp: 'Shift log',
        heading: `Shift log — night archivist, Workstation ${ARCHIVE_DESK.workstation}, tonight (continued)`,
        blocks: [
          SHEET(
            [
              ['04:05', 'Item found in Unfiled tray (File 0091). Recorded.'],
              ['05:00–05:14', 'Retrieval, stack room.'],
              ['05:15', 'Envelope received. Not opened.'],
            ],
            'Entries',
            ['Time', 'Entry'],
          ),
        ],
      },
    },
  ],
  boardRules: [
    {
      from: CASE_008_IDS.ledger,
      to: CASE_008_IDS.photo,
      relation: 'contradicts',
      reason: 'File 0093 was filed at 03:40. Its photograph shows the desk as it was recorded at 05:12.',
    },
    {
      from: CASE_008_IDS.cctv,
      to: CASE_008_IDS.photo,
      relation: 'corroborates',
      reason: 'At 05:12 the footage shows what the photograph shows: lamp off, envelope on the desk, clock at 05:12.',
    },
    {
      from: CASE_008_IDS.lamp,
      to: CASE_008_IDS.cctv,
      relation: 'corroborates',
      reason: 'The lamp circuit goes off at 05:08 in the log, and the lamp is off in the footage from 05:08.',
    },
    {
      from: CASE_008_IDS.post,
      to: CASE_008_IDS.envelope,
      relation: 'corroborates',
      reason: 'Both records give 05:10 for the envelope’s delivery to NA-07.',
    },
    {
      from: CASE_008_IDS.timing,
      to: CASE_008_IDS.photo,
      relation: 'derived-from',
      reason: 'The timing note is made by comparing the photograph with the 05:12 still.',
    },
    {
      from: CASE_008_IDS.shift,
      to: CASE_008_IDS.envelope,
      relation: 'same-subject',
      reason: 'Both records give 05:15: the envelope received, not opened.',
    },
  ],
  questions: CASE_008_QUESTIONS,
};
