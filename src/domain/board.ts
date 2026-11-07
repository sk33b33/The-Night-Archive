import type { EvidenceId } from './evidence';

/**
 * Evidence board: card positions and player-made connections. Connections
 * are evaluated against authored rules: a match is "supported" by the
 * records; anything else stays a "hypothesis". Wrong connections are never
 * penalised and never block progress. Pure; no React.
 */

export const RELATIONS = {
  contradicts: { label: 'Contradicts', directed: false },
  corroborates: { label: 'Corroborates', directed: false },
  'same-subject': { label: 'Same subject', directed: false },
  omits: { label: 'Leaves out', directed: true },
  'derived-from': { label: 'Derived from', directed: true },
} as const;

export type RelationType = keyof typeof RELATIONS;

export function isRelationType(value: unknown): value is RelationType {
  return typeof value === 'string' && Object.hasOwn(RELATIONS, value);
}

export interface BoardPosition {
  readonly x: number;
  readonly y: number;
}

export interface BoardLink {
  readonly from: EvidenceId;
  readonly to: EvidenceId;
  readonly relation: RelationType;
}

export interface BoardState {
  readonly positions: Readonly<Record<string, BoardPosition>>;
  readonly links: readonly BoardLink[];
}

/** An authored, evidence-supported relationship and why it holds. */
export interface BoardRule {
  readonly from: EvidenceId;
  readonly to: EvidenceId;
  readonly relation: RelationType;
  /** Plain statement of what the records show. No conclusions beyond them. */
  readonly reason: string;
}

export type LinkEvaluation =
  | { readonly status: 'supported'; readonly reason: string }
  | { readonly status: 'hypothesis' };

export const EMPTY_BOARD: BoardState = { positions: {}, links: [] };

/** Logical canvas size and card size, in board units (CSS pixels at 1×). */
export const BOARD_SIZE = { width: 980, height: 660 } as const;
export const CARD_SIZE = { width: 200, height: 92 } as const;

/** Canonical endpoint order for undirected relations, used for comparison. */
export function normaliseLink(link: BoardLink): BoardLink {
  if (RELATIONS[link.relation].directed || link.from <= link.to) return link;
  return { ...link, from: link.to, to: link.from };
}

export function linkKey(link: BoardLink): string {
  const n = normaliseLink(link);
  return `${n.from}|${n.relation}|${n.to}`;
}

export type AddLinkResult =
  | { readonly ok: true; readonly board: BoardState }
  | { readonly ok: false; readonly reason: 'same-item' | 'duplicate' };

export function addLink(board: BoardState, link: BoardLink): AddLinkResult {
  if (link.from === link.to) return { ok: false, reason: 'same-item' };
  const key = linkKey(link);
  if (board.links.some((l) => linkKey(l) === key)) return { ok: false, reason: 'duplicate' };
  // Stored as entered so the player's wording is kept; comparisons use linkKey.
  return { ok: true, board: { ...board, links: [...board.links, link] } };
}

export function removeLink(board: BoardState, key: string): BoardState {
  const links = board.links.filter((l) => linkKey(l) !== key);
  return links.length === board.links.length ? board : { ...board, links };
}

export function clampPosition(position: BoardPosition): BoardPosition {
  const clamp = (v: number, max: number) => Math.round(Math.min(Math.max(v, 0), max));
  return {
    x: clamp(position.x, BOARD_SIZE.width - CARD_SIZE.width),
    y: clamp(position.y, BOARD_SIZE.height - CARD_SIZE.height),
  };
}

export function moveCard(board: BoardState, id: EvidenceId, position: BoardPosition): BoardState {
  const next = clampPosition(position);
  const current = board.positions[id];
  if (current && current.x === next.x && current.y === next.y) return board;
  return { ...board, positions: { ...board.positions, [id]: next } };
}

/** Default grid placement for cards the player has not moved. */
export function defaultPosition(index: number): BoardPosition {
  const columns = 4;
  return {
    x: 24 + (index % columns) * 240,
    y: 32 + Math.floor(index / columns) * 200 + (index % 2) * 40,
  };
}

export function positionOf(board: BoardState, id: EvidenceId, index: number): BoardPosition {
  return board.positions[id] ?? defaultPosition(index);
}

export function evaluateLink(rules: readonly BoardRule[], link: BoardLink): LinkEvaluation {
  const key = linkKey(link);
  const rule = rules.find((r) => linkKey(r) === key);
  return rule ? { status: 'supported', reason: rule.reason } : { status: 'hypothesis' };
}

/** Human-readable sentence for a link, e.g. "Incident report contradicts Duty roster". */
export function describeLink(link: BoardLink, titleOf: (id: EvidenceId) => string): string {
  return `${titleOf(link.from)} — ${RELATIONS[link.relation].label.toLowerCase()} — ${titleOf(link.to)}`;
}

/**
 * Where the line from `from`'s centre towards `to`'s centre leaves the card
 * rectangle around `from`. Used so connection lines and arrows meet card edges.
 */
export function edgePoint(
  from: BoardPosition,
  to: BoardPosition,
  half: { readonly width: number; readonly height: number } = {
    width: CARD_SIZE.width / 2,
    height: CARD_SIZE.height / 2,
  },
): BoardPosition {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return from;
  const scale = Math.min(
    dx === 0 ? Infinity : half.width / Math.abs(dx),
    dy === 0 ? Infinity : half.height / Math.abs(dy),
  );
  return { x: from.x + dx * scale, y: from.y + dy * scale };
}

export function cardCentre(position: BoardPosition): BoardPosition {
  return { x: position.x + CARD_SIZE.width / 2, y: position.y + CARD_SIZE.height / 2 };
}
