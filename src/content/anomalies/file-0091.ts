import { caseId } from '../../domain/case';
import { TONIGHT, type Anomaly } from '../../domain/anomaly';
import { ARCHIVE_DESK } from '../archive';

/**
 * End anomaly for Case 001 (canon). A photograph of the player's own
 * workstation, dated 14 October 1981; the asset register shows that
 * workstation was installed in 1998. Do not explain this anywhere.
 */
export const FILE_0091: Anomaly = {
  id: 'file-0091',
  title: 'File 0091',
  appearsAfterClosing: caseId('case-001'),
  fields: [
    { label: 'Intake record', value: 'None' },
    { label: 'Filed by', value: 'Not recorded' },
    { label: 'Contents', value: '1 photograph' },
  ],
  photograph: {
    artwork: 'workstation',
    dateStamp: '14 OCT 1981',
    alt: `Photograph of a desk at night: a terminal with a label reading ${ARCHIVE_DESK.workstation}, a keyboard, a desk lamp, and stacked archive boxes. The date imprinted in the corner reads 14 October 1981.`,
    caption: `Workstation ${ARCHIVE_DESK.workstation}, Night Archive reading room.`,
    // Fractions of the 400×300 artwork (see WorkstationPhoto.tsx).
    regions: [
      {
        id: 'asset-label',
        label: 'Asset label',
        note: `A printed label on the terminal reads ${ARCHIVE_DESK.workstation}.`,
        x: 0.355,
        y: 0.505,
        width: 0.12,
        height: 0.06,
      },
      {
        id: 'screen',
        label: 'Terminal screen',
        note: 'The terminal is switched on. The lines on the screen are too small to read.',
        x: 0.345,
        y: 0.245,
        width: 0.27,
        height: 0.27,
      },
      {
        id: 'date-imprint',
        label: 'Date imprint',
        note: 'The camera’s date imprint reads 14 OCT 1981.',
        x: 0.69,
        y: 0.9,
        width: 0.28,
        height: 0.08,
      },
    ],
  },
  register: {
    stamp: 'Asset register',
    heading: 'Asset register — Night Archive reading room',
    fields: [
      { label: 'Asset', value: `Workstation ${ARCHIVE_DESK.workstation}` },
      { label: 'Installed', value: '1998' },
      { label: 'Previous asset at this position', value: 'None recorded' },
    ],
  },
  note: 'No further records are associated with this file.',
};

/**
 * Final beat of Case 007 (approved option A): the cycle turns. A new file,
 * a photograph of the same workstation dated tonight. Never explained.
 */
export const FILE_0093: Anomaly = {
  id: 'file-0093',
  title: 'File 0093',
  appearsAfterClosing: caseId('case-007'),
  fields: [
    { label: 'Intake record', value: 'See ledger' },
    { label: 'Filed by', value: 'M.' },
    { label: 'Contents', value: '1 photograph' },
  ],
  photograph: {
    artwork: 'workstation',
    dateStamp: TONIGHT,
    alt: `Photograph of a desk at night: a terminal with a label reading ${ARCHIVE_DESK.workstation}, a keyboard, a desk lamp, and stacked archive boxes. The date imprinted in the corner reads {date}.`,
    caption: `Workstation ${ARCHIVE_DESK.workstation}, Night Archive reading room.`,
    regions: FILE_0091.photograph.regions.map((r) =>
      r.id === 'date-imprint' ? { ...r, note: 'The camera’s date imprint reads {date}.' } : r,
    ),
  },
  register: {
    stamp: 'Intake ledger',
    heading: 'Intake ledger — tonight',
    fields: [
      { label: 'Number', value: '0093' },
      { label: 'Issued', value: '03:40' },
      { label: 'Filed by', value: 'M.' },
    ],
  },
  note: 'No further records are associated with this file.',
};

export const ANOMALIES: readonly Anomaly[] = [FILE_0091, FILE_0093];

export function findAnomaly(id: string): Anomaly | undefined {
  return ANOMALIES.find((a) => a.id === id);
}
