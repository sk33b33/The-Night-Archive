import { describe, expect, it } from 'vitest';
import { CASE_001, CASE_001_IDS } from '../content/cases/case-001';
import {
  BOARD_SIZE,
  CARD_SIZE,
  EMPTY_BOARD,
  addLink,
  edgePoint,
  evaluateLink,
  linkKey,
  moveCard,
  positionOf,
  removeLink,
  type BoardLink,
} from './board';
import { availableEvidence } from './evidence';

const { report, roster, audioReel, timetable, maintenance, filteredSegment } = CASE_001_IDS;
const rules = CASE_001.boardRules;

describe('board connections', () => {
  const link: BoardLink = { from: report, to: roster, relation: 'contradicts' };

  it('adds connections and rejects self-links and duplicates', () => {
    const added = addLink(EMPTY_BOARD, link);
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(added.board.links).toHaveLength(1);
    expect(addLink(added.board, link)).toEqual({ ok: false, reason: 'duplicate' });
    expect(addLink(EMPTY_BOARD, { ...link, to: report })).toEqual({ ok: false, reason: 'same-item' });
  });

  it('treats undirected relations the same in either direction', () => {
    const reversed: BoardLink = { from: roster, to: report, relation: 'contradicts' };
    expect(linkKey(reversed)).toBe(linkKey(link));
    const added = addLink(EMPTY_BOARD, link);
    expect(added.ok && addLink(added.board, reversed)).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('keeps direction for directed relations', () => {
    const a: BoardLink = { from: filteredSegment, to: audioReel, relation: 'derived-from' };
    const b: BoardLink = { from: audioReel, to: filteredSegment, relation: 'derived-from' };
    expect(linkKey(a)).not.toBe(linkKey(b));
  });

  it('removes a connection by key and is a no-op for unknown keys', () => {
    const added = addLink(EMPTY_BOARD, link);
    if (!added.ok) throw new Error('add failed');
    expect(removeLink(added.board, linkKey(link)).links).toEqual([]);
    expect(removeLink(added.board, 'nope')).toBe(added.board);
  });
});

describe('Case 001 board rules', () => {
  it('supports the authored relationships in either direction where undirected', () => {
    expect(evaluateLink(rules, { from: report, to: roster, relation: 'contradicts' }).status).toBe(
      'supported',
    );
    expect(evaluateLink(rules, { from: roster, to: report, relation: 'contradicts' }).status).toBe(
      'supported',
    );
    expect(evaluateLink(rules, { from: timetable, to: audioReel, relation: 'corroborates' }).status).toBe(
      'supported',
    );
    expect(
      evaluateLink(rules, { from: maintenance, to: audioReel, relation: 'same-subject' }).status,
    ).toBe('supported');
    expect(evaluateLink(rules, { from: report, to: audioReel, relation: 'omits' }).status).toBe(
      'supported',
    );
  });

  it('keeps unsupported or wrongly labelled connections as hypotheses', () => {
    expect(evaluateLink(rules, { from: report, to: roster, relation: 'corroborates' })).toEqual({
      status: 'hypothesis',
    });
    expect(evaluateLink(rules, { from: audioReel, to: report, relation: 'omits' })).toEqual({
      status: 'hypothesis',
    });
    expect(evaluateLink(rules, { from: timetable, to: maintenance, relation: 'contradicts' })).toEqual({
      status: 'hypothesis',
    });
  });

  it('every rule refers to real evidence and gives a reason', () => {
    const ids = new Set(CASE_001.evidence.map((e) => e.id));
    for (const rule of rules) {
      expect(ids.has(rule.from) && ids.has(rule.to)).toBe(true);
      expect(rule.from).not.toBe(rule.to);
      expect(rule.reason.length).toBeGreaterThan(20);
    }
    expect(new Set(rules.map(linkKey)).size).toBe(rules.length);
  });

  it('no rule asserts who the caller was', () => {
    for (const rule of rules) expect(rule.reason).not.toMatch(/was the caller|is the caller|Mara (was|is)/i);
  });

  it('initial evidence alone supports most rules (filtered segment rules need the discovery)', () => {
    const initial = new Set<string>(availableEvidence(CASE_001.evidence, []).map((e) => e.id));
    const reachable = rules.filter((r) => initial.has(r.from) && initial.has(r.to));
    expect(reachable.length).toBe(4);
  });
});

describe('board layout', () => {
  it('places unmoved cards on a default grid inside the board', () => {
    for (let i = 0; i < 8; i++) {
      const p = positionOf(EMPTY_BOARD, report, i);
      expect(p.x + CARD_SIZE.width).toBeLessThanOrEqual(BOARD_SIZE.width);
      expect(p.y + CARD_SIZE.height).toBeLessThanOrEqual(BOARD_SIZE.height);
    }
  });

  it('moves cards, clamps them to the board, and skips no-op moves', () => {
    const moved = moveCard(EMPTY_BOARD, report, { x: 100.4, y: 50.6 });
    expect(moved.positions[report]).toEqual({ x: 100, y: 51 });
    expect(moveCard(moved, report, { x: 100, y: 51 })).toBe(moved);
    expect(moveCard(EMPTY_BOARD, report, { x: -50, y: 9999 }).positions[report]).toEqual({
      x: 0,
      y: BOARD_SIZE.height - CARD_SIZE.height,
    });
  });

  it('finds where a line leaves a card edge', () => {
    expect(edgePoint({ x: 0, y: 0 }, { x: 300, y: 0 })).toEqual({ x: CARD_SIZE.width / 2, y: 0 });
    expect(edgePoint({ x: 0, y: 0 }, { x: 0, y: -300 })).toEqual({ x: 0, y: -CARD_SIZE.height / 2 });
    expect(edgePoint({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
  });
});
