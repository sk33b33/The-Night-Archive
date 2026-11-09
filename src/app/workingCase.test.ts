import { describe, expect, it } from 'vitest';
import { CASES } from '../content/cases';
import { caseId } from '../domain/case';
import { createSave, recordAttempt, recordDiscovery, recordVisit } from '../domain/progress';
import { footageOf, workingCase } from './workingCase';

const T = (m: number) => new Date(Date.UTC(2026, 0, 1, 22, m));
const open = (save = createSave(T(0)), id: string, m: number) => recordVisit(save, { screen: 'briefing', caseId: caseId(id) }, T(m));
const closed = (save: ReturnType<typeof createSave>, id: string) =>
  recordAttempt(save, caseId(id), { submittedAt: T(50).toISOString(), outcome: 'correct', answers: {}, citations: {} });
const status = (save: ReturnType<typeof createSave>) => (id: string) =>
  save.cases[id] ? (save.cases[id]?.attempts.some((a) => a.outcome === 'correct') ? 'closed' : 'opened') : 'new';

describe('the working case', () => {
  it('is none with nothing opened', () => {
    expect(workingCase(createSave(T(0)), CASES, () => 'new', null)).toBeNull();
    expect(workingCase(null, CASES, () => 'new', null)).toBeNull();
  });

  it('is the case last opened this session, even if closed', () => {
    const save = closed(open(undefined, 'case-001', 1), 'case-001');
    expect(workingCase(save, CASES, status(save), 'case-001')?.id).toBe('case-001');
  });

  it('otherwise the most recently started case still open', () => {
    let save = open(undefined, 'case-001', 1);
    save = open(save, 'case-002', 2);
    save = open(save, 'case-003', 3);
    save = closed(save, 'case-003');
    expect(workingCase(save, CASES, status(save), null)?.id).toBe('case-002');
  });

  it('ignores a remembered case that is no longer available', () => {
    const save = open(undefined, 'case-002', 2);
    expect(workingCase(save, CASES.slice(0, 1), status(save), 'case-002')).toBeNull();
  });

  it('footage is the first CCTV item the player can open', () => {
    const c006 = CASES.find((c) => c.id === 'case-006');
    const c001 = CASES.find((c) => c.id === 'case-001');
    if (!c006 || !c001) throw new Error('missing cases');
    expect(footageOf(c006, createSave(T(0)), () => false)).toBe(c006.evidence.find((e) => e.kind === 'cctv')?.id);
    expect(footageOf(c001, createSave(T(0)), () => false)).toBeNull();
    // Discoveries that unlock other items do not change the first footage.
    const save = recordDiscovery(createSave(T(0)), caseId('case-006'), 'anything', T(1));
    expect(footageOf(c006, save, () => false)).toBe(c006.evidence.find((e) => e.kind === 'cctv')?.id);
  });
});
