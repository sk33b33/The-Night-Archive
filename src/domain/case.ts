/**
 * Case domain model. Content files describe cases with these types; UI and
 * game logic read them. Nothing here depends on React.
 */
import type { DocumentEvidence, EvidenceId, EvidenceItem } from './evidence';

declare const caseIdBrand: unique symbol;
/** Stable identifier for a case, e.g. "case-001". Never reuse or rename. */
export type CaseId = string & { readonly [caseIdBrand]: true };

export function caseId(value: string): CaseId {
  return value as CaseId;
}

/** Clearance level required to open a case. Level 1 is the starting desk. */
export type AccessLevel = 1 | 2 | 3;

/** A single labelled fact from an official record, e.g. "Date: 14 October 1981". */
export interface RecordField {
  readonly label: string;
  readonly value: string;
}

export interface CaseBriefing {
  /** Short summary shown on the archive case list. */
  readonly summary: string;
  /** Instructions from the archive supervisor, one entry per paragraph. */
  readonly assignment: readonly string[];
  /** The document under review, shown on the briefing. Must be a document item. */
  readonly reportId: EvidenceId;
}

export interface CaseDefinition {
  readonly id: CaseId;
  /** Display number, e.g. "001". */
  readonly number: string;
  readonly title: string;
  readonly location: string;
  readonly accessLevel: AccessLevel;
  readonly briefing: CaseBriefing;
  /** All evidence for the case, in inventory order, including locked items. */
  readonly evidence: readonly EvidenceItem[];
}

export function findEvidence(caseFile: CaseDefinition, id: string): EvidenceItem | undefined {
  return caseFile.evidence.find((item) => item.id === id);
}

export function briefingReport(caseFile: CaseDefinition): DocumentEvidence {
  const item = findEvidence(caseFile, caseFile.briefing.reportId);
  if (item?.kind !== 'document') {
    throw new Error(`Case ${caseFile.id}: briefing report must be a document item.`);
  }
  return item;
}
