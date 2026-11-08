import type { AudioFilter, AudioTimeline } from './audio';
import type { CaseId, RecordField } from './case';
import type { PhotoRegion } from './photoView';

/** Evidence domain model and unlock rules. Pure; no React. */

declare const evidenceIdBrand: unique symbol;
/** Stable identifier for an evidence item, unique within its case. Never reuse. */
export type EvidenceId = string & { readonly [evidenceIdBrand]: true };

export function evidenceId(value: string): EvidenceId {
  return value as EvidenceId;
}

/** A content block inside a document. Text is reproduced verbatim. */
export type DocumentBlock =
  | { readonly type: 'heading'; readonly text: string }
  | { readonly type: 'paragraph'; readonly text: string }
  | { readonly type: 'fields'; readonly fields: readonly RecordField[] }
  | {
      readonly type: 'table';
      readonly caption: string;
      readonly columns: readonly string[];
      readonly rows: readonly (readonly string[])[];
    }
  /** A later handwritten or stamped addition to the original record. */
  | { readonly type: 'annotation'; readonly text: string };

export interface DocumentContent {
  /** Short marking shown on the record, e.g. "Official record". */
  readonly stamp: string;
  readonly heading: string;
  readonly blocks: readonly DocumentBlock[];
}

/**
 * When an item becomes available to the player.
 * - initial: filed with the case from the start.
 * - discovery: revealed by a named player discovery (e.g. applying an audio
 *   filter). Discoveries are recorded in the save by ID.
 */
export type UnlockRule =
  | { readonly type: 'initial' }
  | { readonly type: 'discovery'; readonly discoveryId: string };

interface EvidenceBase {
  readonly id: EvidenceId;
  readonly title: string;
  /** Archive filing reference shown on the inventory card. */
  readonly reference: string;
  /** One-line description shown in the inventory. Must not interpret. */
  readonly description: string;
  readonly unlock: UnlockRule;
}

/**
 * A block added to a record once a condition is met: the archive's files
 * "change". Appended after the original blocks so existing passage keys,
 * and the player's highlights on them, stay valid.
 */
export type DocumentAmendment = {
  readonly id: string;
  readonly whenCaseClosed: CaseId;
} & (
  | { readonly block: DocumentBlock }
  /** Adds a row to an existing table block (by block index). */
  | { readonly appendRow: { readonly blockIndex: number; readonly row: readonly string[] } }
  /** Changes one existing table cell. Passage keys are unaffected. */
  | {
      readonly setCell: {
        readonly blockIndex: number;
        readonly row: number;
        readonly column: number;
        readonly value: string;
      };
    }
);

export interface DocumentEvidence extends EvidenceBase {
  readonly kind: 'document';
  readonly document: DocumentContent;
  readonly amendments?: readonly DocumentAmendment[];
}

export interface AudioEvidence extends EvidenceBase {
  readonly kind: 'audio';
  /** Catalogue details for the reel or segment. */
  readonly catalogue: readonly RecordField[];
  readonly timeline: AudioTimeline;
  /** Filters shown on the player. */
  readonly filters: readonly AudioFilter[];
  /** IDs of listed filters that are permanently on, e.g. on a derived clip. */
  readonly fixedFilters: readonly string[];
}

export interface PhotoEvidence extends EvidenceBase {
  readonly kind: 'photo';
  /** Key of the presentation component that draws the photograph. */
  readonly artwork: string;
  /** Full description for assistive technology. */
  readonly alt: string;
  readonly caption: string;
  readonly regions: readonly PhotoRegion[];
  readonly catalogue: readonly RecordField[];
}

/** One step in an object's chain of custody. */
export interface ProvenanceEntry {
  readonly date: string;
  readonly holder: string;
  readonly location: string;
  readonly action: string;
}

export interface ObjectEvidence extends EvidenceBase {
  readonly kind: 'object';
  /** What the object is and its condition. */
  readonly details: readonly RecordField[];
  /** Chain of custody, oldest first. */
  readonly provenance: readonly ProvenanceEntry[];
  /** Records the property store cross-references. */
  readonly linked: readonly EvidenceId[];
  /** Custody entries that appear once a case closes, placed before the rest. */
  readonly amendments?: readonly ObjectAmendment[];
}

export interface ObjectAmendment {
  readonly id: string;
  readonly whenCaseClosed: CaseId;
  readonly prependProvenance: ProvenanceEntry;
}

/** One frame of CCTV footage. */
export interface CctvFrame {
  /** Timestamp as recorded by the camera, e.g. "23:10:04". */
  readonly time: string;
  /** What the artwork should draw for this frame (artwork-specific keys). */
  readonly scene: Readonly<Record<string, string | boolean>>;
  /** Full description for assistive technology. */
  readonly description: string;
  readonly regions: readonly PhotoRegion[];
}

export interface CctvEvidence extends EvidenceBase {
  readonly kind: 'cctv';
  /** Key of the presentation component that draws each frame. */
  readonly artwork: string;
  readonly frames: readonly CctvFrame[];
  readonly catalogue: readonly RecordField[];
}

/** A room on a floor plan, as an SVG polygon on a 400×300 plan. */
export interface PlanRoom {
  readonly id: string;
  readonly label: string;
  /** SVG polygon points, e.g. "20,20 220,20 220,170 20,170". */
  readonly points: string;
  /** Where the label sits, if not the polygon's centre (e.g. to clear a room drawn over it). */
  readonly labelAt?: { readonly x: number; readonly y: number };
  /** Drawn dashed: a room that is not part of the current building. */
  readonly sealed?: boolean;
}

/** What one named record says about one room at one time step. */
export interface PlanEntry {
  readonly room: string;
  readonly text: string;
  readonly source: EvidenceId;
}

/**
 * A moment on the plan. The plan is a view of the records, never an
 * inference: a room shows a person only if an entry's source record puts
 * them there. An empty room means "no record", not "nobody".
 */
export interface PlanStep {
  readonly time: string;
  readonly label?: string;
  readonly entries: readonly PlanEntry[];
  /** Rooms drawn only at this step. */
  readonly extraRooms?: readonly PlanRoom[];
}

export interface PlanAmendment {
  readonly id: string;
  readonly whenCaseClosed: CaseId;
  readonly appendStep: PlanStep;
}

export interface PlanEvidence extends EvidenceBase {
  readonly kind: 'plan';
  readonly rooms: readonly PlanRoom[];
  readonly steps: readonly PlanStep[];
  readonly catalogue: readonly RecordField[];
  readonly amendments?: readonly PlanAmendment[];
}

/** One source on a timeline: a record, drawn as a row. */
export interface TimelineTrack {
  readonly id: string;
  readonly label: string;
  /** The record this track is read from. Absent: no such record is on file. */
  readonly source?: EvidenceId;
}

/** What one record says at one time. Times are "HH:MM" on the timeline's night. */
export interface TimelineEvent {
  readonly track: string;
  readonly time: string;
  readonly text: string;
}

export interface TimelineAmendment {
  readonly id: string;
  readonly whenCaseClosed: CaseId;
  readonly appendTrack: TimelineTrack;
  readonly events: readonly TimelineEvent[];
}

/**
 * Several records on one time axis. Like the floor plan, it is a view of
 * the records: every event belongs to a track, and every track names its
 * source.
 */
export interface TimelineEvidence extends EvidenceBase {
  readonly kind: 'timeline';
  /** Axis start and end, "HH:MM", within one calendar day. */
  readonly range: { readonly from: string; readonly to: string };
  readonly tracks: readonly TimelineTrack[];
  readonly events: readonly TimelineEvent[];
  readonly catalogue: readonly RecordField[];
  readonly amendments?: readonly TimelineAmendment[];
}

/** Minutes since midnight for "HH:MM". */
export function minutesOf(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Timeline events in time order, then track order. Pure. */
export function eventsInOrder(item: TimelineEvidence): TimelineEvent[] {
  const rank = new Map(item.tracks.map((t, i) => [t.id, i]));
  return [...item.events].sort(
    (a, b) => minutesOf(a.time) - minutesOf(b.time) || (rank.get(a.track) ?? 0) - (rank.get(b.track) ?? 0),
  );
}

export type EvidenceItem =
  | TimelineEvidence
  | DocumentEvidence
  | AudioEvidence
  | PhotoEvidence
  | ObjectEvidence
  | CctvEvidence
  | PlanEvidence;
export type EvidenceKind = EvidenceItem['kind'];

export function isUnlocked(item: EvidenceItem, discoveries: ReadonlySet<string>): boolean {
  switch (item.unlock.type) {
    case 'initial':
      return true;
    case 'discovery':
      return discoveries.has(item.unlock.discoveryId);
  }
}

/** Evidence the player can currently see, in authored order. */
export function availableEvidence(
  items: readonly EvidenceItem[],
  discoveries: Iterable<string>,
): EvidenceItem[] {
  const found = new Set(discoveries);
  return items.filter((item) => isUnlocked(item, found));
}

/** Items a discovery unlocks, in authored order. */
export function evidenceUnlockedBy(
  caseFile: { readonly evidence: readonly EvidenceItem[] },
  discoveryId: string,
): EvidenceItem[] {
  return caseFile.evidence.filter(
    (item) => item.unlock.type === 'discovery' && item.unlock.discoveryId === discoveryId,
  );
}

/** Every searchable string in a document, in reading order. */
export function documentText(doc: DocumentContent): string[] {
  const parts: string[] = [doc.heading];
  for (const block of doc.blocks) {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'annotation':
        parts.push(block.text);
        break;
      case 'fields':
        for (const field of block.fields) parts.push(field.label, field.value);
        break;
      case 'table':
        parts.push(block.caption, ...block.columns, ...block.rows.flat());
        break;
    }
  }
  return parts;
}

/**
 * Stable keys for highlightable passages: `b{block}` for paragraphs,
 * headings, and annotations; `b{block}.{n}` for a field or table row.
 * Keys follow authored order, so editing a document's block order should be
 * paired with a save migration if highlights must survive.
 */
export function passageKeys(doc: DocumentContent): string[] {
  const keys: string[] = [];
  doc.blocks.forEach((block, i) => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'annotation':
        keys.push(`b${i}`);
        break;
      case 'fields':
        block.fields.forEach((_, j) => keys.push(`b${i}.${j}`));
        break;
      case 'table':
        block.rows.forEach((_, j) => keys.push(`b${i}.${j}`));
        break;
    }
  });
  return keys;
}

/** The document as it currently reads, including amendments now in effect. */
export function effectiveDocument(
  item: DocumentEvidence,
  isClosed: (caseId: CaseId) => boolean,
): DocumentContent {
  const added = (item.amendments ?? []).filter((a) => isClosed(a.whenCaseClosed));
  if (added.length === 0) return item.document;
  const blocks = [...item.document.blocks];
  for (const amendment of added) {
    if ('block' in amendment) {
      blocks.push(amendment.block);
      continue;
    }
    if ('appendRow' in amendment) {
      // Rows are appended, so existing row passage keys keep their numbers.
      const { blockIndex, row } = amendment.appendRow;
      const target = blocks[blockIndex];
      if (target?.type === 'table') blocks[blockIndex] = { ...target, rows: [...target.rows, row] };
      continue;
    }
    const { blockIndex, row, column, value } = amendment.setCell;
    const target = blocks[blockIndex];
    if (target?.type === 'table' && target.rows[row]?.[column] !== undefined) {
      const rows = target.rows.map((r, i) => (i === row ? r.map((c, j) => (j === column ? value : c)) : r));
      blocks[blockIndex] = { ...target, rows };
    }
  }
  return { ...item.document, blocks };
}

/** The chain of custody as it currently reads, including amendments. */
export function effectiveProvenance(
  item: ObjectEvidence,
  isClosed: (caseId: CaseId) => boolean,
): readonly ProvenanceEntry[] {
  const added = (item.amendments ?? []).filter((a) => isClosed(a.whenCaseClosed));
  if (added.length === 0) return item.provenance;
  return [...added.map((a) => a.prependProvenance), ...item.provenance];
}

/** Applies amendments to documents, objects, plans and timelines, leaving other kinds unchanged. */
export function withAmendments<T extends EvidenceItem>(item: T, isClosed: (caseId: CaseId) => boolean): T {
  if (item.kind === 'document' && item.amendments?.length) {
    const document = effectiveDocument(item, isClosed);
    return document === item.document ? item : { ...item, document };
  }
  if (item.kind === 'object' && item.amendments?.length) {
    const provenance = effectiveProvenance(item, isClosed);
    return provenance === item.provenance ? item : { ...item, provenance };
  }
  if (item.kind === 'plan' && item.amendments?.length) {
    const added = item.amendments.filter((a) => isClosed(a.whenCaseClosed));
    return added.length === 0 ? item : { ...item, steps: [...item.steps, ...added.map((a) => a.appendStep)] };
  }
  if (item.kind === 'timeline' && item.amendments?.length) {
    const added = item.amendments.filter((a) => isClosed(a.whenCaseClosed));
    return added.length === 0
      ? item
      : {
          ...item,
          tracks: [...item.tracks, ...added.map((a) => a.appendTrack)],
          events: [...item.events, ...added.flatMap((a) => a.events)],
        };
  }
  return item;
}

/** Whether any amendment on this item is in effect. */
export function isAmended(item: EvidenceItem, isClosed: (caseId: CaseId) => boolean): boolean {
  return (
    (item.kind === 'document' || item.kind === 'object' || item.kind === 'plan' || item.kind === 'timeline') &&
    (item.amendments ?? []).some((a) => isClosed(a.whenCaseClosed))
  );
}

/** Every passage key the document can ever have, amendments included. */
export function allPassageKeys(item: DocumentEvidence): string[] {
  return passageKeys(effectiveDocument(item, () => true));
}
