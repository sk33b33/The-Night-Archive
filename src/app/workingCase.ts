import type { CaseDefinition, CaseId } from '../domain/case';
import { availableEvidence, type EvidenceId } from '../domain/evidence';
import type { CaseStatus } from '../domain/progress';
import type { SaveGame } from '../domain/save';

/**
 * The case you are working, for the room's case objects (folder, corkboard,
 * clipboard, monitor). Pure.
 *
 * The case you last opened this session wins. Otherwise it is the most
 * recently started case that is still open, so a fresh session picks up
 * where the save left off. With nothing in progress there is no case.
 */
export function workingCase(
  save: SaveGame | null,
  available: readonly CaseDefinition[],
  statusOf: (id: CaseId) => CaseStatus,
  remembered: string | null,
): CaseDefinition | null {
  const rememberedCase = available.find((c) => c.id === remembered);
  if (rememberedCase) return rememberedCase;
  if (!save) return null;
  const inProgress = available
    .filter((c) => save.cases[c.id] && statusOf(c.id) === 'opened')
    .sort((a, b) => (save.cases[b.id]?.firstOpenedAt ?? '').localeCompare(save.cases[a.id]?.firstOpenedAt ?? ''));
  return inProgress[0] ?? null;
}

/** The first CCTV footage the player can open in a case, if any. */
export function footageOf(
  caseFile: CaseDefinition,
  save: SaveGame | null,
  isClosed: (id: CaseId) => boolean,
): EvidenceId | null {
  const discoveries = save?.cases[caseFile.id]?.discoveries ?? [];
  return availableEvidence(caseFile.evidence, discoveries, isClosed).find((e) => e.kind === 'cctv')?.id ?? null;
}
