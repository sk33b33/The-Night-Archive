import type { DeductionSubmission } from '../../domain/deduction';
import type { EvidenceId } from '../../domain/evidence';
import type { KeyValueStore } from '../preferences/preferences';

/**
 * Unsubmitted findings, kept per case in sessionStorage so a refresh does
 * not lose the player's answers. Only submitted attempts go into the save.
 */
const key = (caseId: string) => `night-archive:findings-draft:${caseId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseDraft(raw: string | null): DeductionSubmission | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || !isRecord(data.answers) || !isRecord(data.citations)) return null;
  const answers: Record<string, string> = {};
  for (const [q, a] of Object.entries(data.answers)) if (typeof a === 'string') answers[q] = a;
  const citations: Record<string, EvidenceId[]> = {};
  for (const [q, ids] of Object.entries(data.citations)) {
    if (Array.isArray(ids)) {
      citations[q] = ids.filter((id): id is EvidenceId => typeof id === 'string');
    }
  }
  return { answers, citations };
}

export function loadDraft(store: KeyValueStore | undefined, caseId: string): DeductionSubmission | null {
  try {
    return store ? parseDraft(store.getItem(key(caseId))) : null;
  } catch {
    return null;
  }
}

export function saveDraft(
  store: (KeyValueStore & { removeItem(key: string): void }) | undefined,
  caseId: string,
  draft: DeductionSubmission | null,
): void {
  try {
    if (!store) return;
    if (draft) store.setItem(key(caseId), JSON.stringify(draft));
    else store.removeItem(key(caseId));
  } catch {
    // Storage blocked or full: the draft simply is not kept.
  }
}

export function sessionStore(): (KeyValueStore & { removeItem(key: string): void }) | undefined {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
}
