import { describe, expect, it } from 'vitest';
import {
  CASE_001_FILTERED_CLIP,
  CASE_001_REEL,
  SECOND_VOICE_DISCOVERY,
  VOICE_ISOLATION,
} from '../content/cases/case-001-audio';
import {
  clampTime,
  discoveriesAt,
  filterKey,
  formatTime,
  layerLevel,
  segmentAt,
  spokenTime,
  visibleLines,
  type AudioTimeline,
} from './audio';
import { PLAYBACK_RATES, initialPlayback, playbackReducer, positionAt } from './playback';

const NONE = new Set<string>();
const FILTERED = new Set([VOICE_ISOLATION.id]);

function voices() {
  const segment = CASE_001_REEL.segments.find((s) => s.id === 'voices');
  if (!segment) throw new Error('voices segment missing');
  return segment;
}

describe('audio timeline', () => {
  it.each([
    ['reel', CASE_001_REEL],
    ['filtered clip', CASE_001_FILTERED_CLIP],
  ] as const)('%s segments are contiguous and cover the duration', (_, timeline: AudioTimeline) => {
    expect(timeline.segments[0]?.start).toBe(0);
    timeline.segments.forEach((segment, i) => {
      expect(segment.end).toBeGreaterThan(segment.start);
      const next = timeline.segments[i + 1];
      if (next) expect(next.start).toBe(segment.end);
    });
    expect(timeline.segments.at(-1)?.end).toBe(timeline.duration);
  });

  it('finds the segment at a time, including boundaries and the final instant', () => {
    expect(segmentAt(CASE_001_REEL, 0)?.id).toBe('leader');
    expect(segmentAt(CASE_001_REEL, 6)?.id).toBe('announcement');
    expect(segmentAt(CASE_001_REEL, 29.99)?.id).toBe('clock');
    expect(segmentAt(CASE_001_REEL, CASE_001_REEL.duration)?.id).toBe('end');
    expect(segmentAt(CASE_001_REEL, -5)?.id).toBe('leader');
  });

  it('clamps times into range', () => {
    expect(clampTime(CASE_001_REEL, -1)).toBe(0);
    expect(clampTime(CASE_001_REEL, 999)).toBe(CASE_001_REEL.duration);
    expect(clampTime(CASE_001_REEL, Number.NaN)).toBe(0);
  });

  it('hides the second voice until the filter is applied', () => {
    const plain = visibleLines(voices(), NONE).map((l) => l.text);
    expect(plain).toContain('Don’t open the east door.');
    expect(plain).toContain('[Tape noise rises]');
    expect(plain.join(' ')).not.toContain('Mara');

    const filtered = visibleLines(voices(), FILTERED).map((l) => l.text);
    expect(filtered).toContain('Mara, don’t file this.');
    expect(filtered).not.toContain('[Tape noise rises]');
  });

  it('reveals the discovery only with the filter, only in the voices segment', () => {
    expect(discoveriesAt(voices(), NONE)).toEqual([]);
    expect(discoveriesAt(voices(), FILTERED)).toEqual([SECOND_VOICE_DISCOVERY]);
    const announcement = segmentAt(CASE_001_REEL, 10);
    expect(announcement && discoveriesAt(announcement, FILTERED)).toEqual([]);
  });

  it('never attributes the voices to a named person', () => {
    const speakers = CASE_001_REEL.segments.flatMap((s) => s.lines.map((l) => l.speaker ?? ''));
    expect(speakers.join(' ')).not.toMatch(/Elias|Ward|Mara/);
  });

  it('applies filter responses to layer levels', () => {
    const buried = voices().layers.find((l) => l.type === 'voice' && l.pitch === 'high');
    if (!buried) throw new Error('missing layer');
    expect(layerLevel(buried, FILTERED)).toBeGreaterThan(layerLevel(buried, NONE) * 5);
  });

  it('formats times for display and speech', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65.9)).toBe('1:05');
    expect(spokenTime(1)).toBe('1 second');
    expect(spokenTime(65)).toBe('1 minute 5 seconds');
    expect(filterKey(new Set(['b', 'a']))).toBe('a+b');
  });
});

describe('playback', () => {
  const base = initialPlayback(50);

  it('advances position by elapsed time times rate while playing', () => {
    const playing = playbackReducer(base, { type: 'play', now: 100 });
    expect(positionAt(playing, 104)).toBe(4);
    const faster = playbackReducer(playing, { type: 'rate', rate: 1.5, now: 104 });
    expect(positionAt(faster, 106)).toBe(7);
  });

  it('holds position while paused', () => {
    const playing = playbackReducer(base, { type: 'play', now: 0 });
    const paused = playbackReducer(playing, { type: 'pause', now: 10 });
    expect(positionAt(paused, 500)).toBe(10);
  });

  it('seeks within bounds', () => {
    expect(positionAt(playbackReducer(base, { type: 'seek', position: 30, now: 0 }), 0)).toBe(30);
    expect(positionAt(playbackReducer(base, { type: 'seek', position: 80, now: 0 }), 0)).toBe(50);
    expect(positionAt(playbackReducer(base, { type: 'seek', position: -3, now: 0 }), 0)).toBe(0);
  });

  it('stops at the end and restarts from the beginning on play', () => {
    const playing = playbackReducer(base, { type: 'play', now: 0 });
    const ended = playbackReducer(playing, { type: 'tick', now: 60 });
    expect(ended.playing).toBe(false);
    expect(positionAt(ended, 60)).toBe(50);
    const again = playbackReducer(ended, { type: 'play', now: 70 });
    expect(positionAt(again, 70)).toBe(0);
  });

  it('ignores redundant actions', () => {
    expect(playbackReducer(base, { type: 'pause', now: 1 })).toBe(base);
    expect(playbackReducer(base, { type: 'rate', rate: 1, now: 1 })).toBe(base);
    expect(playbackReducer(base, { type: 'tick', now: 1 })).toBe(base);
    expect(PLAYBACK_RATES).toContain(1);
  });
});
