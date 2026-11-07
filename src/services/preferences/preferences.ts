/**
 * Lightweight player preferences, stored in localStorage (durable game saves
 * will use IndexedDB in a later phase). Parsing is defensive: corrupt or
 * outdated stored data falls back to defaults rather than throwing.
 */
export const PREFERENCES_STORAGE_KEY = 'night-archive:preferences';
export const PREFERENCES_VERSION = 1;

export const MOTION_OPTIONS = ['system', 'reduced', 'full'] as const;
export type MotionPreference = (typeof MOTION_OPTIONS)[number];

export const TEXT_SIZE_OPTIONS = ['standard', 'large'] as const;
export type TextSizePreference = (typeof TEXT_SIZE_OPTIONS)[number];

export interface Preferences {
  readonly motion: MotionPreference;
  readonly textSize: TextSizePreference;
}

export const DEFAULT_PREFERENCES: Preferences = {
  motion: 'system',
  textSize: 'standard',
};

interface StoredPreferences extends Preferences {
  readonly version: number;
}

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parsePreferences(raw: string | null): Preferences {
  if (raw === null) return DEFAULT_PREFERENCES;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_PREFERENCES;
  }
  if (typeof data !== 'object' || data === null) return DEFAULT_PREFERENCES;
  const record = data as Record<string, unknown>;
  return {
    motion: pick(MOTION_OPTIONS, record.motion, DEFAULT_PREFERENCES.motion),
    textSize: pick(TEXT_SIZE_OPTIONS, record.textSize, DEFAULT_PREFERENCES.textSize),
  };
}

export function serializePreferences(prefs: Preferences): string {
  const stored: StoredPreferences = { version: PREFERENCES_VERSION, ...prefs };
  return JSON.stringify(stored);
}

/** Minimal storage surface so tests can supply an in-memory implementation. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadPreferences(store: KeyValueStore | undefined): Preferences {
  if (!store) return DEFAULT_PREFERENCES;
  try {
    return parsePreferences(store.getItem(PREFERENCES_STORAGE_KEY));
  } catch {
    // Storage can throw in private browsing or when access is blocked.
    return DEFAULT_PREFERENCES;
  }
}

/** Returns false when the preference could not be persisted. */
export function savePreferences(store: KeyValueStore | undefined, prefs: Preferences): boolean {
  if (!store) return false;
  try {
    store.setItem(PREFERENCES_STORAGE_KEY, serializePreferences(prefs));
    return true;
  } catch {
    return false;
  }
}

export function browserStore(): KeyValueStore | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}
