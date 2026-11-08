import { describe, expect, it } from 'vitest';
import { caseId, type CaseDefinition } from '../domain/case';
import {
  encodeOrder,
  encodeSelection,
  evaluateDeduction,
  isMulti,
  isNumber,
  isOrdering,
  type DeductionSubmission,
} from '../domain/deduction';
import { isUnlocked, nameTokens, type EvidenceItem } from '../domain/evidence';
import { ANOMALIES } from './anomalies/file-0091';
import { CASES } from './cases';

/**
 * Season-wide integrity: every case can actually be finished, using only
 * evidence the player can reach inside that case. Guards against content
 * edits that silently make a case unsolvable.
 */

/** Discoveries an available item can produce on its own or by matching another available item. */
function discoveriesFrom(items: readonly EvidenceItem[]): Set<string> {
  const found = new Set<string>();
  for (const item of items) {
    if (item.kind === 'photo') {
      for (const region of item.regions) {
        if (region.revealsDiscovery) found.add(region.revealsDiscovery);
        if (region.revealsOnMatch) {
          const partner = items.some(
            (other) => other.id !== item.id && other.kind === 'photo' && other.regions.some((r) => r.id === region.id),
          );
          if (partner) found.add(region.revealsOnMatch);
        }
      }
    }
    if (item.kind === 'registry' && item.revealsOnSearch) {
      // Searching the term finds something if any register has that whole word in a name.
      const term = item.revealsOnSearch.term.toLowerCase();
      const hit = item.registers.some((r) => r.entries.some((e) => nameTokens(e.name).includes(term)));
      if (hit) found.add(item.revealsOnSearch.discovery);
    }
    if (item.kind === 'cctv') {
      for (const frame of item.frames) for (const r of frame.regions) if (r.revealsDiscovery) found.add(r.revealsDiscovery);
    }
    if (item.kind === 'audio') {
      const filterIds = new Set(item.filters.map((f) => f.id));
      for (const segment of item.timeline.segments) {
        for (const line of segment.lines) {
          // A line is reachable if it needs no filter, or a filter this item offers.
          const reachable = !line.condition || !line.condition.applied || filterIds.has(line.condition.filterId);
          if (reachable && line.revealsDiscovery) found.add(line.revealsDiscovery);
        }
        if (segment.revealsOnMatch) {
          const partner = items.some(
            (other) =>
              other.id !== item.id && other.kind === 'audio' && other.timeline.segments.some((s) => s.id === segment.id),
          );
          if (partner) found.add(segment.revealsOnMatch);
        }
      }
    }
  }
  return found;
}

/** Evidence reachable in a case: initial items plus everything discoveries unlock, to a fixed point. */
function reachableEvidence(caseFile: CaseDefinition): EvidenceItem[] {
  let discoveries = new Set<string>();
  let available = caseFile.evidence.filter((e) => isUnlocked(e, discoveries));
  for (;;) {
    discoveries = discoveriesFrom(available);
    const next = caseFile.evidence.filter((e) => isUnlocked(e, discoveries));
    if (next.length === available.length) return next;
    available = next;
  }
}

/** The answers and minimal citations each question's content declares as supported. */
function supportedSubmission(caseFile: CaseDefinition): DeductionSubmission {
  const answers: Record<string, string> = {};
  const citations: Record<string, EvidenceItem['id'][]> = {};
  for (const q of caseFile.questions) {
    answers[q.id] = isOrdering(q)
      ? encodeOrder(q.supportedOrder)
      : isMulti(q)
        ? encodeSelection(q.supportedOptionIds)
        : isNumber(q)
          ? String(q.supportedValue)
          : q.supportedOptionId;
    citations[q.id] = [...q.requires.allOf, ...q.requires.anyOf.slice(0, 1)];
  }
  return { answers, citations };
}

describe('season integrity', () => {
  it('cases unlock in a single chain, each after the one before', () => {
    expect(CASES[0]?.availableAfter).toBeUndefined();
    CASES.slice(1).forEach((c, i) => expect(c.availableAfter).toBe(CASES[i]?.id));
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length);
  });

  it.each(CASES.map((c) => [c.id, c] as const))('%s can be closed with evidence reachable inside the case', (_, caseFile) => {
    const reachable = new Set<string>(reachableEvidence(caseFile).map((e) => e.id));
    const submission = supportedSubmission(caseFile);
    for (const ids of Object.values(submission.citations)) {
      for (const id of ids) expect(reachable.has(id), `${caseFile.id}: ${id} must be reachable`).toBe(true);
    }
    expect(evaluateDeduction(caseFile.questions, submission).outcome).toBe('correct');
  });

  it.each(CASES.map((c) => [c.id, c] as const))('%s: every discovery-gated item can be unlocked', (_, caseFile) => {
    const reachable = new Set<string>(reachableEvidence(caseFile).map((e) => e.id));
    for (const item of caseFile.evidence) {
      // End-beat records arrive only after the case closes, so they can never be needed to close it.
      if (item.unlock.type === 'caseClosed') {
        expect(item.unlock.caseId).toBe(caseFile.id);
        continue;
      }
      expect(reachable.has(item.id), `${caseFile.id}: ${item.id}`).toBe(true);
    }
  });

  it.each(CASES.map((c) => [c.id, c] as const))('%s: questions are well formed', (_, caseFile) => {
    for (const q of caseFile.questions) {
      expect(q.hints.length).toBeGreaterThanOrEqual(2);
      if (isOrdering(q)) {
        expect([...q.supportedOrder].sort()).toEqual(q.items.map((i) => i.id).sort());
        expect(q.items.map((i) => i.id)).not.toEqual(q.supportedOrder);
      } else if (isNumber(q)) {
        expect(Number.isInteger(q.supportedValue)).toBe(true);
        for (const miss of q.nearMisses ?? []) expect(miss.value).not.toBe(q.supportedValue);
      } else if (isMulti(q)) {
        const ids = q.options.map((o) => o.id);
        expect(q.supportedOptionIds.every((id) => ids.includes(id))).toBe(true);
        expect(q.supportedOptionIds.length).toBeLessThan(ids.length);
      } else {
        expect(q.options.map((o) => o.id)).toContain(q.supportedOptionId);
      }
    }
  });

  it('every amendment and anomaly refers to a real case', () => {
    const ids = new Set<string>(CASES.map((c) => c.id));
    for (const item of CASES.flatMap((c) => c.evidence)) {
      if (item.kind === 'document' || item.kind === 'object' || item.kind === 'plan' || item.kind === 'timeline') {
        for (const a of item.amendments ?? []) expect(ids.has(a.whenCaseClosed)).toBe(true);
      }
    }
    for (const anomaly of ANOMALIES) expect(ids.has(anomaly.appearsAfterClosing)).toBe(true);
    expect(ids.has(caseId('case-007'))).toBe(true);
  });

  it('evidence IDs are unique across the whole season', () => {
    const all = CASES.flatMap((c) => c.evidence.map((e) => e.id));
    expect(new Set(all).size).toBe(all.length);
  });
});
