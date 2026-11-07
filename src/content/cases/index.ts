import { findEvidence, type CaseDefinition, type CaseId } from '../../domain/case';
import { allPassageKeys, type EvidenceId } from '../../domain/evidence';
import type { ContentIndex } from '../../domain/save';
import { findAnomaly } from '../anomalies/file-0091';
import { CASE_001 } from './case-001';
import { CASE_002 } from './case-002';
import { CASE_003 } from './case-003';
import { CASE_004 } from './case-004';

/** All cases available in this build, in archive order. */
export const CASES: readonly CaseDefinition[] = [CASE_001, CASE_002, CASE_003, CASE_004];

export function findCase(id: string): CaseDefinition | undefined {
  return CASES.find((c) => c.id === id);
}

export function isKnownCaseId(id: unknown): id is CaseId {
  return typeof id === 'string' && findCase(id) !== undefined;
}

export function isKnownEvidenceId(caseIdValue: string, id: unknown): id is EvidenceId {
  const caseFile = findCase(caseIdValue);
  return typeof id === 'string' && caseFile !== undefined && findEvidence(caseFile, id) !== undefined;
}

/** Lookups the save and navigation layers use to validate stored IDs. */
export const CONTENT_INDEX: ContentIndex = {
  isKnownCase: isKnownCaseId,
  isKnownEvidence: isKnownEvidenceId,
  isKnownAnomaly: (id) => findAnomaly(id) !== undefined,
  isKnownPassage: (caseIdValue, evidenceIdValue, key) => {
    const caseFile = findCase(caseIdValue);
    const item = caseFile && findEvidence(caseFile, evidenceIdValue);
    return item?.kind === 'document' && allPassageKeys(item).includes(key);
  },
};
