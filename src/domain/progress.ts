import type { CaseId } from './case';
import { SAVE_VERSION, type ResumePoint, type SaveGame } from './save';

/** Game-progress rules. Pure functions: each returns a new SaveGame. */

export type CaseStatus = 'new' | 'opened';

export function createSave(now: Date): SaveGame {
  const stamp = now.toISOString();
  return {
    version: SAVE_VERSION,
    createdAt: stamp,
    updatedAt: stamp,
    resume: { screen: 'archive' },
    cases: {},
  };
}

export function caseStatus(save: SaveGame | null, id: CaseId): CaseStatus {
  return save?.cases[id] ? 'opened' : 'new';
}

function sameResume(a: ResumePoint, b: ResumePoint): boolean {
  if (a.screen !== b.screen) return false;
  return a.screen !== 'briefing' || (b.screen === 'briefing' && a.caseId === b.caseId);
}

/**
 * Records that the player is now on a resumable screen. Opening a briefing
 * marks the case as opened the first time. Returns the same object when
 * nothing changed, so callers can skip a write.
 */
export function recordVisit(save: SaveGame, point: ResumePoint, now: Date): SaveGame {
  const newlyOpened = point.screen === 'briefing' && !save.cases[point.caseId];
  if (sameResume(save.resume, point) && !newlyOpened) return save;

  const stamp = now.toISOString();
  return {
    ...save,
    updatedAt: stamp,
    resume: point,
    cases: newlyOpened
      ? { ...save.cases, [point.caseId]: { status: 'opened', firstOpenedAt: stamp } }
      : save.cases,
  };
}
