/**
 * Case domain model. Content files describe cases with these types; UI and
 * game logic read them. Nothing here depends on React.
 */
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

/** The official document the player is asked to review. */
export interface OfficialReport {
  readonly heading: string;
  readonly fields: readonly RecordField[];
  /** Report narrative, one entry per paragraph, reproduced verbatim. */
  readonly body: readonly string[];
}

export interface CaseBriefing {
  /** Short summary shown on the archive case list. */
  readonly summary: string;
  readonly report: OfficialReport;
  /** Instructions from the archive supervisor, one entry per paragraph. */
  readonly assignment: readonly string[];
}

export interface CaseDefinition {
  readonly id: CaseId;
  /** Display number, e.g. "001". */
  readonly number: string;
  readonly title: string;
  readonly location: string;
  readonly accessLevel: AccessLevel;
  readonly briefing: CaseBriefing;
}
