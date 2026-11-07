import { describe, expect, it } from 'vitest';
import { caseId } from './case';
import { caseStatus, createSave, recordVisit } from './progress';
import { SAVE_VERSION, migrateSave } from './save';

const known = (id: string) => id === 'case-001';
const T0 = new Date('2026-01-01T22:00:00.000Z');
const T1 = new Date('2026-01-01T22:05:00.000Z');
const CASE_001 = caseId('case-001');

describe('migrateSave', () => {
  it('accepts a current-version save', () => {
    const save = recordVisit(createSave(T0), { screen: 'briefing', caseId: CASE_001 }, T1);
    expect(migrateSave(JSON.parse(JSON.stringify(save)), known)).toEqual({ ok: true, save });
  });

  it.each([null, 'save', 42, [], {}, { version: '1' }, { version: 1.5 }])(
    'reports %j as corrupt',
    (raw) => {
      expect(migrateSave(raw, known)).toEqual({ ok: false, problem: 'corrupt' });
    },
  );

  it('reports missing timestamps as corrupt', () => {
    expect(migrateSave({ version: 1, createdAt: 'never' }, known)).toEqual({
      ok: false,
      problem: 'corrupt',
    });
  });

  it('refuses saves from a newer version instead of guessing', () => {
    expect(migrateSave({ ...createSave(T0), version: SAVE_VERSION + 1 }, known)).toEqual({
      ok: false,
      problem: 'newer-version',
    });
  });

  it('reports a version with no migration path as corrupt', () => {
    expect(migrateSave({ ...createSave(T0), version: 0 }, known)).toEqual({
      ok: false,
      problem: 'corrupt',
    });
  });

  it('falls back to the archive when resuming into a removed case', () => {
    const raw = { ...createSave(T0), resume: { screen: 'briefing', caseId: 'case-404' } };
    const result = migrateSave(raw, known);
    expect(result.ok && result.save.resume).toEqual({ screen: 'archive' });
  });

  it('drops malformed case progress entries but keeps valid ones', () => {
    const raw = {
      ...createSave(T0),
      cases: {
        'case-001': { status: 'opened', firstOpenedAt: T1.toISOString() },
        'case-002': { status: 'solved?' },
        'case-003': 'opened',
      },
    };
    const result = migrateSave(raw, known);
    expect(result.ok && Object.keys(result.save.cases)).toEqual(['case-001']);
  });
});

describe('progress', () => {
  it('a new save resumes at the archive with no cases opened', () => {
    const save = createSave(T0);
    expect(save.resume).toEqual({ screen: 'archive' });
    expect(caseStatus(save, CASE_001)).toBe('new');
    expect(caseStatus(null, CASE_001)).toBe('new');
  });

  it('opening a briefing marks the case opened once', () => {
    const opened = recordVisit(createSave(T0), { screen: 'briefing', caseId: CASE_001 }, T1);
    expect(caseStatus(opened, CASE_001)).toBe('opened');
    expect(opened.cases[CASE_001]?.firstOpenedAt).toBe(T1.toISOString());
    expect(opened.updatedAt).toBe(T1.toISOString());

    const later = new Date('2026-01-02T00:00:00.000Z');
    const backToArchive = recordVisit(opened, { screen: 'archive' }, later);
    const reopened = recordVisit(backToArchive, { screen: 'briefing', caseId: CASE_001 }, later);
    expect(reopened.cases[CASE_001]?.firstOpenedAt).toBe(T1.toISOString());
  });

  it('returns the same save when nothing changes', () => {
    const save = createSave(T0);
    expect(recordVisit(save, { screen: 'archive' }, T1)).toBe(save);
  });

  it('does not mutate the previous save', () => {
    const save = createSave(T0);
    recordVisit(save, { screen: 'briefing', caseId: CASE_001 }, T1);
    expect(save.cases).toEqual({});
    expect(save.resume).toEqual({ screen: 'archive' });
  });
});
