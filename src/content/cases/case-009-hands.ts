import type { PhotoRegion } from '../../domain/photoView';

/**
 * Case 009 handwriting samples, as layout data shared by the artwork and the
 * content. Every sample is drawn on a 400×300 sheet. The three letterforms
 * the examiner compares are drawn as glyphs so they look identical in every
 * sample, and their regions are computed from the same coordinates.
 */
export type Glyph = 'M' | '0' | '1';

export type HandPart =
  | { readonly kind: 'text'; readonly x: number; readonly y: number; readonly size: number; readonly text: string }
  | {
      readonly kind: 'glyph';
      readonly glyph: Glyph;
      readonly x: number;
      readonly y: number;
      readonly size: number;
      /** If set, the glyph is a marked region. */
      readonly region?: { readonly id: GlyphRegionId; readonly note: string; readonly revealsOnMatch?: string };
    };

export type GlyphRegionId = 'crossed-m' | 'open-zero' | 'slanted-one';

export interface HandSample {
  readonly paper: 'slip' | 'card' | 'calendar' | 'ledger' | 'report';
  readonly printed: readonly { readonly x: number; readonly y: number; readonly size: number; readonly text: string }[];
  readonly hand: readonly HandPart[];
}

export const SPECIMEN_DISCOVERY = 'c009-specimen-match';
export const HANDOVER_DISCOVERY = 'c010-handover-match';
export const SAMPLES_DISCOVERY = 'c009-samples-match';

const LABEL: Record<GlyphRegionId, string> = {
  'crossed-m': 'Crossed “M”',
  'open-zero': 'Open “0”',
  'slanted-one': 'Slanted “1”',
};

/** Glyph widths as a fraction of size, for region boxes. */
const WIDTH: Record<Glyph, number> = { M: 0.95, '0': 0.75, '1': 0.6 };

export function glyphRegions(sample: HandSample): PhotoRegion[] {
  return sample.hand.flatMap((part) => {
    if (part.kind !== 'glyph' || !part.region) return [];
    const pad = part.size * 0.18;
    const x = Math.max(0, part.x - pad) / 400;
    const y = Math.max(0, part.y - part.size * 1.05 - pad) / 300;
    const width = Math.min(1 - x, (part.size * WIDTH[part.glyph] + pad * 2) / 400);
    const height = Math.min(1 - y, (part.size * 1.1 + pad * 2) / 300);
    return [
      {
        id: part.region.id,
        label: LABEL[part.region.id],
        note: part.region.note,
        x,
        y,
        width,
        height,
        ...(part.region.revealsOnMatch ? { revealsOnMatch: part.region.revealsOnMatch } : {}),
      },
    ];
  });
}

const M_NOTE = 'A capital M with a stroke drawn across its middle.';
const ZERO_NOTE = 'A 0 left open at the top.';
const ONE_NOTE = 'A 1 slanted to the right, with a short flag.';

export const HAND_SAMPLES = {
  slip: {
    paper: 'slip',
    printed: [
      { x: 30, y: 42, size: 16, text: 'INTAKE SLIP' },
      { x: 30, y: 104, size: 12, text: 'No.' },
      { x: 30, y: 154, size: 12, text: 'Time' },
      { x: 30, y: 204, size: 12, text: 'Description' },
      { x: 30, y: 254, size: 12, text: 'Filed by' },
    ],
    hand: [
      { kind: 'glyph', glyph: '0', x: 160, y: 110, size: 34, region: { id: 'open-zero', note: ZERO_NOTE } },
      { kind: 'text', x: 188, y: 110, size: 30, text: '094' },
      { kind: 'text', x: 160, y: 160, size: 28, text: '06:00' },
      { kind: 'text', x: 160, y: 210, size: 26, text: 'Photograph' },
      { kind: 'glyph', glyph: 'M', x: 160, y: 262, size: 36, region: { id: 'crossed-m', note: M_NOTE } },
      { kind: 'text', x: 196, y: 262, size: 30, text: '.' },
    ],
  },
  calendar: {
    paper: 'calendar',
    printed: [{ x: 26, y: 48, size: 22, text: '2' }],
    hand: [
      { kind: 'text', x: 40, y: 140, size: 34, text: 'Inspector —' },
      { kind: 'glyph', glyph: '1', x: 90, y: 228, size: 46, region: { id: 'slanted-one', note: ONE_NOTE } },
      { kind: 'glyph', glyph: '0', x: 122, y: 228, size: 46, region: { id: 'open-zero', note: ZERO_NOTE } },
      { kind: 'text', x: 160, y: 228, size: 40, text: ':00' },
    ],
  },
  ledger0091: {
    paper: 'ledger',
    printed: [{ x: 26, y: 40, size: 12, text: 'No.' }],
    hand: [
      {
        kind: 'glyph',
        glyph: '0',
        x: 60,
        y: 190,
        size: 60,
        region: { id: 'open-zero', note: ZERO_NOTE, revealsOnMatch: SAMPLES_DISCOVERY },
      },
      { kind: 'text', x: 108, y: 190, size: 56, text: '091' },
    ],
  },
  ledger14oct: {
    paper: 'ledger',
    printed: [{ x: 26, y: 40, size: 12, text: 'Date' }],
    hand: [
      { kind: 'glyph', glyph: '1', x: 80, y: 186, size: 60, region: { id: 'slanted-one', note: ONE_NOTE } },
      { kind: 'text', x: 118, y: 186, size: 52, text: '4 Oct' },
    ],
  },
  filedM: {
    paper: 'report',
    printed: [{ x: 26, y: 40, size: 12, text: 'Incident report — Bellwether Railway Station' }],
    hand: [
      { kind: 'text', x: 46, y: 176, size: 40, text: 'Filed. —' },
      { kind: 'glyph', glyph: 'M', x: 236, y: 180, size: 52, region: { id: 'crossed-m', note: M_NOTE } },
      { kind: 'text', x: 288, y: 180, size: 40, text: '.' },
    ],
  },
  specimen: {
    paper: 'card',
    printed: [
      { x: 30, y: 42, size: 14, text: 'SPECIMEN SIGNATURE' },
      { x: 30, y: 66, size: 12, text: 'Post: Night archivist' },
      { x: 30, y: 270, size: 12, text: 'Recorded 1979' },
    ],
    hand: [
      {
        kind: 'glyph',
        glyph: 'M',
        x: 120,
        y: 196,
        size: 80,
        region: { id: 'crossed-m', note: M_NOTE, revealsOnMatch: SPECIMEN_DISCOVERY },
      },
      { kind: 'text', x: 200, y: 196, size: 60, text: '. —' },
    ],
  },
  // Case 010: the night archivist's "M." in the day archivist's handover log.
  handover: {
    paper: 'report',
    printed: [
      { x: 26, y: 40, size: 12, text: 'Handover log — 06:00' },
      { x: 26, y: 120, size: 12, text: 'Day archivist: P. Nash' },
      { x: 26, y: 200, size: 12, text: 'Night archivist:' },
    ],
    hand: [
      {
        kind: 'glyph',
        glyph: 'M',
        x: 170,
        y: 214,
        size: 56,
        region: { id: 'crossed-m', note: M_NOTE, revealsOnMatch: HANDOVER_DISCOVERY },
      },
      { kind: 'text', x: 226, y: 214, size: 44, text: '.' },
    ],
  },
} as const satisfies Record<string, HandSample>;

export type HandSampleKey = keyof typeof HAND_SAMPLES;
