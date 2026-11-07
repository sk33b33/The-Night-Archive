import { filterKey, layerLevel, type AudioTimeline, type SoundLayer } from '../../domain/audio';

/**
 * Procedural renderer for authored audio timelines. Produces mono samples
 * directly (no Web Audio), seeded so every render is identical. Real
 * recordings can replace this later behind the same timeline model.
 */
export const SYNTH_SAMPLE_RATE = 22050;

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** RBJ band-pass biquad, processed in place over a sample range. */
class BandPass {
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  private b0 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;

  constructor(private readonly sampleRate: number) {}

  set(frequency: number, q: number): void {
    const w = (2 * Math.PI * frequency) / this.sampleRate;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    this.b0 = alpha / a0;
    this.b2 = -alpha / a0;
    this.a1 = (-2 * Math.cos(w)) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  process(x: number): number {
    const y = this.b0 * x + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

const PITCH_HZ = { low: 105, mid: 150, high: 215 } as const;

function renderLayer(
  out: Float32Array,
  layer: SoundLayer,
  segmentStart: number,
  segmentEnd: number,
  level: number,
  sampleRate: number,
): void {
  const toIndex = (seconds: number) => Math.min(out.length, Math.max(0, Math.round(seconds * sampleRate)));

  switch (layer.type) {
    case 'hiss': {
      const random = rng(Math.round(segmentStart * 1000) + 17);
      let low = 0;
      const from = toIndex(segmentStart);
      const to = toIndex(segmentEnd);
      for (let i = from; i < to; i++) {
        const t = i / sampleRate;
        low += 0.25 * (random() * 2 - 1 - low);
        // Slow wobble, like worn tape.
        const wobble = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * t);
        out[i] = (out[i] ?? 0) + low * level * wobble;
      }
      return;
    }
    case 'bell': {
      layer.notes.forEach((frequency, n) => {
        const start = segmentStart + layer.at + n * layer.spacing;
        const from = toIndex(start);
        const to = toIndex(Math.min(segmentEnd, start + layer.decay * 5));
        for (let i = from; i < to; i++) {
          const t = (i - from) / sampleRate;
          const envelope = Math.exp(-t / layer.decay) * Math.min(1, t * 200);
          const tone =
            Math.sin(2 * Math.PI * frequency * t) +
            0.35 * Math.sin(2 * Math.PI * frequency * 2.76 * t) +
            0.15 * Math.sin(2 * Math.PI * frequency * 5.4 * t);
          out[i] = (out[i] ?? 0) + tone * envelope * level;
        }
      });
      return;
    }
    case 'voice': {
      const random = rng(layer.seed);
      const f1 = new BandPass(sampleRate);
      const f2 = new BandPass(sampleRate);
      const from = toIndex(segmentStart + layer.start);
      const to = toIndex(Math.min(segmentEnd, segmentStart + layer.end));
      let phase = 0;
      let syllableEnd = from;
      let syllableStart = from;
      let pitch: number = PITCH_HZ[layer.pitch];
      for (let i = from; i < to; i++) {
        if (i >= syllableEnd) {
          // Next syllable: random length, formants, and a short gap.
          syllableStart = i + Math.round((0.03 + random() * 0.12) * sampleRate);
          syllableEnd = syllableStart + Math.round((0.12 + random() * 0.2) * sampleRate);
          f1.set(320 + random() * 500, 6);
          f2.set(1000 + random() * 1300, 9);
          pitch = PITCH_HZ[layer.pitch] * (0.9 + random() * 0.2);
        }
        const inSyllable = i >= syllableStart && i < syllableEnd;
        const position = inSyllable ? (i - syllableStart) / (syllableEnd - syllableStart) : 0;
        const envelope = inSyllable ? Math.sin(Math.PI * position) : 0;
        phase += pitch / sampleRate;
        if (phase >= 1) phase -= 1;
        const source = (phase < 0.08 ? 1 : 0) + (random() * 2 - 1) * 0.15;
        const shaped = f1.process(source) * 1.4 + f2.process(source) * 0.8;
        out[i] = (out[i] ?? 0) + shaped * envelope * level * 4;
      }
      return;
    }
  }
}

/** Renders the full timeline under the given filters. Deterministic. */
export function renderTimeline(
  timeline: AudioTimeline,
  activeFilters: ReadonlySet<string>,
  sampleRate = SYNTH_SAMPLE_RATE,
): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.ceil(timeline.duration * sampleRate));
  for (const segment of timeline.segments) {
    for (const layer of segment.layers) {
      const level = layerLevel(layer, activeFilters);
      if (level > 0) renderLayer(out, layer, segment.start, segment.end, level, sampleRate);
    }
  }
  // Gentle saturation keeps peaks in range, like tape.
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] ?? 0);
  return out;
}

/** Root-mean-square level over a time range; used by tests and diagnostics. */
export function rms(samples: Float32Array, from: number, to: number, sampleRate = SYNTH_SAMPLE_RATE): number {
  const a = Math.max(0, Math.floor(from * sampleRate));
  const b = Math.min(samples.length, Math.floor(to * sampleRate));
  let sum = 0;
  for (let i = a; i < b; i++) sum += (samples[i] ?? 0) ** 2;
  return b > a ? Math.sqrt(sum / (b - a)) : 0;
}

const renderCache = new WeakMap<AudioTimeline, Map<string, Float32Array<ArrayBuffer>>>();

/**
 * Cached render, so a mix is only synthesised once per timeline and filter
 * set. Rendering takes noticeable time on phones, so the player pre-renders
 * the default mix while idle.
 */
export function renderTimelineCached(
  timeline: AudioTimeline,
  activeFilters: ReadonlySet<string>,
): Float32Array<ArrayBuffer> {
  let byFilters = renderCache.get(timeline);
  if (!byFilters) {
    byFilters = new Map();
    renderCache.set(timeline, byFilters);
  }
  const key = filterKey(activeFilters);
  let samples = byFilters.get(key);
  if (!samples) {
    samples = renderTimeline(timeline, activeFilters);
    byFilters.set(key, samples);
  }
  return samples;
}
