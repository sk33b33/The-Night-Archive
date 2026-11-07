import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { documentText, effectiveProvenance, evidenceUnlockedBy, withAmendments } from '../../domain/evidence';
import { CASE_004, CASE_004_IDS } from './case-004';
import { BADGE_MATCH_DISCOVERY, CASE_005, CASE_005_IDS } from './case-005';

const C4 = caseId('case-004');
const C5 = caseId('case-005');

const SUPPORTED: DeductionSubmission = {
  answers: {
    imprint: 'set-by-hand',
    terminal: 'not-before-1996',
    'dates-print': encodeSelection(['paper', 'companies']),
    dates: encodeOrder(['paper', 'imprint', 'dissolved', 'terminal', 'installed']),
    how: 'unknown',
  },
  citations: {
    imprint: [CASE_005_IDS.manual],
    terminal: [CASE_005_IDS.catalogue, CASE_005_IDS.comparison],
    'dates-print': [CASE_005_IDS.paper, CASE_005_IDS.companies],
    dates: [CASE_005_IDS.paper, CASE_005_IDS.catalogue],
    how: [CASE_005_IDS.paper, CASE_005_IDS.companies],
  },
};

describe('Case 005', () => {
  it('appears after Case 004 closes', () => {
    expect(isCaseAvailable(CASE_005, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_005, (id) => id === C4)).toBe(true);
  });

  it('records the canon facts', () => {
    const text = CASE_005.evidence.flatMap((e) => (e.kind === 'document' ? documentText(e.document) : [])).join('\n');
    expect(text).toContain('set by hand');
    expect(text).toContain('March 1996');
    expect(text).toContain('Stock manufactured in 1980');
    expect(text).toMatch(/Dissolved[\s\S]*1989/);
    expect(text).toContain('Installed');
  });

  it('the badge region exists in both photographs with the same ID, and matching files the note', () => {
    const photos = CASE_005.evidence.filter((e) => e.kind === 'photo');
    for (const p of photos) {
      if (p.kind !== 'photo') continue;
      const badge = p.regions.find((r) => r.id === 'terminal-badge');
      expect(badge?.revealsOnMatch).toBe(BADGE_MATCH_DISCOVERY);
    }
    expect(evidenceUnlockedBy(CASE_005, BADGE_MATCH_DISCOVERY).map((e) => e.id)).toEqual([CASE_005_IDS.comparison]);
  });

  it('accepts the supported findings and requires the comparison note', () => {
    expect(evaluateDeduction(CASE_005.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, terminal: [CASE_005_IDS.catalogue] } };
    expect(evaluateDeduction(CASE_005.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['imprint', 'yes'],
    ['imprint', 'altered'],
    ['terminal', '1981'],
    ['how', 'old-stock'],
    ['how', 'forgery'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_005.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('the ordering is unambiguous: every item has a distinct year', () => {
    const ordering = CASE_005.questions.find((q) => q.id === 'dates');
    if (ordering?.kind !== 'ordering') throw new Error('missing ordering');
    const years = ordering.supportedOrder.map((id) => Number(/(\d{4})/.exec(ordering.items.find((i) => i.id === id)?.text ?? '')?.[1]));
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
  });

  it('never explains the contradiction', () => {
    for (const q of CASE_005.questions) expect(q.finding).not.toMatch(/forg|travel|deliberate|on purpose|taken in 1981/i);
  });
});

describe('Case 005 end beat B: an earlier entry on the File 0091 print', () => {
  const print = CASE_004.evidence.find((e) => e.id === CASE_004_IDS.print);
  if (print?.kind !== 'object') throw new Error('missing print');

  it('is absent until Case 005 closes', () => {
    expect(effectiveProvenance(print, (id) => id === C4)).toBe(print.provenance);
  });

  it('appears above the player’s entry once Case 005 closes', () => {
    const amended = withAmendments(print, (id) => id === C5);
    expect(amended.provenance.map((p) => [p.date, p.action])).toEqual([
      ['14 Oct 1981', 'Placed'],
      ['Current shift', 'Found and recorded'],
    ]);
    expect(amended.provenance[0]?.holder).toContain('NA-07');
  });
});
