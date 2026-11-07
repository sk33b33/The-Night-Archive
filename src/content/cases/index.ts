import type { CaseDefinition, CaseId } from '../../domain/case';
import { CASE_001 } from './case-001';

/** All cases available in this build, in archive order. */
export const CASES: readonly CaseDefinition[] = [CASE_001];

export function findCase(id: string): CaseDefinition | undefined {
  return CASES.find((c) => c.id === id);
}

export function isKnownCaseId(id: unknown): id is CaseId {
  return typeof id === 'string' && findCase(id) !== undefined;
}
