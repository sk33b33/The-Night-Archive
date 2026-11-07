import { useCallback, useEffect, useRef, useState } from 'react';
import { clampTime, discoveriesAt, segmentAt, type AudioSegment } from '../../../domain/audio';
import type { AudioEvidence } from '../../../domain/evidence';
import {
  initialPlayback,
  playbackReducer,
  positionAt,
  type PlaybackAction,
  type PlaybackRate,
  type PlaybackState,
} from '../../../domain/playback';
import {
  createWebAudioEngine,
  prewarmTimeline,
  type PlaybackEngine,
} from '../../../services/audio/playbackEngine';

export type EngineFactory = (item: AudioEvidence) => PlaybackEngine | null;

const defaultEngineFactory: EngineFactory = (item) => createWebAudioEngine(item.timeline);
const TICK_MS = 200;
const clock = () => performance.now() / 1000;

type ActionWithoutTime<A> = A extends { now: number } ? Omit<A, 'now'> : never;

export interface ReelPlayer {
  readonly playing: boolean;
  readonly position: number;
  readonly duration: number;
  readonly rate: PlaybackRate;
  readonly segment: AudioSegment | undefined;
  readonly activeFilters: ReadonlySet<string>;
  /** False once sound output has failed or is unsupported; captions still work. */
  readonly soundAvailable: boolean;
  readonly togglePlay: () => void;
  readonly seek: (position: number) => void;
  readonly setRate: (rate: PlaybackRate) => void;
  readonly setFilter: (filterId: string, on: boolean) => void;
}

/**
 * Drives one audio evidence item: position bookkeeping (pure reducer),
 * a lazily created sound engine (created on the first Play, a user gesture),
 * and discovery reporting when a filter reveals a transcript line.
 */
export function useReelPlayer(
  item: AudioEvidence,
  onDiscover: (discoveryId: string) => void,
  createEngine: EngineFactory = defaultEngineFactory,
): ReelPlayer {
  const [state, setState] = useState<PlaybackState>(() => initialPlayback(item.timeline.duration));
  const [now, setNow] = useState(clock);
  const [activeFilters, setActiveFilters] = useState<ReadonlySet<string>>(
    () => new Set(item.fixedFilters),
  );
  const [soundAvailable, setSoundAvailable] = useState(true);
  const engineRef = useRef<PlaybackEngine | null | undefined>(undefined);
  const stateRef = useRef(state);
  const filtersRef = useRef(activeFilters);

  const engine = useCallback((): PlaybackEngine | null => {
    if (engineRef.current === undefined) {
      engineRef.current = createEngine(item);
      if (!engineRef.current) setSoundAvailable(false);
    }
    return engineRef.current;
  }, [createEngine, item]);

  /** Starts or stops sound so it matches the given state. */
  const syncSound = useCallback(
    (next: PlaybackState, filters: ReadonlySet<string>, at: number) => {
      if (!next.playing) {
        engineRef.current?.stop();
        return;
      }
      try {
        engine()?.start(positionAt(next, at), next.rate, filters);
      } catch {
        engineRef.current?.dispose();
        engineRef.current = null;
        setSoundAvailable(false);
      }
    },
    [engine],
  );

  const dispatch = useCallback(
    (action: ActionWithoutTime<PlaybackAction>) => {
      const at = clock();
      const prev = stateRef.current;
      const next = playbackReducer(prev, { ...action, now: at } as PlaybackAction);
      stateRef.current = next;
      setState(next);
      setNow(at);
      if (next !== prev) syncSound(next, filtersRef.current, at);
    },
    [syncSound],
  );

  // Advance the displayed position while playing; stop at the end.
  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.playing, dispatch]);

  // Render the starting mix, then each single-filter mix, before they are needed.
  useEffect(() => {
    const base = new Set(item.fixedFilters);
    const withEach = item.filters
      .filter((f) => !base.has(f.id))
      .map((f) => new Set([...base, f.id]));
    return prewarmTimeline(item.timeline, [base, ...withEach]);
  }, [item]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = undefined;
    },
    [],
  );

  const position = positionAt(state, now);
  const segment = segmentAt(item.timeline, position);

  // Report discoveries revealed by the current segment and filters.
  const reported = useRef(new Set<string>());
  useEffect(() => {
    if (!segment) return;
    for (const id of discoveriesAt(segment, activeFilters)) {
      if (!reported.current.has(id)) {
        reported.current.add(id);
        onDiscover(id);
      }
    }
  }, [segment, activeFilters, onDiscover]);

  const setFilter = useCallback(
    (filterId: string, on: boolean) => {
      if (item.fixedFilters.includes(filterId)) return;
      const next = new Set(filtersRef.current);
      if (on) next.add(filterId);
      else next.delete(filterId);
      filtersRef.current = next;
      setActiveFilters(next);
      // Switch mixes at the current position without a gap in bookkeeping.
      const at = clock();
      const current = stateRef.current;
      const reanchored = playbackReducer(current, { type: 'seek', position: positionAt(current, at), now: at });
      stateRef.current = reanchored;
      setState(reanchored);
      syncSound(reanchored, next, at);
    },
    [item.fixedFilters, syncSound],
  );

  return {
    playing: state.playing,
    position,
    duration: item.timeline.duration,
    rate: state.rate,
    segment,
    activeFilters,
    soundAvailable,
    togglePlay: () => dispatch({ type: stateRef.current.playing ? 'pause' : 'play' }),
    seek: (target) => dispatch({ type: 'seek', position: clampTime(item.timeline, target) }),
    setRate: (rate) => dispatch({ type: 'rate', rate }),
    setFilter,
  };
}
