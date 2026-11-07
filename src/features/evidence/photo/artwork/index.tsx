import type { ReactElement } from 'react';
import { CalendarEnlargement } from './CalendarEnlargement';
import { KitchenPhoto } from './KitchenPhoto';

/**
 * Photograph artwork by content key. Evidence content names a key; the
 * drawing lives here so case data stays free of presentation code.
 */
export const PHOTO_ARTWORK: Readonly<Record<string, (props: { readonly alt: string }) => ReactElement>> = {
  'harrow-lane-kitchen': KitchenPhoto,
  'harrow-lane-calendar': CalendarEnlargement,
};
