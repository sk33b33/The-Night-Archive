import type { CaseId } from './case';
import type { EvidenceId } from './evidence';
import { SAVE_VERSION, type CaseProgress, type ResumePoint, type SaveGame } from './save';

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

export function caseProgress(save: SaveGame | null, id: CaseId): CaseProgress | undefined {
  return save?.cases[id];
}

export function isExamined(save: SaveGame | null, caseIdValue: CaseId, id: EvidenceId): boolean {
  return save?.cases[caseIdValue]?.examined.includes(id) ?? false;
}

function newCaseProgress(stamp: string): CaseProgress {
  return { status: 'opened', firstOpenedAt: stamp, examined: [], discoveries: [] };
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
