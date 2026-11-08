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
  | { readonly type: 'discovery'; readonly discoveryId: string }
  /** A record that comes on file once a case is closed (an end beat). */
  | { readonly type: 'caseClosed'; readonly caseId: CaseId };

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
  /** Also requires this closing choice to have been made with this value. */
  readonly whenChoice?: { readonly id: string; readonly value: string };
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

/** One person's line in a staff register. */
export interface RegisterEntry {
  readonly name: string;
  readonly post: string;
  readonly from: string;
  readonly to: string;
}

/** A staff register searched by the cross-reference. Its source is the register as a document. */
export interface StaffRegister {
  readonly id: string;
  readonly label: string;
  readonly source: EvidenceId;
  readonly entries: readonly RegisterEntry[];
}

/**
 * Several staff registers searched at once by surname or initial. A view of
 * the registers, which stay readable on their own.
 */
export interface RegistryEvidence extends EvidenceBase {
  readonly kind: 'registry';
  readonly registers: readonly StaffRegister[];
  /** Searching this whole word, with at least one entry found, records the discovery. */
  readonly revealsOnSearch?: { readonly term: string; readonly discovery: string };
  readonly catalogue: readonly RecordField[];
}

/** Lower-case whole words of a name or query; punctuation is ignored. */
export function nameTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export interface RegisterResult {
  readonly register: StaffRegister;
  readonly matches: readonly RegisterEntry[];
}

/**
 * Whole-word search: every word of the query must be a whole word of the
 * name, so "Ward" finds "E. Ward" but not "E. Warden" or "H. Edwards".
 * Returns one result per register, in authored order, matches or not.
 */
export function searchRegisters(item: RegistryEvidence, query: string): RegisterResult[] {
  const words = nameTokens(query);
  return item.registers.map((register) => ({
    register,
    matches:
      words.length === 0
        ? []
        : register.entries.filter((entry) => {
            const name = nameTokens(entry.name);
            return words.every((w) => name.includes(w));
          }),
  }));
}

/** The discovery a search records, if any. */
export function searchDiscovery(item: RegistryEvidence, query: string): string | undefined {
  const reveal = item.revealsOnSearch;
  if (!reveal || !nameTokens(query).includes(reveal.term.toLowerCase())) return undefined;
  return searchRegisters(item, query).some((r) => r.matches.length > 0) ? reveal.discovery : undefined;
}

export type EvidenceItem =
  | RegistryEvidence
  | TimelineEvidence
  | DocumentEvidence
  | AudioEvidence
  | PhotoEvidence
  | ObjectEvidence
  | CctvEvidence
  | PlanEvidence;
export type EvidenceKind = EvidenceItem['kind'];

export function isUnlocked(
  item: EvidenceItem,
  discoveries: ReadonlySet<string>,
  isClosed: (caseId: CaseId) => boolean = () => false,
): boolean {
  switch (item.unlock.type) {
    case 'initial':
      return true;
    case 'discovery':
      return discoveries.has(item.unlock.discoveryId);
    case 'caseClosed':
      return isClosed(item.unlock.caseId);
  }
}

/** Evidence the player can currently see, in authored order. */
export function availableEvidence(
  items: readonly EvidenceItem[],
  discoveries: Iterable<string>,
  isClosed: (caseId: CaseId) => boolean = () => false,
): EvidenceItem[] {
  const found = new Set(discoveries);
  return items.filter((item) => isUnlocked(item, found, isClosed));
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
/** Whether a closing choice was made with a given value. */
export type ChoseFn = (choiceId: string, value: string) => boolean;
const NO_CHOICES: ChoseFn = () => false;

function documentAmendmentApplies(a: DocumentAmendment, isClosed: (caseId: CaseId) => boolean, chose: ChoseFn): boolean {
  return isClosed(a.whenCaseClosed) && (!a.whenChoice || chose(a.whenChoice.id, a.whenChoice.value));
}

export function effectiveDocument(
  item: DocumentEvidence,
  isClosed: (caseId: CaseId) => boolean,
  chose: ChoseFn = NO_CHOICES,
): DocumentContent {
  const added = (item.amendments ?? []).filter((a) => documentAmendmentApplies(a, isClosed, chose));
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
export function withAmendments<T extends EvidenceItem>(
  item: T,
  isClosed: (caseId: CaseId) => boolean,
  chose: ChoseFn = NO_CHOICES,
): T {
  if (item.kind === 'document' && item.amendments?.length) {
    const document = effectiveDocument(item, isClosed, chose);
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

/**
 * Whether the record has changed since the case was first read: an
 * amendment is in effect, or it came on file when a case closed.
 */
export function isAmended(
  item: EvidenceItem,
  isClosed: (caseId: CaseId) => boolean,
  chose: ChoseFn = NO_CHOICES,
): boolean {
  if (item.unlock.type === 'caseClosed' && isClosed(item.unlock.caseId)) return true;
  if (item.kind === 'document') return (item.amendments ?? []).some((a) => documentAmendmentApplies(a, isClosed, chose));
  return (
    (item.kind === 'object' || item.kind === 'plan' || item.kind === 'timeline') &&
    (item.amendments ?? []).some((a) => isClosed(a.whenCaseClosed))
  );
}

/** Every passage key the document can ever have, amendments included. */
export function allPassageKeys(item: DocumentEvidence): string[] {
  // Every branch of every choice, so a highlight on any version stays valid.
  return passageKeys(effectiveDocument(item, () => true, () => true));
}
