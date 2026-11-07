import { describe, expect, it } from 'vitest';
import { CASES } from '../content/cases';
import { briefingReport } from './case';
import {
  availableEvidence,
  documentText,
  evidenceId,
  evidenceUnlockedBy,
  passageKeys,
  type EvidenceItem,
} from './evidence';
import { countMatches, splitMatches } from './textSearch';

const initial: EvidenceItem = {
  id: evidenceId('ev-initial'),
  kind: 'audio',
  title: 'Reel',
  reference: 'R1',
  description: 'A reel.',
  unlock: { type: 'initial' },
  catalogue: [],
  timeline: { duration: 0, segments: [] },
  filters: [],
  fixedFilters: [],
};
const hidden: EvidenceItem = {
  ...initial,
  id: evidenceId('ev-hidden'),
  unlock: { type: 'discovery', discoveryId: 'filter-applied' },
};

describe('evidence unlocks', () => {
  it('shows initial evidence and hides discovery-gated evidence', () => {
    expect(availableEvidence([initial, hidden], []).map((e) => e.id)).toEqual(['ev-initial']);
  });

  it('reveals gated evidence once its discovery is recorded, keeping authored order', () => {
    expect(availableEvidence([hidden, initial], ['filter-applied']).map((e) => e.id)).toEqual([
      'ev-hidden',
      'ev-initial',
    ]);
  });

  it('ignores unrelated discoveries', () => {
    expect(availableEvidence([hidden], ['something-else'])).toEqual([]);
  });
});

describe('text search', () => {
  it('splits text into case-insensitive matches', () => {
    expect(splitMatches('East door. east platform.', 'EAST')).toEqual([
      { text: 'East', match: true },
      { text: ' door. ', match: false },
      { text: 'east', match: true },
      { text: ' platform.', match: false },
    ]);
  });

  it('treats blank queries as no search', () => {
    expect(splitMatches('Text', '   ')).toEqual([{ text: 'Text', match: false }]);
    expect(countMatches(['Text'], '')).toBe(0);
  });

  it('does not double-count overlapping matches', () => {
    expect(countMatches(['aaaa'], 'aa')).toBe(2);
  });

  it('counts across all parts of a document', () => {
    expect(countMatches(['02:10 cancelled', 'Cancelled'], 'cancelled')).toBe(2);
  });
});

describe('case content integrity', () => {
  it.each(CASES.map((c) => [c.id, c] as const))('%s has a valid briefing report and unique IDs', (_, caseFile) => {
    expect(() => briefingReport(caseFile)).not.toThrow();
    const ids = caseFile.evidence.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Case 001 records include the canon facts the case depends on', () => {
    const case001 = CASES.find((c) => c.id === 'case-001');
    const all = case001?.evidence.flatMap((e) => (e.kind === 'document' ? documentText(e.document) : []));
    const text = all?.join('\n') ?? '';
    expect(text).toContain('03:40');
    expect(text).toContain('Elias Ward');
    expect(text).toMatch(/02:10[\s\S]*Cancelled/);
    expect(text).toContain('1979');
    // The roster must not list the named caller.
    const roster = case001?.evidence.find((e) => e.id === 'c001-duty-roster');
    expect(roster?.kind === 'document' && documentText(roster.document).join(' ')).not.toContain('Ward');
  });

  it('Case 001 mentions Mara only in the filter-gated audio line', () => {
    const case001 = CASES.find((c) => c.id === 'case-001');
    const documents = JSON.stringify(case001?.evidence.filter((e) => e.kind === 'document'));
    expect(documents).not.toContain('Mara');
    const audioLines = case001?.evidence.flatMap((e) =>
      e.kind === 'audio' ? e.timeline.segments.flatMap((s) => s.lines) : [],
    );
    const mentions = audioLines?.filter((l) => l.text.includes('Mara')) ?? [];
    expect(mentions.length).toBeGreaterThan(0);
    expect(mentions.every((l) => l.condition?.applied === true || l.condition === undefined)).toBe(true);
  });

  it('the filtered segment is locked until the second voice is revealed', () => {
    const case001 = CASES.find((c) => c.id === 'case-001');
    if (!case001) throw new Error('missing case');
    const before = availableEvidence(case001.evidence, []).map((e) => e.id);
    const after = availableEvidence(case001.evidence, ['c001-second-voice']).map((e) => e.id);
    expect(before).not.toContain('c001-filtered-segment');
    expect(after).toContain('c001-filtered-segment');
    expect(evidenceUnlockedBy(case001, 'c001-second-voice').map((e) => e.id)).toEqual([
      'c001-filtered-segment',
    ]);
  });
});

describe('passage keys', () => {
  it('lists every paragraph, field, and table row in order', async () => {
    const { CASE_001 } = await import('../content/cases/case-001');
    const timetable = CASE_001.evidence.find((e) => e.id === 'c001-timetable');
    if (timetable?.kind !== 'document') throw new Error('missing timetable');
    // One table with four rows, then one annotation.
    expect(passageKeys(timetable.document)).toEqual(['b0.0', 'b0.1', 'b0.2', 'b0.3', 'b1']);
    const report = CASE_001.evidence.find((e) => e.id === 'c001-incident-report');
    if (report?.kind !== 'document') throw new Error('missing report');
    expect(passageKeys(report.document)).toEqual(['b0.0', 'b0.1', 'b0.2', 'b0.3', 'b0.4', 'b1', 'b2']);
  });
});
