import type { CaseId } from './case';

/**
 * Save data model. Every save carries a version number. Older versions are
 * upgraded through MIGRATIONS; saves from a newer build are refused rather
 * than guessed at, so they are never silently overwritten.
 */
export const SAVE_VERSION = 1;

/** Where Continue returns the player to. Only resumable screens appear here. */
export type ResumePoint =
  | { readonly screen: 'archive' }
  | { readonly screen: 'briefing'; readonly caseId: CaseId };

export interface CaseProgress {
  readonly status: 'opened';
  /** ISO 8601 timestamp of the first time the briefing was opened. */
  readonly firstOpenedAt: string;
}

export interface SaveGame {
  readonly version: typeof SAVE_VERSION;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resume: ResumePoint;
  readonly cases: Readonly<Record<string, CaseProgress>>;
}

export type LoadProblem = 'corrupt' | 'newer-version';

export type MigrationResult =
  | { readonly ok: true; readonly save: SaveGame }
  | { readonly ok: false; readonly problem: LoadProblem };

/**
 * Upgrade steps keyed by the version they upgrade *from*. To change the save
 * format: bump SAVE_VERSION, add a step here, and add a test with a stored
 * fixture of the old shape.
 */
const MIGRATIONS: Readonly<Record<number, (data: Record<string, unknown>) => Record<string, unknown>>> =
  {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function parseResume(
  value: unknown,
  isKnownCase: (id: string) => boolean,
): ResumePoint {
  if (isRecord(value) && value.screen === 'briefing' && typeof value.caseId === 'string') {
    if (isKnownCase(value.caseId)) return { screen: 'briefing', caseId: value.caseId as CaseId };
  }
  // Unknown or removed screens fall back to the archive rather than failing.
  return { screen: 'archive' };
}

function parseCases(value: unknown): Record<string, CaseProgress> {
  const cases: Record<string, CaseProgress> = {};
  if (!isRecord(value)) return cases;
  for (const [id, entry] of Object.entries(value)) {
    if (isRecord(entry) && entry.status === 'opened' && isIsoTimestamp(entry.firstOpenedAt)) {
      cases[id] = { status: 'opened', firstOpenedAt: entry.firstOpenedAt };
    }
  }
  return cases;
}

/** Validates stored data, applying migrations if it is from an older version. */
export function migrateSave(
  raw: unknown,
  isKnownCase: (id: string) => boolean,
): MigrationResult {
  if (!isRecord(raw) || typeof raw.version !== 'number' || !Number.isInteger(raw.version)) {
    return { ok: false, problem: 'corrupt' };
  }
  if (raw.version > SAVE_VERSION) return { ok: false, problem: 'newer-version' };

  let data = raw;
  for (let v = raw.version; v < SAVE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) return { ok: false, problem: 'corrupt' };
    data = step(data);
  }

  if (!isIsoTimestamp(data.createdAt) || !isIsoTimestamp(data.updatedAt)) {
    return { ok: false, problem: 'corrupt' };
  }
  return {
    ok: true,
    save: {
      version: SAVE_VERSION,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      resume: parseResume(data.resume, isKnownCase),
      cases: parseCases(data.cases),
    },
  };
}
