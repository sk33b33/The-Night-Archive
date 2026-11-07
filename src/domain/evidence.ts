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

export type EvidenceItem = DocumentEvidence | AudioEvidence | PhotoEvidence | ObjectEvidence;
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

/** Applies amendments to documents and objects, leaving other kinds unchanged. */
export function withAmendments<T extends EvidenceItem>(item: T, isClosed: (caseId: CaseId) => boolean): T {
  if (item.kind === 'document' && item.amendments?.length) {
    const document = effectiveDocument(item, isClosed);
    return document === item.document ? item : { ...item, document };
  }
  if (item.kind === 'object' && item.amendments?.length) {
    const provenance = effectiveProvenance(item, isClosed);
    return provenance === item.provenance ? item : { ...item, provenance };
  }
  return item;
}

/** Whether any amendment on this item is in effect. */
export function isAmended(item: EvidenceItem, isClosed: (caseId: CaseId) => boolean): boolean {
  return (
    (item.kind === 'document' || item.kind === 'object') &&
    (item.amendments ?? []).some((a) => isClosed(a.whenCaseClosed))
  );
}

/** Every passage key the document can ever have, amendments included. */
export function allPassageKeys(item: DocumentEvidence): string[] {
  return passageKeys(effectiveDocument(item, () => true));
}
