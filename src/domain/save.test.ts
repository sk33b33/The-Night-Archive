import { describe, expect, it } from 'vitest';
import { caseId } from './case';
import { evidenceId } from './evidence';
import {
  caseStatus,
  choiceOf,
  createSave,
  isExamined,
  recordAttempt,
  recordChoice,
  recordDiscovery,
  recordVisit,
  clearHighlights,
  setHighlight,
  updateBoard,
} from './progress';
import { moveCard } from './board';
import { SAVE_VERSION, migrateSave, type ContentIndex } from './save';

const content: ContentIndex = {
  isKnownCase: (id) => id === 'case-001',
  isKnownEvidence: (c, e) => c === 'case-001' && ['ev-a', 'ev-b'].includes(e),
  isKnownAnomaly: () => false,
  isKnownPassage: (_c, e, k) => e === 'ev-a' && ['b0', 'b1.2'].includes(k),
  isKnownChoice: (id, v) => id === 'file-0094' && ['filed', 'unfiled'].includes(v),
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
            board: { positions: {}, links: [] },
            attempts: [],
            highlights: {},
          },
        },
        choices: {},
      },
    });
  });

  it('upgrades a v5 save with no choices made, and keeps only known choices on a v6 save', () => {
    const v5 = { ...createSave(T0), version: 5 } as Record<string, unknown>;
    delete v5.choices;
    const upgraded = migrateSave(v5, content);
    expect(upgraded.ok && upgraded.save.choices).toEqual({});
    const v6 = { ...createSave(T0), choices: { 'file-0094': 'unfiled', 'file-0094-old': 'filed', other: 3 } };
    const kept = migrateSave(v6, content);
    expect(kept.ok && kept.save.choices).toEqual({ 'file-0094': 'unfiled' });
    const bad = migrateSave({ ...createSave(T0), choices: { 'file-0094': 'shredded' } }, content);
    expect(bad.ok && bad.save.choices).toEqual({});
  });

  it('upgrades a v2 save, keeping examined evidence and discoveries', () => {
    const v2 = {
      version: 2,
      createdAt: '2026-01-01T22:00:00.000Z',
      updatedAt: '2026-01-01T22:05:00.000Z',
      resume: { screen: 'evidence', caseId: 'case-001', evidenceId: 'ev-a' },
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: '2026-01-01T22:05:00.000Z',
          examined: ['ev-a'],
          discoveries: ['d-1'],
        },
      },
    };
    const result = migrateSave(v2, content);
    expect(result.ok && result.save.cases['case-001']).toEqual({
      status: 'opened',
      firstOpenedAt: '2026-01-01T22:05:00.000Z',
      examined: ['ev-a'],
      discoveries: ['d-1'],
      board: { positions: {}, links: [] },
      attempts: [],
      highlights: {},
    });
    expect(result.ok && result.save.resume).toEqual(v2.resume);
  });

  it('keeps valid board data and drops invalid positions and links', () => {
    const raw = {
      ...createSave(T0),
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: T1.toISOString(),
          examined: [],
          discoveries: [],
          board: {
            positions: { 'ev-a': { x: 10, y: 20 }, 'ev-gone': { x: 1, y: 1 }, 'ev-b': { x: 'left' } },
            links: [
              { from: 'ev-a', to: 'ev-b', relation: 'contradicts' },
              { from: 'ev-a', to: 'ev-a', relation: 'contradicts' },
              { from: 'ev-a', to: 'ev-gone', relation: 'contradicts' },
              { from: 'ev-a', to: 'ev-b', relation: 'proves' },
            ],
          },
        },
      },
    };
    const result = migrateSave(raw, content);
    expect(result.ok && result.save.cases['case-001']?.board).toEqual({
      positions: { 'ev-a': { x: 10, y: 20 } },
      links: [{ from: 'ev-a', to: 'ev-b', relation: 'contradicts' }],
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
        board: { positions: {}, links: [] },
        attempts: [],
        highlights: {},
      },
    });
  });

  it('upgrades a v4 save and keeps only highlights on known passages', () => {
    const v4 = {
      version: 4,
      createdAt: T0.toISOString(),
      updatedAt: T1.toISOString(),
      resume: { screen: 'archive' },
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: T1.toISOString(),
          examined: [],
          discoveries: [],
          board: { positions: {}, links: [] },
          attempts: [],
        },
      },
    };
    const upgraded = migrateSave(v4, content);
    expect(upgraded.ok && upgraded.save.cases['case-001']?.highlights).toEqual({});

    const withHighlights = {
      ...createSave(T0),
      cases: {
        'case-001': {
          ...(upgraded.ok ? upgraded.save.cases['case-001'] : {}),
          highlights: { 'ev-a': ['b0', 'b9', 'b1.2', 'b0'], 'ev-gone': ['b0'], 'ev-b': ['nope'] },
        },
      },
    };
    const parsed = migrateSave(withHighlights, content);
    expect(parsed.ok && parsed.save.cases['case-001']?.highlights).toEqual({ 'ev-a': ['b0', 'b1.2'] });
  });

  it('upgrades a v3 save and keeps valid attempts, dropping malformed ones', () => {
    const v3 = {
      version: 3,
      createdAt: T0.toISOString(),
      updatedAt: T1.toISOString(),
      resume: { screen: 'board', caseId: 'case-001' },
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: T1.toISOString(),
          examined: [],
          discoveries: [],
          board: { positions: {}, links: [] },
        },
      },
    };
    const upgraded = migrateSave(v3, content);
    expect(upgraded.ok && upgraded.save.cases['case-001']?.attempts).toEqual([]);
    expect(upgraded.ok && upgraded.save.resume).toEqual({ screen: 'board', caseId: 'case-001' });

    const withAttempts = {
      ...createSave(T0),
      cases: {
        'case-001': {
          status: 'opened',
          firstOpenedAt: T1.toISOString(),
          examined: [],
          discoveries: [],
          board: { positions: {}, links: [] },
          attempts: [
            {
              submittedAt: T2.toISOString(),
              outcome: 'partial',
              answers: { q1: 'a', q2: 7 },
              citations: { q1: ['ev-a', 'ev-gone'] },
            },
            { submittedAt: T2.toISOString(), outcome: 'triumphant', answers: {}, citations: {} },
            { outcome: 'correct', answers: {}, citations: {} },
          ],
        },
      },
    };
    const parsed = migrateSave(withAttempts, content);
    expect(parsed.ok && parsed.save.cases['case-001']?.attempts).toEqual([
      { submittedAt: T2.toISOString(), outcome: 'partial', answers: { q1: 'a' }, citations: { q1: ['ev-a'] } },
    ]);
  });
});

describe('progress', () => {
  it('a case with a closing choice closes only once its findings hold and the choice is made', () => {
    const id = caseId('case-001');
    const solved = recordAttempt(createSave(T0), id, {
      submittedAt: T1.toISOString(),
      outcome: 'correct',
      answers: {},
      citations: {},
    });
    expect(caseStatus(solved, id)).toBe('closed');
    expect(caseStatus(solved, id, 'file-0094')).toBe('opened');
    const chosen = recordChoice(solved, 'file-0094', 'unfiled', T2);
    expect(caseStatus(chosen, id, 'file-0094')).toBe('closed');
    expect(choiceOf(chosen, 'file-0094')).toBe('unfiled');
    // Made once: it is never changed afterwards.
    expect(recordChoice(chosen, 'file-0094', 'filed', T2)).toBe(chosen);
    // A choice without accepted findings does not close the case.
    const early = recordChoice(createSave(T0), 'file-0094', 'filed', T2);
    expect(caseStatus(recordVisit(early, { screen: 'briefing', caseId: id }, T2), id, 'file-0094')).toBe('opened');
  });

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

  it('records a discovery once and keeps it', () => {
    const save = recordDiscovery(createSave(T0), CASE_001, 'd-1', T1);
    expect(save.cases[CASE_001]?.discoveries).toEqual(['d-1']);
    expect(caseStatus(save, CASE_001)).toBe('opened');
    expect(recordDiscovery(save, CASE_001, 'd-1', T2)).toBe(save);
    const visited = recordVisit(save, { screen: 'archive' }, T2);
    expect(visited.cases[CASE_001]?.discoveries).toEqual(['d-1']);
  });

  it('updates a case board and skips unchanged boards', () => {
    const save = updateBoard(createSave(T0), CASE_001, (b) => moveCard(b, EV_A, { x: 40, y: 40 }), T1);
    expect(save.cases[CASE_001]?.board.positions[EV_A]).toEqual({ x: 40, y: 40 });
    expect(updateBoard(save, CASE_001, (b) => b, T2)).toBe(save);
  });

  it('records attempts in order and closes the case on a correct one', () => {
    const base = { answers: {}, citations: {} };
    let save = recordAttempt(createSave(T0), CASE_001, { ...base, submittedAt: T1.toISOString(), outcome: 'partial' });
    expect(caseStatus(save, CASE_001)).toBe('opened');
    save = recordAttempt(save, CASE_001, { ...base, submittedAt: T2.toISOString(), outcome: 'correct' });
    expect(save.cases[CASE_001]?.attempts.map((a) => a.outcome)).toEqual(['partial', 'correct']);
    expect(caseStatus(save, CASE_001)).toBe('closed');
  });

  it('sets, unsets, and clears highlights per document', () => {
    let save = setHighlight(createSave(T0), CASE_001, EV_A, 'b0', true, T1);
    save = setHighlight(save, CASE_001, EV_A, 'b1.2', true, T1);
    save = setHighlight(save, CASE_001, EV_B, 'b0', true, T1);
    expect(save.cases[CASE_001]?.highlights).toEqual({ 'ev-a': ['b0', 'b1.2'], 'ev-b': ['b0'] });
    expect(setHighlight(save, CASE_001, EV_A, 'b0', true, T2)).toBe(save);
    save = setHighlight(save, CASE_001, EV_B, 'b0', false, T2);
    expect(save.cases[CASE_001]?.highlights).toEqual({ 'ev-a': ['b0', 'b1.2'] });
    save = clearHighlights(save, CASE_001, EV_A, T2);
    expect(save.cases[CASE_001]?.highlights).toEqual({});
    expect(clearHighlights(save, CASE_001, EV_A, T2)).toBe(save);
  });
});
