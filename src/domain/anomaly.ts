import type { CaseId, RecordField } from './case';
import type { PhotoRegion } from './photoView';

/**
 * Anomalies: items that appear in the archive without an intake record.
 * They are presented, never explained. Pure data and rules; no React.
 */
export interface AnomalyPhotograph {
  /** Key of the presentation component that draws the photograph. */
  readonly artwork: 'workstation';
  /** Which view of the workstation: the 1981 night view, or the pre-dawn view. */
  readonly variant?: 'night' | 'predawn';
  /**
   * The date imprinted on the photograph itself, or TONIGHT for the date
   * of the player's own session (read from the device clock when shown).
   */
  readonly dateStamp: string;
  /** Full description for assistive technology. */
  readonly alt: string;
  readonly caption: string;
  /** Marked areas the player can examine. Observations only. */
  readonly regions: readonly PhotoRegion[];
}

export interface Anomaly {
  readonly id: string;
  readonly title: string;
  /** Appears once this case is closed. */
  readonly appearsAfterClosing: CaseId;
  readonly fields: readonly RecordField[];
  readonly photograph: AnomalyPhotograph;
  /** A separate archive record shown alongside, without comment. */
  readonly register: {
    /** Short marking on the record, e.g. "Asset register". */
    readonly stamp: string;
    readonly heading: string;
    readonly fields: readonly RecordField[];
  };
  readonly note: string;
}

export function visibleAnomalies(
  anomalies: readonly Anomaly[],
  isClosed: (caseId: CaseId) => boolean,
): Anomaly[] {
  return anomalies.filter((a) => isClosed(a.appearsAfterClosing));
}

/** Sentinel for an imprint dated with the player's own night. */
export const TONIGHT = 'TONIGHT';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Formats a date the way a camera imprint does, e.g. "08 NOV 2026". */
export function imprintDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()] ?? ''} ${date.getFullYear()}`;
}

/** The imprint to draw, resolving TONIGHT against `now`. */
export function resolveDateStamp(stamp: string, now: Date): string {
  return stamp === TONIGHT ? imprintDate(now) : stamp;
}

/** Replaces {date} in authored text with the resolved imprint. */
export function withDate(text: string, stamp: string, now: Date): string {
  return text.split('{date}').join(resolveDateStamp(stamp, now));
}
