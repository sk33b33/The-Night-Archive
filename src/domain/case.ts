/**
 * Case domain model. Content files describe cases with these types; UI and
 * game logic read them. Nothing here depends on React.
 */
import type { BoardRule } from './board';
import type { DeductionQuestion } from './deduction';
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

/** One answer to a closing choice. Neither answer is "correct". */
export interface ChoiceOption {
  readonly value: string;
  /** The action, e.g. "Sign and file 0094". */
  readonly label: string;
  /** What choosing it does, in plain words, shown before confirming. */
  readonly consequence: string;
}

/**
 * A one-time choice offered once a case's findings are accepted. The case
 * closes only when it is made. Saved once per save; never re-asked.
 */
export interface ClosingChoice {
  readonly id: string;
  readonly heading: string;
  /** Context shown above the options. */
  readonly body: readonly string[];
  readonly options: readonly ChoiceOption[];
}

export interface CaseDefinition {
  readonly id: CaseId;
  /** Display number, e.g. "001". */
  readonly number: string;
  readonly title: string;
  readonly location: string;
  readonly accessLevel: AccessLevel;
  /** Held back until this case is closed; absent for cases open from the start. */
  readonly availableAfter?: CaseId;
  /** An Unfiled anomaly this case takes over once it is available. */
  readonly replacesAnomaly?: string;
  /** Season the case belongs to; absent means season 1. */
  readonly season?: number;
  readonly briefing: CaseBriefing;
  /** All evidence for the case, in inventory order, including locked items. */
  readonly evidence: readonly EvidenceItem[];
  /** Relationships the records support. Unlisted connections stay hypotheses. */
  readonly boardRules: readonly BoardRule[];
  /** Findings the player must establish to close the case. */
  readonly questions: readonly DeductionQuestion[];
  /** If set, the case closes only once this choice is made (after the findings hold). */
  readonly closingChoice?: ClosingChoice;
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

export function isCaseAvailable(caseFile: CaseDefinition, isClosed: (id: CaseId) => boolean): boolean {
  return caseFile.availableAfter === undefined || isClosed(caseFile.availableAfter);
}

export function seasonOf(caseFile: CaseDefinition): number {
  return caseFile.season ?? 1;
}
