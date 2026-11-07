import type { RecordField } from './case';

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

export interface DocumentEvidence extends EvidenceBase {
  readonly kind: 'document';
  readonly document: DocumentContent;
}

export interface AudioEvidence extends EvidenceBase {
  readonly kind: 'audio';
  /** Catalogue details for the reel or segment. */
  readonly catalogue: readonly RecordField[];
}

export type EvidenceItem = DocumentEvidence | AudioEvidence;
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
