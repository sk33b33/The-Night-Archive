import { describe, expect, it } from 'vitest';
import { CASE_001_REEL, VOICE_ISOLATION } from '../../content/cases/case-001-audio';
import { renderTimeline, rms, SYNTH_SAMPLE_RATE } from './reelSynth';

const NONE = new Set<string>();
const FILTERED = new Set([VOICE_ISOLATION.id]);

describe('reel synthesis', () => {
  const plain = renderTimeline(CASE_001_REEL, NONE);
  const filtered = renderTimeline(CASE_001_REEL, FILTERED);

  it('renders the full duration at the synth sample rate', () => {
    expect(plain.length).toBe(Math.ceil(CASE_001_REEL.duration * SYNTH_SAMPLE_RATE));
  });

  it('is deterministic', () => {
    const again = renderTimeline(CASE_001_REEL, NONE);
    expect(again).toEqual(plain);
  });

  it('stays within range and contains no invalid samples', () => {
    expect(plain.every((v) => Number.isFinite(v) && Math.abs(v) <= 1)).toBe(true);
  });

  it('the filter suppresses tape hiss', () => {
    expect(rms(filtered, 0, 6)).toBeLessThan(rms(plain, 0, 6) * 0.5);
  });

  it('the filter lifts the buried second voice well above the noise', () => {
    // Second voice: 9–14s into the voices segment (30–46s).
    const window = [39.2, 43.8] as const;
    expect(rms(filtered, ...window)).toBeGreaterThan(rms(plain, ...window) * 1.5);
    expect(rms(filtered, ...window)).toBeGreaterThan(rms(filtered, 0, 6) * 4);
  });

  it('the announcement is louder than the leader tape', () => {
    expect(rms(plain, 8, 18)).toBeGreaterThan(rms(plain, 0, 6) * 1.5);
  });
});
