import type { PhotoRegion } from '../../domain/photoView';

/**
 * Case 011: Storage B as layout data, shared by the artwork and the content.
 * Both photographs (sealing, 1981; File 0094) are drawn from these
 * coordinates on a 400×300 frame, so the window, bays and boxes line up and
 * regions are computed rather than placed by hand.
 *
 * Two bays of four shelves, six boxes a shelf: 48 boxes, SB-01 to SB-48.
 * Bay A holds SB-01–SB-24, bay B SB-25–SB-48, filled left to right, top
 * shelf first.
 */
export const LOCATION_DISCOVERY = 'c011-location-match';

export const STORAGE = {
  bays: [
    { id: 'A', x: 20 },
    { id: 'B', x: 160 },
  ],
  bayWidth: 130,
  /** Top of the bay uprights and the bay plates. */
  top: 30,
  floor: 250,
  /** Top surface of each shelf plank, top shelf first. */
  planks: [72, 117, 162, 207],
  box: { width: 19, height: 34, gap: 2, inset: 3 },
  window: { x: 318, y: 50, width: 60, height: 100, bars: 4 },
} as const;

export interface BoxPlace {
  readonly number: number;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

/** Where box SB-nn sits on the shelves. */
export function boxPlace(number: number): BoxPlace {
  const index = number - 1;
  const bay = STORAGE.bays[Math.floor(index / 24)] ?? STORAGE.bays[0];
  const shelf = Math.floor((index % 24) / 6);
  const slot = index % 6;
  const { width, height, gap, inset } = STORAGE.box;
  return {
    number,
    label: `SB-${String(number).padStart(2, '0')}`,
    x: bay.x + inset + slot * (width + gap),
    y: (STORAGE.planks[shelf] ?? 0) - height,
  };
}

export const ALL_BOXES: readonly number[] = Array.from({ length: 48 }, (_, i) => i + 1);
/** The boxes left on the shelves in the File 0094 photograph. */
export const BOXES_IN_0094: readonly number[] = [7, 31, 40];

const frac = (x: number, y: number, width: number, height: number) => ({
  x: x / 400,
  y: y / 300,
  width: width / 400,
  height: height / 300,
});

const windowRegion = (revealsOnMatch?: string): PhotoRegion => {
  const w = STORAGE.window;
  return {
    id: 'east-window',
    label: 'Barred window',
    note: `A window in the right-hand wall with ${w.bars} vertical bars.`,
    ...frac(w.x - 6, w.y - 6, w.width + 12, w.height + 12),
    ...(revealsOnMatch ? { revealsOnMatch } : {}),
  };
};

const baysRegion: PhotoRegion = {
  id: 'bay-plates',
  label: 'Bay plates',
  note: 'Two steel shelving bays, plated “BAY A” and “BAY B”, four shelves each.',
  ...frac(14, STORAGE.top - 6, 282, 22),
};

/** The 1981 sealing photograph: full shelves. */
export const SEALING_REGIONS: readonly PhotoRegion[] = [
  windowRegion(),
  baysRegion,
  {
    id: 'shelves',
    label: 'Shelves',
    note: 'Every shelf holds six boxes: forty-eight in all, labelled SB-01 to SB-48.',
    ...frac(14, STORAGE.top + 14, 282, STORAGE.floor - STORAGE.top - 30),
  },
];

/** The File 0094 photograph: the same room, three boxes left. */
export const PHOTO_0094_REGIONS: readonly PhotoRegion[] = [
  windowRegion(LOCATION_DISCOVERY),
  baysRegion,
  ...BOXES_IN_0094.map((n): PhotoRegion => {
    const place = boxPlace(n);
    const pad = 4;
    return {
      id: `box-${n}`,
      label: `Box ${place.label}`,
      note: `An archive box on an otherwise empty shelf. Its label reads ${place.label}.`,
      ...frac(place.x - pad, place.y - pad, STORAGE.box.width + pad * 2, STORAGE.box.height + pad * 2),
    };
  }),
];
