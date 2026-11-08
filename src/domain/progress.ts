import type { CaseId } from './case';
import { EMPTY_BOARD, type BoardState } from './board';
import { isSolved, type DeductionAttempt } from './deduction';
import type { EvidenceId } from './evidence';
import { SAVE_VERSION, type CaseProgress, type ResumePoint, type SaveGame } from './save';

/** Game-progress rules. Pure functions: each returns a new SaveGame. */

export type CaseStatus = 'new' | 'opened' | 'closed';

export function createSave(now: Date): SaveGame {
  const stamp = now.toISOString();
  return {
    version: SAVE_VERSION,
    createdAt: stamp,
    updatedAt: stamp,
    resume: { screen: 'archive' },
    cases: {},
    choices: {},
  };
}

/**
 * A case is closed once its findings hold, and, for a case with a closing
 * choice, once that choice is made.
 */
export function caseStatus(save: SaveGame | null, id: CaseId, closingChoiceId?: string): CaseStatus {
  const progress = save?.cases[id];
  if (!progress) return 'new';
  if (!isSolved(progress.attempts)) return 'opened';
  if (closingChoiceId !== undefined && save?.choices[closingChoiceId] === undefined) return 'opened';
  return 'closed';
}

/** The value chosen for a closing choice, if made. */
export function choiceOf(save: SaveGame | null, choiceId: string): string | undefined {
  return save?.choices[choiceId];
}

/** Records a closing choice. Made once: a second call returns the save unchanged. */
export function recordChoice(save: SaveGame, choiceId: string, value: string, now: Date): SaveGame {
  if (save.choices[choiceId] !== undefined) return save;
  return { ...save, updatedAt: now.toISOString(), choices: { ...save.choices, [choiceId]: value } };
}

export function caseProgress(save: SaveGame | null, id: CaseId): CaseProgress | undefined {
  return save?.cases[id];
}

export function isExamined(save: SaveGame | null, caseIdValue: CaseId, id: EvidenceId): boolean {
  return save?.cases[caseIdValue]?.examined.includes(id) ?? false;
}

function newCaseProgress(stamp: string): CaseProgress {
  return {
    status: 'opened',
    firstOpenedAt: stamp,
    examined: [],
    discoveries: [],
    board: EMPTY_BOARD,
    attempts: [],
    highlights: {},
  };
}

function sameResume(a: ResumePoint, b: ResumePoint): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Applies a visit's effect on one case's progress, or returns it unchanged. */
function visitCase(
  progress: CaseProgress | undefined,
  point: ResumePoint,
  stamp: string,
): CaseProgress {
  const base: CaseProgress = progress ?? newCaseProgress(stamp);
  if (point.screen === 'evidence' && !base.examined.includes(point.evidenceId)) {
    return { ...base, examined: [...base.examined, point.evidenceId] };
  }
  return base;
}

/**
 * Records that the player is now on a resumable screen. Entering any case
 * screen marks the case opened; opening an evidence item marks it examined.
 * Returns the same object when nothing changed, so callers can skip a write.
 */
export function recordVisit(save: SaveGame, point: ResumePoint, now: Date): SaveGame {
  const stamp = now.toISOString();
  let cases = save.cases;
  if (point.screen !== 'archive') {
    const before = save.cases[point.caseId];
    const after = visitCase(before, point, stamp);
    if (after !== before) cases = { ...save.cases, [point.caseId]: after };
  }
  if (cases === save.cases && sameResume(save.resume, point)) return save;
  return { ...save, updatedAt: stamp, resume: point, cases };
}

/**
 * Records a discovery for a case. Discoveries are permanent and can unlock
 * evidence (see UnlockRule). Returns the same save if already recorded.
 */
export function recordDiscovery(
  save: SaveGame,
  caseIdValue: CaseId,
  discoveryId: string,
  now: Date,
): SaveGame {
  const stamp = now.toISOString();
  const before = save.cases[caseIdValue];
  if (before?.discoveries.includes(discoveryId)) return save;
  const base: CaseProgress = before ?? newCaseProgress(stamp);
  return {
    ...save,
    updatedAt: stamp,
    cases: { ...save.cases, [caseIdValue]: { ...base, discoveries: [...base.discoveries, discoveryId] } },
  };
}

/** Applies a board change for a case. Returns the same save if nothing changed. */
export function updateBoard(
  save: SaveGame,
  caseIdValue: CaseId,
  change: (board: BoardState) => BoardState,
  now: Date,
): SaveGame {
  const stamp = now.toISOString();
  const before = save.cases[caseIdValue] ?? newCaseProgress(stamp);
  const board = change(before.board);
  if (board === before.board) return save;
  return {
    ...save,
    updatedAt: stamp,
    cases: { ...save.cases, [caseIdValue]: { ...before, board } },
  };
}

/** Appends a deduction attempt. Attempts are never edited or removed. */
export function recordAttempt(save: SaveGame, caseIdValue: CaseId, attempt: DeductionAttempt): SaveGame {
  const before = save.cases[caseIdValue] ?? newCaseProgress(attempt.submittedAt);
  return {
    ...save,
    updatedAt: attempt.submittedAt,
    cases: {
      ...save.cases,
      [caseIdValue]: { ...before, attempts: [...before.attempts, attempt] },
    },
  };
}

/** Turns a passage highlight on or off. Returns the same save if unchanged. */
export function setHighlight(
  save: SaveGame,
  caseIdValue: CaseId,
  evidenceIdValue: EvidenceId,
  passageKey: string,
  on: boolean,
  now: Date,
): SaveGame {
  const stamp = now.toISOString();
  const before = save.cases[caseIdValue] ?? newCaseProgress(stamp);
  const current = before.highlights[evidenceIdValue] ?? [];
  if (current.includes(passageKey) === on) return save;
  const next = on ? [...current, passageKey] : current.filter((k) => k !== passageKey);
  const others = Object.entries(before.highlights).filter(([id]) => id !== evidenceIdValue);
  const highlights = Object.fromEntries(next.length > 0 ? [...others, [evidenceIdValue, next]] : others);
  return {
    ...save,
    updatedAt: stamp,
    cases: { ...save.cases, [caseIdValue]: { ...before, highlights } },
  };
}

/** Removes every highlight on one document. */
export function clearHighlights(
  save: SaveGame,
  caseIdValue: CaseId,
  evidenceIdValue: EvidenceId,
  now: Date,
): SaveGame {
  const before = save.cases[caseIdValue];
  if (!before?.highlights[evidenceIdValue]) return save;
  const highlights = Object.fromEntries(
    Object.entries(before.highlights).filter(([id]) => id !== evidenceIdValue),
  );
  return {
    ...save,
    updatedAt: now.toISOString(),
    cases: { ...save.cases, [caseIdValue]: { ...before, highlights } },
  };
}
