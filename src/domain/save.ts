import type { CaseId } from './case';
import { EMPTY_BOARD, isRelationType, type BoardLink, type BoardPosition, type BoardState } from './board';
import type { EvidenceId } from './evidence';

/**
 * Save data model. Every save carries a version number. Older versions are
 * upgraded through MIGRATIONS; saves from a newer build are refused rather
 * than guessed at, so they are never silently overwritten.
 *
 * History:
 * - v1: resume point (archive/briefing) and opened cases.
 * - v2: per-case examined evidence and discoveries; investigation and
 *       evidence resume points.
 * - v3: per-case evidence board (card positions and connections); board
 *       resume point.
 */
export const SAVE_VERSION = 3;

/** Where Continue returns the player to. Only resumable screens appear here. */
export type ResumePoint =
  | { readonly screen: 'archive' }
  | { readonly screen: 'briefing'; readonly caseId: CaseId }
  | { readonly screen: 'investigation'; readonly caseId: CaseId }
  | { readonly screen: 'board'; readonly caseId: CaseId }
  | { readonly screen: 'evidence'; readonly caseId: CaseId; readonly evidenceId: EvidenceId };

export interface CaseProgress {
  readonly status: 'opened';
  /** ISO 8601 timestamp of the first time the case was opened. */
  readonly firstOpenedAt: string;
  /** Evidence the player has opened, in first-examined order. */
  readonly examined: readonly EvidenceId[];
  /** Discovery IDs the player has made (see UnlockRule). */
  readonly discoveries: readonly string[];
  readonly board: BoardState;
}

export interface SaveGame {
  readonly version: typeof SAVE_VERSION;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resume: ResumePoint;
  readonly cases: Readonly<Record<string, CaseProgress>>;
}

/** Content lookups used to validate IDs found in stored data. */
export interface ContentIndex {
  readonly isKnownCase: (caseId: string) => boolean;
  readonly isKnownEvidence: (caseId: string, evidenceId: string) => boolean;
}

export type LoadProblem = 'corrupt' | 'newer-version';

export type MigrationResult =
  | { readonly ok: true; readonly save: SaveGame }
  | { readonly ok: false; readonly problem: LoadProblem };

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Upgrade steps keyed by the version they upgrade *from*. To change the save
 * format: bump SAVE_VERSION, add a step here, and add a test with a stored
 * fixture of the old shape. Steps receive untrusted data and must not throw.
 */
const MIGRATIONS: Readonly<Record<number, (data: RawRecord) => RawRecord>> = {
  1: (data) => {
    const cases: RawRecord = {};
    if (isRecord(data.cases)) {
      for (const [id, entry] of Object.entries(data.cases)) {
        cases[id] = isRecord(entry) ? { ...entry, examined: [], discoveries: [] } : entry;
      }
    }
    return { ...data, version: 2, cases };
  },
  2: (data) => {
    const cases: RawRecord = {};
    if (isRecord(data.cases)) {
      for (const [id, entry] of Object.entries(data.cases)) {
        cases[id] = isRecord(entry) ? { ...entry, board: { positions: {}, links: [] } } : entry;
      }
    }
    return { ...data, version: 3, cases };
  },
};

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function parseResume(value: unknown, content: ContentIndex): ResumePoint {
  const fallback: ResumePoint = { screen: 'archive' };
  if (!isRecord(value) || typeof value.caseId !== 'string') return fallback;
  const caseIdValue = value.caseId;
  if (!content.isKnownCase(caseIdValue)) return fallback;
  const id = caseIdValue as CaseId;
  switch (value.screen) {
    case 'briefing':
    case 'investigation':
    case 'board':
      return { screen: value.screen, caseId: id };
    case 'evidence':
      if (typeof value.evidenceId === 'string' && content.isKnownEvidence(id, value.evidenceId)) {
        return { screen: 'evidence', caseId: id, evidenceId: value.evidenceId as EvidenceId };
      }
      // Removed evidence: fall back to the case workspace.
      return { screen: 'investigation', caseId: id };
    default:
      return fallback;
  }
}

function uniqueStrings(value: unknown, keep: (item: string) => boolean): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && keep(item)))];
}

function parseBoard(value: unknown, caseIdValue: string, content: ContentIndex): BoardState {
  if (!isRecord(value)) return EMPTY_BOARD;
  const known = (id: unknown): id is EvidenceId =>
    typeof id === 'string' && content.isKnownEvidence(caseIdValue, id);

  const positions: Record<string, BoardPosition> = {};
  if (isRecord(value.positions)) {
    for (const [id, pos] of Object.entries(value.positions)) {
      if (known(id) && isRecord(pos) && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
        positions[id] = { x: pos.x as number, y: pos.y as number };
      }
    }
  }
  const links: BoardLink[] = [];
  if (Array.isArray(value.links)) {
    for (const link of value.links) {
      if (
        isRecord(link) &&
        known(link.from) &&
        known(link.to) &&
        link.from !== link.to &&
        isRelationType(link.relation)
      ) {
        links.push({ from: link.from, to: link.to, relation: link.relation });
      }
    }
  }
  return { positions, links };
}

function parseCases(value: unknown, content: ContentIndex): Record<string, CaseProgress> {
  const cases: Record<string, CaseProgress> = {};
  if (!isRecord(value)) return cases;
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry) || entry.status !== 'opened' || !isIsoTimestamp(entry.firstOpenedAt)) {
      continue;
    }
    cases[id] = {
      status: 'opened',
      firstOpenedAt: entry.firstOpenedAt,
      // Evidence removed from content is dropped; progress on the rest is kept.
      examined: uniqueStrings(entry.examined, (e) => content.isKnownEvidence(id, e)) as EvidenceId[],
      discoveries: uniqueStrings(entry.discoveries, () => true),
      board: parseBoard(entry.board, id, content),
    };
  }
  return cases;
}

/** Validates stored data, applying migrations if it is from an older version. */
export function migrateSave(raw: unknown, content: ContentIndex): MigrationResult {
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
      resume: parseResume(data.resume, content),
      cases: parseCases(data.cases, content),
    },
  };
}
