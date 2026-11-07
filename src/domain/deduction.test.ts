import { describe, expect, it } from 'vitest';
import { CASE_001_IDS } from '../content/cases/case-001';
import { CASE_001_QUESTIONS as questions } from '../content/cases/case-001-deduction';
import {
  citationsSatisfy,
  evaluateDeduction,
  hintFor,
  isComplete,
  isOrdering,
  isSolved,
  type DeductionAttempt,
  type DeductionSubmission,
} from './deduction';

const { report, roster, audioReel, filteredSegment, timetable } = CASE_001_IDS;

const SUPPORTED: DeductionSubmission = {
  answers: {
    'report-reliability': 'unreliable',
    'recording-content': 'omitted',
    'caller-identity': 'unknown',
  },
  citations: {
    'report-reliability': [roster],
    'recording-content': [report, audioReel],
    'caller-identity': [roster],
  },
};

function attempt(submission: DeductionSubmission, n = 0): DeductionAttempt {
  return {
    ...submission,
    submittedAt: new Date(2026, 0, 1, 0, n).toISOString(),
    outcome: evaluateDeduction(questions, submission).outcome,
  };
}

function withAnswer(questionId: string, optionId: string): DeductionSubmission {
  return { ...SUPPORTED, answers: { ...SUPPORTED.answers, [questionId]: optionId } };
}

describe('citations', () => {
  it('requires all of allOf and one of anyOf', () => {
    const rule = { allOf: [report], anyOf: [audioReel, filteredSegment] };
    expect(citationsSatisfy(rule, [report, filteredSegment])).toBe(true);
    expect(citationsSatisfy(rule, [report])).toBe(false);
    expect(citationsSatisfy(rule, [audioReel])).toBe(false);
    expect(citationsSatisfy({ allOf: [], anyOf: [] }, [])).toBe(true);
  });
});

describe('evaluateDeduction (Case 001)', () => {
  it('accepts the supported findings with sufficient citations', () => {
    expect(evaluateDeduction(questions, SUPPORTED).outcome).toBe('correct');
  });

  it('extra citations do not hurt', () => {
    const extra = {
      ...SUPPORTED,
      citations: { ...SUPPORTED.citations, 'caller-identity': [roster, timetable, report] },
    };
    expect(evaluateDeduction(questions, extra).outcome).toBe('correct');
  });

  it('is incomplete when answers are right but citations do not show them', () => {
    const uncited = { ...SUPPORTED, citations: {} };
    expect(evaluateDeduction(questions, uncited).outcome).toBe('incomplete');
    const half = { ...SUPPORTED, citations: { ...SUPPORTED.citations, 'recording-content': [audioReel] } };
    expect(evaluateDeduction(questions, half)).toEqual({
      outcome: 'incomplete',
      results: { 'report-reliability': 'holds', 'recording-content': 'uncited', 'caller-identity': 'holds' },
    });
  });

  it.each([
    ['caller-identity', 'elias-ward'],
    ['caller-identity', 'mara'],
    ['caller-identity', 'second-voice'],
    ['report-reliability', 'falsified'],
    ['recording-content', 'incident-proven'],
  ])('never accepts an unsupported theory (%s = %s)', (questionId, optionId) => {
    expect(evaluateDeduction(questions, withAnswer(questionId, optionId)).outcome).toBe('partial');
  });

  it('is incorrect when no answer is supported', () => {
    const wrong = {
      answers: {
        'report-reliability': 'reliable',
        'recording-content': 'nothing-new',
        'caller-identity': 'elias-ward',
      },
      citations: SUPPORTED.citations,
    };
    expect(evaluateDeduction(questions, wrong).outcome).toBe('incorrect');
  });

  it('is deterministic', () => {
    const a = evaluateDeduction(questions, withAnswer('caller-identity', 'mara'));
    const b = evaluateDeduction(questions, withAnswer('caller-identity', 'mara'));
    expect(a).toEqual(b);
  });

  it('knows when every question is answered', () => {
    expect(isComplete(questions, SUPPORTED)).toBe(true);
    expect(isComplete(questions, { answers: { 'report-reliability': 'unreliable' }, citations: {} })).toBe(
      false,
    );
    expect(isComplete(questions, withAnswer('caller-identity', 'not-an-option'))).toBe(false);
  });

  it('the supported answers are reachable with initial evidence alone', () => {
    // The filtered segment is optional: the case can close without the discovery.
    expect(JSON.stringify(SUPPORTED.citations)).not.toContain(filteredSegment);
  });
});

describe('hints', () => {
  it('gives no hint before any attempt or after a correct one', () => {
    expect(hintFor(questions, [])).toBeNull();
    expect(hintFor(questions, [attempt(SUPPORTED)])).toBeNull();
  });

  it('gets more specific with each failed attempt, then stays at the last hint', () => {
    const wrong = attempt(withAnswer('caller-identity', 'mara'));
    const caller = questions.find((q) => q.id === 'caller-identity');
    expect(hintFor(questions, [wrong])).toBe(caller?.hints[0]);
    expect(hintFor(questions, [wrong, wrong])).toBe(caller?.hints[1]);
    expect(hintFor(questions, [wrong, wrong, wrong])).toBe(caller?.hints[1]);
  });

  it('points at citations when the answer is right but uncited', () => {
    const uncited = attempt({ ...SUPPORTED, citations: { ...SUPPORTED.citations, 'caller-identity': [] } });
    expect(hintFor(questions, [uncited])).toBe(
      questions.find((q) => q.id === 'caller-identity')?.citationHint,
    );
  });

  it('a case is solved once any attempt is correct', () => {
    expect(isSolved([attempt(withAnswer('caller-identity', 'mara')), attempt(SUPPORTED, 1)])).toBe(true);
    expect(isSolved([attempt(withAnswer('caller-identity', 'mara'))])).toBe(false);
  });
});

describe('Case 001 question content', () => {
  it('every question has a valid supported option, hints, and a finding', () => {
    for (const q of questions) {
      if (isOrdering(q)) throw new Error('Case 001 has no ordering questions');
      expect(q.options.map((o) => o.id)).toContain(q.supportedOptionId);
      expect(q.hints.length).toBeGreaterThanOrEqual(2);
      expect(q.finding.length).toBeGreaterThan(10);
    }
  });

  it('accepted findings never name a caller', () => {
    for (const q of questions) expect(q.finding).not.toMatch(/Elias|Ward|Mara/);
  });
});
