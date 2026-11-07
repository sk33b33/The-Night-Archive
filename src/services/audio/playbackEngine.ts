import { filterKey, type AudioTimeline } from '../../domain/audio';
import { renderTimelineCached, SYNTH_SAMPLE_RATE } from './reelSynth';

/**
 * Sound output for an audio timeline. Position bookkeeping lives in
 * domain/playback.ts; the engine only starts and stops sound.
 */
export interface PlaybackEngine {
  start(offset: number, rate: number, activeFilters: ReadonlySet<string>): void;
  stop(): void;
  dispose(): void;
}

type AudioContextConstructor = new () => AudioContext;

function audioContextConstructor(): AudioContextConstructor | null {
  const g = globalThis as typeof globalThis & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  return audioContextConstructor() !== null;
}

/**
 * Web Audio engine. Must be created from a user gesture (Android/iOS only
 * allow audio to start that way). Mixes are rendered once per filter set.
 */
export function createWebAudioEngine(timeline: AudioTimeline): PlaybackEngine | null {
  const Ctor = audioContextConstructor();
  if (!Ctor) return null;
  let context: AudioContext;
  try {
    context = new Ctor();
  } catch {
    return null;
  }
  const buffers = new Map<string, AudioBuffer>();
  let source: AudioBufferSourceNode | null = null;

  const bufferFor = (filters: ReadonlySet<string>): AudioBuffer => {
    const key = filterKey(filters);
    let buffer = buffers.get(key);
    if (!buffer) {
      const samples = renderTimelineCached(timeline, filters);
      buffer = context.createBuffer(1, samples.length, SYNTH_SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);
      buffers.set(key, buffer);
    }
    return buffer;
  };

  const stop = () => {
    if (!source) return;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
    source.disconnect();
    source = null;
  };

  return {
    start(offset, rate, filters) {
      stop();
      if (context.state === 'suspended') void context.resume();
      const node = context.createBufferSource();
      node.buffer = bufferFor(filters);
      node.playbackRate.value = rate;
      node.connect(context.destination);
      node.start(0, Math.min(offset, timeline.duration));
      source = node;
    },
    stop,
    dispose() {
      stop();
      void context.close();
    },
  };
}

/** Renders mixes ahead of time, when the browser is idle, in the given order. */
export function prewarmTimeline(
  timeline: AudioTimeline,
  filterSets: readonly ReadonlySet<string>[],
): () => void {
  if (!isAudioSupported()) return () => undefined;
  const run = () => {
    for (const filters of filterSets) renderTimelineCached(timeline, filters);
  };
  const w = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(run);
    return () => w.cancelIdleCallback?.(id);
  }
  const id = setTimeout(run, 300);
  return () => clearTimeout(id);
}
