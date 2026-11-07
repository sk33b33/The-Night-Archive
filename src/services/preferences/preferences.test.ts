import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  loadPreferences,
  parsePreferences,
  savePreferences,
  serializePreferences,
  type KeyValueStore,
} from './preferences';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota');
  },
};

describe('preferences', () => {
  it('uses defaults when nothing is stored', () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });

  it('round-trips through storage with a version stamp', () => {
    const store = memoryStore();
    const prefs = { motion: 'reduced', textSize: 'large' } as const;
    expect(savePreferences(store, prefs)).toBe(true);
    expect(JSON.parse(store.data[PREFERENCES_STORAGE_KEY] ?? '')).toMatchObject({ version: 1 });
    expect(loadPreferences(store)).toEqual(prefs);
  });

  it('falls back to defaults for corrupt JSON', () => {
    expect(parsePreferences('{not json')).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences('42')).toEqual(DEFAULT_PREFERENCES);
  });

  it('replaces unknown values field by field', () => {
    const raw = JSON.stringify({ version: 1, motion: 'sideways', textSize: 'large' });
    expect(parsePreferences(raw)).toEqual({ motion: 'system', textSize: 'large' });
  });

  it('survives storage that throws', () => {
    expect(loadPreferences(throwingStore)).toEqual(DEFAULT_PREFERENCES);
    expect(savePreferences(throwingStore, DEFAULT_PREFERENCES)).toBe(false);
    expect(savePreferences(undefined, DEFAULT_PREFERENCES)).toBe(false);
  });

  it('serializes only known fields', () => {
    expect(JSON.parse(serializePreferences(DEFAULT_PREFERENCES))).toEqual({
      version: 1,
      motion: 'system',
      textSize: 'standard',
    });
  });
});
