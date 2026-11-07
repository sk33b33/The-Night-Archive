import { useCallback, useEffect, useRef, useState } from 'react';
import { CONTENT_INDEX } from '../../content/cases';
import type { CaseId } from '../../domain/case';
import { createSave, recordDiscovery, recordVisit } from '../../domain/progress';
import { migrateSave, type LoadProblem, type ResumePoint, type SaveGame } from '../../domain/save';
import type { SaveRepository } from './saveRepository';

export type SaveLoadProblem = LoadProblem | 'unavailable';

export type SaveState =
  | { readonly status: 'loading' }
  | {
      readonly status: 'ready';
      readonly save: SaveGame | null;
      /** Why an existing save could not be used, if any. */
      readonly problem: SaveLoadProblem | null;
      /** True when the last write failed; progress is only in memory. */
      readonly writeFailed: boolean;
    };

export interface SaveController {
  readonly state: SaveState;
  /**
   * Records a visit to a resumable screen, starting a new save if there is
   * none. Ignored until the stored save has finished loading.
   */
  readonly visit: (point: ResumePoint) => void;
  /** Records a discovery for a case. No-op until the save has loaded. */
  readonly discover: (caseId: CaseId, discoveryId: string) => void;
  readonly erase: () => Promise<boolean>;
}

/**
 * Owns the active save. Writes are queued so they reach storage in order.
 * A save from a newer build is never overwritten: the session continues
 * without saving and the player is told why.
 */
export function useSaveGame(repository: SaveRepository | null): SaveController {
  const [state, setState] = useState<SaveState>({ status: 'loading' });
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const saveRef = useRef<SaveGame | null>(null);
  const blockedRef = useRef(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const finish = (save: SaveGame | null, problem: SaveLoadProblem | null) => {
      if (cancelled) return;
      saveRef.current = save;
      loadedRef.current = true;
      blockedRef.current = problem === 'newer-version' || problem === 'unavailable';
      setState({ status: 'ready', save, problem, writeFailed: false });
    };
    if (!repository) {
      finish(null, 'unavailable');
      return;
    }
    repository.load().then(
      (raw) => {
        if (raw === undefined) return finish(null, null);
        const result = migrateSave(raw, CONTENT_INDEX);
        if (result.ok) finish(result.save, null);
        else finish(null, result.problem);
      },
      () => finish(null, 'unavailable'),
    );
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const commit = useCallback(
    (next: SaveGame) => {
      saveRef.current = next;
      setState((prev) =>
        prev.status === 'ready' ? { ...prev, save: next } : prev,
      );
      if (blockedRef.current || !repository) return;
      writeQueue.current = writeQueue.current
        .then(() => repository.save(next))
        .then(
          () => setState((prev) => (prev.status === 'ready' ? { ...prev, writeFailed: false } : prev)),
          () => setState((prev) => (prev.status === 'ready' ? { ...prev, writeFailed: true } : prev)),
        );
    },
    [repository],
  );

  const visit = useCallback(
    (point: ResumePoint) => {
      // Writing before the stored save has loaded could overwrite it.
      if (!loadedRef.current) return;
      const now = new Date();
      const current = saveRef.current;
      const next = recordVisit(current ?? createSave(now), point, now);
      if (next !== current) commit(next);
    },
    [commit],
  );

  const discover = useCallback(
    (caseIdValue: CaseId, discoveryId: string) => {
      if (!loadedRef.current) return;
      const now = new Date();
      const current = saveRef.current;
      const next = recordDiscovery(current ?? createSave(now), caseIdValue, discoveryId, now);
      if (next !== current) commit(next);
    },
    [commit],
  );

  const erase = useCallback(async () => {
    if (!repository || blockedRef.current) return false;
    const cleared = writeQueue.current.then(() => repository.clear());
    writeQueue.current = cleared.catch(() => undefined);
    try {
      await cleared;
    } catch {
      return false;
    }
    saveRef.current = null;
    setState({ status: 'ready', save: null, problem: null, writeFailed: false });
    return true;
  }, [repository]);

  return { state, visit, discover, erase };
}
