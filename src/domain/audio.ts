/**
 * Audio evidence model: an authored timeline of segments, each with sound
 * layers (rendered procedurally) and transcript lines (shown as captions).
 * Filters are authored and deterministic: applying one changes the mix and
 * can reveal transcript lines. Pure; no Web Audio here.
 */

export interface AudioFilter {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

/** Overrides a layer's level while a filter is applied. */
interface FilterResponse {
  readonly filterId: string;
  readonly level: number;
}

/** Sound layers. Times are seconds relative to the segment start. */
export type SoundLayer =
  | {
      readonly type: 'hiss';
      readonly level: number;
      readonly filtered?: FilterResponse;
    }
  | {
      /** Struck notes, e.g. an announcement chime or a station clock. */
      readonly type: 'bell';
      readonly at: number;
      readonly notes: readonly number[];
      readonly spacing: number;
      readonly decay: number;
      readonly level: number;
    }
  | {
      /** A clock ticking: short clicks at a steady rate across the segment. */
      readonly type: 'tick';
      readonly perSecond: number;
      readonly level: number;
      readonly filtered?: FilterResponse;
    }
  | {
      /** A kettle coming to the boil: rising rush that ends in a whistle. */
      readonly type: 'kettle';
      readonly start: number;
      readonly end: number;
      readonly level: number;
      readonly filtered?: FilterResponse;
    }
  | {
      /** Unintelligible speech-like sound. The words are in the transcript. */
      readonly type: 'voice';
      readonly pitch: 'low' | 'mid' | 'high';
      readonly start: number;
      readonly end: number;
      readonly level: number;
      readonly seed: number;
      readonly filtered?: FilterResponse;
    };

export interface TranscriptLine {
  /** Who is speaking, as the archive can establish it; null for sound notes. */
  readonly speaker: string | null;
  readonly text: string;
  /** Show only when the filter is (or is not) applied. */
  readonly condition?: { readonly filterId: string; readonly applied: boolean };
  /** Discovery recorded when this line becomes visible. */
  readonly revealsDiscovery?: string;
}

export interface AudioSegment {
  readonly id: string;
  readonly label: string;
  /** Seconds from the start of the timeline. */
  readonly start: number;
  readonly end: number;
  readonly layers: readonly SoundLayer[];
  readonly lines: readonly TranscriptLine[];
  /**
   * Discovery recorded when this segment is matched against a segment with
   * the same ID in a compared recording.
   */
  readonly revealsOnMatch?: string;
}

export interface AudioTimeline {
  readonly duration: number;
  /** Contiguous, in order, covering 0..duration. */
  readonly segments: readonly AudioSegment[];
}

export function clampTime(timeline: AudioTimeline, time: number): number {
  if (!Number.isFinite(time)) return 0;
  return Math.min(Math.max(time, 0), timeline.duration);
}

/** The segment playing at `time`. The final instant belongs to the last segment. */
export function segmentAt(timeline: AudioTimeline, time: number): AudioSegment | undefined {
  const t = clampTime(timeline, time);
  return (
    timeline.segments.find((s) => t >= s.start && t < s.end) ??
    timeline.segments[timeline.segments.length - 1]
  );
}

export function visibleLines(
  segment: AudioSegment,
  activeFilters: ReadonlySet<string>,
): TranscriptLine[] {
  return segment.lines.filter(
    (line) => !line.condition || activeFilters.has(line.condition.filterId) === line.condition.applied,
  );
}

/** Discoveries made by having this segment's lines visible under these filters. */
export function discoveriesAt(segment: AudioSegment, activeFilters: ReadonlySet<string>): string[] {
  return visibleLines(segment, activeFilters).flatMap((line) =>
    line.revealsDiscovery ? [line.revealsDiscovery] : [],
  );
}

/** Effective level of a layer under the active filters. */
export function layerLevel(layer: SoundLayer, activeFilters: ReadonlySet<string>): number {
  if ('filtered' in layer && layer.filtered && activeFilters.has(layer.filtered.filterId)) {
    return layer.filtered.level;
  }
  return layer.level;
}

/** "m:ss" for display, e.g. 65.4 → "1:05". */
export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** Spoken form for assistive technology, e.g. "1 minute 5 seconds". */
export function spokenTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const secs = whole % 60;
  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

/** Stable key for a set of filters, used to cache rendered mixes. */
export function filterKey(activeFilters: ReadonlySet<string>): string {
  return [...activeFilters].sort().join('+');
}

/** Re-times a segment to start at `start`; used for derived clips. */
export function retimeSegment(segment: AudioSegment, start: number): AudioSegment {
  return { ...segment, start, end: start + (segment.end - segment.start) };
}

/** Segments of two recordings paired by segment ID, in the first recording's order. */
export interface SegmentPair {
  readonly id: string;
  readonly label: string;
  readonly left?: AudioSegment | undefined;
  readonly right?: AudioSegment | undefined;
}

export function pairSegments(left: AudioTimeline, right: AudioTimeline): SegmentPair[] {
  const pairs = new Map<string, SegmentPair>();
  for (const s of left.segments) pairs.set(s.id, { id: s.id, label: s.label, left: s });
  for (const s of right.segments) {
    const existing = pairs.get(s.id);
    pairs.set(s.id, existing ? { ...existing, right: s } : { id: s.id, label: s.label, right: s });
  }
  return [...pairs.values()];
}

/** The discovery a matched pair records, if any (both sides must exist). */
export function matchDiscovery(pair: SegmentPair): string | undefined {
  if (!pair.left || !pair.right) return undefined;
  return pair.left.revealsOnMatch ?? pair.right.revealsOnMatch;
}
