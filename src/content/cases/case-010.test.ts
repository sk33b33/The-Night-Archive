import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { withAmendments } from '../../domain/evidence';
import { CASE_010, CASE_010_IDS } from './case-010';

const C9 = caseId('case-009');
const C10 = caseId('case-010');
const plan = CASE_010.evidence.find((e) => e.id === CASE_010_IDS.plan);
if (plan?.kind !== 'plan') throw new Error('missing plan');
const footage = CASE_010.evidence.find((e) => e.id === CASE_010_IDS.cctv);
if (footage?.kind !== 'cctv') throw new Error('missing footage');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'badge-0600': 'stack-room',
    'camera-0600': 'someone',
    'says-desk': encodeSelection(['handover']),
    hand: 'consistent',
    seated: 'unknown',
  },
  citations: {
    'badge-0600': [CASE_010_IDS.doorLog],
    'camera-0600': [CASE_010_IDS.cctv],
    'says-desk': [CASE_010_IDS.handover],
    hand: [CASE_010_IDS.comparison],
    seated: [CASE_010_IDS.cctv, CASE_010_IDS.doorLog],
  },
};

describe('Case 010', () => {
  it('follows Case 009', () => {
    expect(isCaseAvailable(CASE_010, (id) => id === C9)).toBe(true);
    expect(isCaseAvailable(CASE_010, () => false)).toBe(false);
  });

  it('the plan is a view of the records: every entry names a source in the case, and every room exists', () => {
    const ids = new Set<string>(CASE_010.evidence.map((e) => e.id));
    const rooms = new Set(plan.rooms.map((r) => r.id));
    for (const step of plan.steps) {
      for (const entry of step.entries) {
        expect(ids.has(entry.source), entry.text).toBe(true);
        expect(rooms.has(entry.room) || step.extraRooms?.some((r) => r.id === entry.room)).toBe(true);
      }
    }
  });

  it('at 06:00 the plan puts a badge in the stack room and someone at position 7, and no record names who sat', () => {
    const at = plan.steps.find((s) => s.time === '06:00' && !s.label);
    if (!at) throw new Error('missing 06:00');
    expect(at.entries.filter((e) => e.room === 'stack-room').length).toBeGreaterThan(0);
    const reading = at.entries.filter((e) => e.room === 'reading-room').map((e) => e.text).join(' ');
    expect(reading).toContain('someone seated');
    expect(reading).not.toMatch(/night archivist seated|M\. seated|Mara/);
  });

  it('the footage never shows the seated figure and the night archivist together', () => {
    for (const f of footage.frames) expect(f.scene.seatedFigure && f.scene.archivist).toBeFalsy();
    expect(footage.frames.find((f) => f.time === '06:00:10')?.scene).toMatchObject({ seatedFigure: true, dayArchivist: true });
  });

  it('accepts the supported findings and requires the handover comparison', () => {
    expect(evaluateDeduction(CASE_010.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, hand: [CASE_010_IDS.handoverM] } };
    expect(evaluateDeduction(CASE_010.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['badge-0600', 'position-7'],
    ['camera-0600', 'night-archivist'],
    ['hand', 'same-person'],
    ['seated', 'you'],
    ['seated', 'nash'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_010.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('end beat A: Storage B appears on the plan, sealed and with no record, once Case 010 closes', () => {
    expect(withAmendments(plan, () => false).steps).toHaveLength(plan.steps.length);
    const amended = withAmendments(plan, (id) => id === C10);
    const last = amended.steps.at(-1);
    expect(last?.label).toBe('06:00 · Storage B');
    expect(last?.entries).toEqual([]);
    expect(last?.extraRooms?.[0]).toMatchObject({ label: 'Storage B', sealed: true });
  });
});
