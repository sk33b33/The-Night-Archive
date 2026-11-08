import type { ReactElement } from 'react';
import { WorkstationPhoto } from '../../../anomaly/WorkstationPhoto';
import { imprintDate } from '../../../../domain/anomaly';
import { CctvReadingRoom } from '../../cctv/CctvReadingRoom';
import { CalendarEnlargement } from './CalendarEnlargement';
import { DeskPapers } from './DeskPapers';
import { HandwritingSample } from './HandwritingSample';
import { HAND_SAMPLES, type HandSampleKey } from '../../../../content/cases/case-009-hands';
import { KitchenPhoto } from './KitchenPhoto';

/**
 * Photograph artwork by content key. Evidence content names a key; the
 * drawing lives here so case data stays free of presentation code.
 */
export const PHOTO_ARTWORK: Readonly<Record<string, (props: { readonly alt: string }) => ReactElement>> = {
  'harrow-lane-kitchen': KitchenPhoto,
  'harrow-lane-calendar': CalendarEnlargement,
  // File 0091: the same photograph shown by the Case 001 anomaly.
  'workstation-na07': ({ alt }) => <WorkstationPhoto dateStamp="14 OCT 1981" alt={alt} />,
  'desk-papers': DeskPapers,
  'reading-room-1998': ({ alt }) => <WorkstationPhoto variant="installation" alt={alt} />,
  // Case 008: the File 0093 photograph (pre-dawn view), imprinted tonight.
  'workstation-0093': ({ alt }) => (
    <WorkstationPhoto variant="predawn" dateStamp={imprintDate(new Date())} alt={alt} />
  ),
  // Case 009: handwriting samples, rendered from shared layout data.
  ...Object.fromEntries(
    (Object.keys(HAND_SAMPLES) as HandSampleKey[]).map((key) => [
      `hand-${key}`,
      ({ alt }: { readonly alt: string }) => <HandwritingSample sample={HAND_SAMPLES[key]} alt={alt} />,
    ]),
  ),
  // Case 008: camera 2 at 05:12, exported for comparison with File 0093.
  'camera-2-still-0512': ({ alt }) => (
    <CctvReadingRoom scene={{ door: 'shut', lamp: false, envelope: true }} time="05:12:00" alt={alt} />
  ),
  // Case 006: a single frame exported from camera 2 for comparison.
  'camera-2-still-0340': ({ alt }) => (
    <CctvReadingRoom scene={{ door: 'shut', lamp: true, figure: true }} time="03:40:02" alt={alt} />
  ),
};
