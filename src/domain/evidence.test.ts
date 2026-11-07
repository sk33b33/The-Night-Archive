import { describe, expect, it } from 'vitest';
import { CASES } from '../content/cases';
import { briefingReport } from './case';
import { availableEvidence, documentText, evidenceId, type EvidenceItem } from './evidence';
import { countMatches, splitMatches } from './textSearch';

const initial: EvidenceItem = {
  id: evidenceId('ev-initial'),
  kind: 'audio',
  title: 'Reel',
  reference: 'R1',
  description: 'A reel.',
  unlock: { type: 'initial' },
  catalogue: [],
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

  it('Case 001 does not reveal the second voice before the audio phase', () => {
    const json = JSON.stringify(CASES);
    expect(json).not.toContain('Mara');
  });
});
