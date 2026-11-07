import { describe, expect, it } from 'vitest';
import { caseId } from './case';
import { evidenceId } from './evidence';
import { caseStatus, createSave, isExamined, recordVisit } from './progress';
import { SAVE_VERSION, migrateSave, type ContentIndex } from './save';

const content: ContentIndex = {
  isKnownCase: (id) => id === 'case-001',
  isKnownEvidence: (c, e) => c === 'case-001' && ['ev-a', 'ev-b'].includes(e),
};
const T0 = new Date('2026-01-01T22:00:00.000Z');
const T1 = new Date('2026-01-01T22:05:00.000Z');
const T2 = new Date('2026-01-01T22:10:00.000Z');
const CASE_001 = caseId('case-001');
const EV_A = evidenceId('ev-a');
const EV_B = evidenceId('ev-b');

/** A save exactly as version 1 of the app wrote it. */
const V1_FIXTURE = {
  version: 1,
  createdAt: '2026-01-01T22:00:00.000Z',
  updatedAt: '2026-01-01T22:05:00.000Z',
  resume: { screen: 'briefing', caseId: 'case-001' },
  cases: { 'case-001': { status: 'opened', firstOpenedAt: '2026-01-01T22:05:00.000Z' } },
};

describe('migrateSave', () => {
  it('accepts a current-version save unchanged', () => {
    const save = recordVisit(createSave(T0), { screen: 'evidence', caseId: CASE_001, evidenceId: EV_A }, T1);
    expect(migrateSave(JSON.parse(JSON.stringify(save)), content)).toEqual({ ok: true, save });
  });

  it('upgrades a v1 save, keeping opened cases and the resume point', () => {
    const result = migrateSave(structuredClone(V1_FIXTURE), content);
    expect(result).toEqual({
      ok: true,
      save: {
        version: SAVE_VERSION,
        createdAt: V1_FIXTURE.createdAt,
        updatedAt: V1_FIXTURE.updatedAt,
        resume: { screen: 'briefing', caseId: 'case-001' },
        cases: {
          'case-001': {
            status: 'opened',
            firstOpenedAt: '2026-01-01T22:05:00.000Z',
            examined: [],
            discoveries: [],
          },
        },
      },
    });
  });

  it.each([null, 'save', 42, [], {}, { version: '1' }, { version: 1.5 }])(
    'reports %j as corrupt',
    (raw) => {
      expect(migrateSave(raw, content)).toEqual({ ok: false, problem: 'corrupt' });
    },
  );

  it('reports missing timestamps as corrupt, including after migration', () => {
    expect(migrateSave({ version: SAVE_VERSION, createdAt: 'never' }, content)).toEqual({
      ok: false,
      problem: 'corrupt',
    });
    expect(migrateSave({ ...V1_FIXTURE, updatedAt: undefined }, content)).toEqual({
      ok: false,
      problem: 'corrupt',
    });
  });

  it('refuses saves from a newer version instead of guessing', () => {
    expect(migrateSave({ ...createSave(T0), version: SAVE_VERSION + 1 }, content)).toEqual({
      ok: false,
      problem: 'newer-version',
    });
  });

  it('reports a version with no migration path as corrupt', () => {
    expect(migrateSave({ ...createSave(T0), version: 0 }, content)).toEqual({
      ok: false,
      problem: 'corrupt',
    });
  });

  it('falls back to the archive when resuming into a removed case', () => {
    const raw = { ...createSave(T0), resume: { screen: 'briefing', caseId: 'case-404' } };
    const result = migrateSave(raw, content);
    expect(result.ok && result.save.resume).toEqual({ screen: 'archive' });
  });

  it('falls back to the case workspace when resuming into removed evidence', () => {
    const raw = {
      ...createSave(T0),
      resume: { screen: 'evidence', caseId: 'case-001', evidenceId: 'ev-gone' },
    };
    const result = migrateSave(raw, content);
    expect(result.ok && result.save.resume).toEqual({ screen: 'investigation', caseId: 'case-001' });
  });

  it('drops malformed case entries and unknown evidence but keeps the rest', () => {
    const raw = {
      ...createSave(T0),
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: T1.toISOString(),
          examined: ['ev-a', 'ev-gone', 7, 'ev-a'],
          discoveries: ['d-1', null],
        },
        'case-002': { status: 'solved?' },
        'case-003': 'opened',
      },
    };
    const result = migrateSave(raw, content);
    expect(result.ok && result.save.cases).toEqual({
      'case-001': {
        status: 'opened',
        firstOpenedAt: T1.toISOString(),
        examined: ['ev-a'],
        discoveries: ['d-1'],
      },
    });
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

    const backToArchive = recordVisit(opened, { screen: 'archive' }, T2);
    const reopened = recordVisit(backToArchive, { screen: 'briefing', caseId: CASE_001 }, T2);
    expect(reopened.cases[CASE_001]?.firstOpenedAt).toBe(T1.toISOString());
  });

  it('entering the workspace directly also opens the case', () => {
    const save = recordVisit(createSave(T0), { screen: 'investigation', caseId: CASE_001 }, T1);
    expect(caseStatus(save, CASE_001)).toBe('opened');
  });

  it('records examined evidence once, in first-examined order', () => {
    let save = createSave(T0);
    save = recordVisit(save, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_B }, T1);
    save = recordVisit(save, { screen: 'investigation', caseId: CASE_001 }, T1);
    save = recordVisit(save, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_A }, T2);
    save = recordVisit(save, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_B }, T2);
    expect(save.cases[CASE_001]?.examined).toEqual(['ev-b', 'ev-a']);
    expect(isExamined(save, CASE_001, EV_A)).toBe(true);
    expect(isExamined(null, CASE_001, EV_A)).toBe(false);
  });

  it('returns the same save when nothing changes', () => {
    const save = createSave(T0);
    expect(recordVisit(save, { screen: 'archive' }, T1)).toBe(save);
    const atEvidence = recordVisit(save, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_A }, T1);
    expect(recordVisit(atEvidence, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_A }, T2)).toBe(
      atEvidence,
    );
  });

  it('does not mutate the previous save', () => {
    const save = createSave(T0);
    recordVisit(save, { screen: 'evidence', caseId: CASE_001, evidenceId: EV_A }, T1);
    expect(save.cases).toEqual({});
    expect(save.resume).toEqual({ screen: 'archive' });
  });
});
