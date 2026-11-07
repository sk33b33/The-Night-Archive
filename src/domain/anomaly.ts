import type { CaseId, RecordField } from './case';

/**
 * Anomalies: items that appear in the archive without an intake record.
 * They are presented, never explained. Pure data and rules; no React.
 */
export interface AnomalyPhotograph {
  /** Key of the presentation component that draws the photograph. */
  readonly artwork: 'workstation';
  /** The date imprinted on the photograph itself. */
  readonly dateStamp: string;
  /** Full description for assistive technology. */
  readonly alt: string;
  readonly caption: string;
}

export interface Anomaly {
  readonly id: string;
  readonly title: string;
  /** Appears once this case is closed. */
  readonly appearsAfterClosing: CaseId;
  readonly fields: readonly RecordField[];
  readonly photograph: AnomalyPhotograph;
  /** A separate archive record shown alongside, without comment. */
  readonly register: { readonly heading: string; readonly fields: readonly RecordField[] };
  readonly note: string;
}

export function visibleAnomalies(
  anomalies: readonly Anomaly[],
  isClosed: (caseId: CaseId) => boolean,
): Anomaly[] {
  return anomalies.filter((a) => isClosed(a.appearsAfterClosing));
}
