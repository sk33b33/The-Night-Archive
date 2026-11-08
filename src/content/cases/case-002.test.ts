import { describe, expect, it } from 'vitest';
import { PHOTO_ARTWORK } from '../../features/evidence/photo/artwork';
import { briefingReport, caseId, isCaseAvailable } from '../../domain/case';
import { evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import {
  allPassageKeys,
  availableEvidence,
  documentText,
  effectiveDocument,
  evidenceUnlockedBy,
  passageKeys,
} from '../../domain/evidence';
import { CASE_001, CASE_001_IDS } from './case-001';
import { CALENDAR_DISCOVERY, CASE_002, CASE_002_IDS } from './case-002';
import { CASES } from '.';

const C1 = caseId('case-001');
const C2 = caseId('case-002');

describe('Case 002 availability', () => {
  it('appears only once Case 001 is closed', () => {
    expect(isCaseAvailable(CASE_002, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_002, (id) => id === C1)).toBe(true);
    expect(isCaseAvailable(CASE_001, () => false)).toBe(true);
    expect(CASES.map((c) => c.id)).toEqual(['case-001', 'case-002', 'case-003', 'case-004', 'case-005', 'case-006']);
  });
});

describe('Case 002 content (approved bible)', () => {
  const text = CASE_002.evidence
    .flatMap((e) => (e.kind === 'document' ? documentText(e.document) : e.kind === 'photo' ? [e.alt, ...e.regions.map((r) => r.note)] : []))
    .join('\n');

  it('records the canon facts the case depends on', () => {
    expect(text).toContain('Friday 2 March 1984');
    expect(text).toContain('Property vacant since November 1982');
    expect(text).toContain('Disconnected, 12 November 1982');
    expect(text).toMatch(/9 Jan 1984[\s\S]*04217[\s\S]*5 Mar 1984[\s\S]*04561/);
    expect(text).toContain('Inspector — 10:00');
    expect(text).toContain('M. Ellery');
  });

  it('gets its weekdays right', () => {
    const weekday = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
    expect(weekday('1984-03-02')).toBe('Friday');
    expect(weekday('1984-02-20')).toBe('Monday');
    expect(weekday('1984-03-01')).toBe('Thursday');
  });

  it('never names the occupant or the caller, and never links "M." to Mara', () => {
    const all = JSON.stringify(CASE_002);
    expect(all).not.toContain('Mara');
    const tape = CASE_002.evidence.find((e) => e.id === CASE_002_IDS.tape);
    if (tape?.kind !== 'audio') throw new Error('missing tape');
    const speakers = tape.timeline.segments.flatMap((s) => s.lines.map((l) => l.speaker ?? ''));
    expect(speakers.join(' ')).not.toMatch(/Ellery|Pell|Ward/);
    for (const q of CASE_002.questions) expect(q.finding).not.toMatch(/Ellery|Pell|D\.R\./);
  });

  it('the calendar region files the enlargement', () => {
    const kitchen = CASE_002.evidence.find((e) => e.id === CASE_002_IDS.kitchen);
    if (kitchen?.kind !== 'photo') throw new Error('missing photo');
    expect(kitchen.regions.find((r) => r.id === 'calendar')?.revealsDiscovery).toBe(CALENDAR_DISCOVERY);
    expect(evidenceUnlockedBy(CASE_002, CALENDAR_DISCOVERY).map((e) => e.id)).toEqual([CASE_002_IDS.calendar]);
    expect(availableEvidence(CASE_002.evidence, []).map((e) => e.id)).not.toContain(CASE_002_IDS.calendar);
  });

  it('every photograph has artwork and regions inside the frame', () => {
    for (const item of CASES.flatMap((c) => c.evidence)) {
      if (item.kind !== 'photo') continue;
      expect(PHOTO_ARTWORK[item.artwork]).toBeDefined();
      for (const r of item.regions) {
        expect(r.x >= 0 && r.y >= 0 && r.x + r.width <= 1 && r.y + r.height <= 1).toBe(true);
      }
    }
  });

  it('board rules refer to real evidence with reasons', () => {
    const ids = new Set(CASE_002.evidence.map((e) => e.id));
    for (const rule of CASE_002.boardRules) {
      expect(ids.has(rule.from) && ids.has(rule.to)).toBe(true);
      expect(rule.reason.length).toBeGreaterThan(20);
    }
  });

  it('the briefing report is the inspection report', () => {
    expect(briefingReport(CASE_002).id).toBe(CASE_002_IDS.inspection);
  });
});

describe('Case 002 findings', () => {
  const SUPPORTED: DeductionSubmission = {
    answers: { 'property-vacant': 'occupied', 'inspection-expected': 'calendar', occupant: 'unknown' },
    citations: {
      'property-vacant': [CASE_002_IDS.meter],
      'inspection-expected': [CASE_002_IDS.calendar],
      occupant: [CASE_002_IDS.tenancy],
    },
  };

  it('accepts the supported findings', () => {
    expect(evaluateDeduction(CASE_002.questions, SUPPORTED).outcome).toBe('correct');
  });

  it('requires the calendar enlargement (the discovery is not optional)', () => {
    const noCalendar = { ...SUPPORTED, citations: { ...SUPPORTED.citations, 'inspection-expected': [CASE_002_IDS.kitchen] } };
    expect(evaluateDeduction(CASE_002.questions, noCalendar).outcome).toBe('incomplete');
  });

  it.each([
    ['property-vacant', 'vacant'],
    ['property-vacant', 'former-tenant'],
    ['inspection-expected', 'tipped-off'],
    ['occupant', 'ellery'],
    ['occupant', 'pell'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    const wrong = { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } };
    expect(evaluateDeduction(CASE_002.questions, wrong).outcome).toBe('partial');
  });
});

describe('Case 001 end beat: the file changes', () => {
  const report = CASE_001.evidence.find((e) => e.id === CASE_001_IDS.report);
  if (report?.kind !== 'document') throw new Error('missing report');

  it('reads as filed until Case 002 is closed', () => {
    expect(effectiveDocument(report, () => false)).toBe(report.document);
    expect(effectiveDocument(report, (id) => id === C1)).toBe(report.document);
  });

  it('gains the annotation once Case 002 is closed, after the original passages', () => {
    const changed = effectiveDocument(report, (id) => id === C2);
    expect(changed.blocks.at(-1)).toEqual({ type: 'annotation', text: 'Filed. — M.' });
    // Existing passage keys are unchanged, so highlights stay valid.
    expect(passageKeys(changed).slice(0, passageKeys(report.document).length)).toEqual(
      passageKeys(report.document),
    );
    expect(allPassageKeys(report)).toContain('b3');
  });

  it('is never explained', () => {
    const text = JSON.stringify(report.amendments).toLowerCase();
    for (const word of ['because', 'mara', 'explain']) expect(text).not.toContain(word);
  });
});
