import type { ReactElement } from 'react';
import { WorkstationPhoto } from '../../../anomaly/WorkstationPhoto';
import { CalendarEnlargement } from './CalendarEnlargement';
import { DeskPapers } from './DeskPapers';
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
};
