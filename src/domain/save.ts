import type { CaseId } from './case';
import { EMPTY_BOARD, isRelationType, type BoardLink, type BoardPosition, type BoardState } from './board';
import type { DeductionAttempt, DeductionOutcome } from './deduction';
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
 * - v4: per-case deduction attempts; findings resume point.
 * - v5: per-case document highlights.
 * - v6: closing choices (choice ID -> chosen value), made once per save.
 */
export const SAVE_VERSION = 6;

/** Where Continue returns the player to. Only resumable screens appear here. */
export type ResumePoint =
  | { readonly screen: 'archive' }
  | { readonly screen: 'briefing'; readonly caseId: CaseId }
  | { readonly screen: 'investigation'; readonly caseId: CaseId }
  | { readonly screen: 'board'; readonly caseId: CaseId }
  | { readonly screen: 'findings'; readonly caseId: CaseId }
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
  /** Every submitted set of findings, oldest first. */
  readonly attempts: readonly DeductionAttempt[];
  /** Highlighted passage keys per document (see passageKeys). */
  readonly highlights: Readonly<Record<string, readonly string[]>>;
}

export interface SaveGame {
  readonly version: typeof SAVE_VERSION;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resume: ResumePoint;
  readonly cases: Readonly<Record<string, CaseProgress>>;
  /** Closing choices made, by choice ID. Permanent for this save. */
  readonly choices: Readonly<Record<string, string>>;
}

/** Content lookups used to validate IDs found in stored data. */
export interface ContentIndex {
  readonly isKnownCase: (caseId: string) => boolean;
  readonly isKnownEvidence: (caseId: string, evidenceId: string) => boolean;
  readonly isKnownAnomaly: (anomalyId: string) => boolean;
  readonly isKnownPassage: (caseId: string, evidenceId: string, passageKey: string) => boolean;
  readonly isKnownChoice: (choiceId: string, value: string) => boolean;
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
  3: (data) => {
    const cases: RawRecord = {};
    if (isRecord(data.cases)) {
      for (const [id, entry] of Object.entries(data.cases)) {
        cases[id] = isRecord(entry) ? { ...entry, attempts: [] } : entry;
      }
    }
    return { ...data, version: 4, cases };
  },
  4: (data) => {
    const cases: RawRecord = {};
    if (isRecord(data.cases)) {
      for (const [id, entry] of Object.entries(data.cases)) {
        cases[id] = isRecord(entry) ? { ...entry, highlights: {} } : entry;
      }
    }
    return { ...data, version: 5, cases };
  },
  5: (data) => ({ ...data, version: 6, choices: {} }),
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
    case 'findings':
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

const OUTCOMES: readonly DeductionOutcome[] = ['correct', 'partial', 'incomplete', 'incorrect'];

function parseAttempts(value: unknown, caseIdValue: string, content: ContentIndex): DeductionAttempt[] {
  if (!Array.isArray(value)) return [];
  const attempts: DeductionAttempt[] = [];
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      !isIsoTimestamp(entry.submittedAt) ||
      !OUTCOMES.includes(entry.outcome as DeductionOutcome) ||
      !isRecord(entry.answers) ||
      !isRecord(entry.citations)
    ) {
      continue;
    }
    const answers: Record<string, string> = {};
    for (const [q, a] of Object.entries(entry.answers)) if (typeof a === 'string') answers[q] = a;
    const citations: Record<string, EvidenceId[]> = {};
    for (const [q, ids] of Object.entries(entry.citations)) {
      citations[q] = uniqueStrings(ids, (e) => content.isKnownEvidence(caseIdValue, e)) as EvidenceId[];
    }
    // The outcome is kept as recorded: it is the history of what was submitted.
    attempts.push({
      submittedAt: entry.submittedAt,
      outcome: entry.outcome as DeductionOutcome,
      answers,
      citations,
    });
  }
  return attempts;
}

function parseHighlights(
  value: unknown,
  caseIdValue: string,
  content: ContentIndex,
): Record<string, string[]> {
  const highlights: Record<string, string[]> = {};
  if (!isRecord(value)) return highlights;
  for (const [evidenceIdValue, keys] of Object.entries(value)) {
    if (!content.isKnownEvidence(caseIdValue, evidenceIdValue)) continue;
    // Passages removed from the content are dropped; the rest are kept.
    const kept = uniqueStrings(keys, (k) => content.isKnownPassage(caseIdValue, evidenceIdValue, k));
    if (kept.length > 0) highlights[evidenceIdValue] = kept;
  }
  return highlights;
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
      attempts: parseAttempts(entry.attempts, id, content),
      highlights: parseHighlights(entry.highlights, id, content),
    };
  }
  return cases;
}

function parseChoices(value: unknown, content: ContentIndex): Record<string, string> {
  const choices: Record<string, string> = {};
  if (!isRecord(value)) return choices;
  for (const [id, chosen] of Object.entries(value)) {
    // A choice or value no longer in the content is dropped, never guessed at.
    if (typeof chosen === 'string' && content.isKnownChoice(id, chosen)) choices[id] = chosen;
  }
  return choices;
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
      choices: parseChoices(data.choices, content),
    },
  };
}
