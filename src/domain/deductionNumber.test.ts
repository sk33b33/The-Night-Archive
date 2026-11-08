import { describe, expect, it } from 'vitest';
import { evidenceId } from './evidence';
import {
  evaluateDeduction,
  hintFor,
  isComplete,
  parseCount,
  type DeductionAttempt,
  type DeductionSubmission,
  type NumberQuestion,
} from './deduction';

const ledger = evidenceId('ledger');

const count: NumberQuestion = {
  kind: 'number',
  id: 'count',
  prompt: 'How many?',
  unit: 'boxes',
  supportedValue: 3,
  nearMisses: [{ value: 2, hint: 'Near miss: check the other list.' }],
  requires: { allOf: [ledger], anyOf: [] },
  hints: ['First hint.', 'Second hint.'],
  citationHint: 'Cite the ledger.',
  finding: 'Three are unaccounted for.',
};

const submit = (answer: string, cited = [ledger]): DeductionSubmission => ({
  answers: { count: answer },
  citations: { count: cited },
});

const attempt = (s: DeductionSubmission): DeductionAttempt => ({
  ...s,
  submittedAt: '2026-01-01T00:00:00.000Z',
  outcome: evaluateDeduction([count], s).outcome,
});

describe('numeric questions', () => {
  it('parses whole numbers only', () => {
    expect(parseCount('3')).toBe(3);
    expect(parseCount(' 48 ')).toBe(48);
    expect(parseCount('03')).toBe(3);
    for (const bad of ['', '3.0', '-3', 'three', '1e2', '3 boxes', undefined]) expect(parseCount(bad)).toBeNull();
  });

  it('holds only for the supported value with citations', () => {
    expect(evaluateDeduction([count], submit('3')).outcome).toBe('correct');
    expect(evaluateDeduction([count], submit('3', [])).outcome).toBe('incomplete');
    expect(evaluateDeduction([count], submit('2')).outcome).toBe('incorrect');
  });

  it('is complete only with a whole number', () => {
    expect(isComplete([count], submit(''))).toBe(false);
    expect(isComplete([count], submit('two'))).toBe(false);
    expect(isComplete([count], submit('0'))).toBe(true);
  });

  it('gives the near-miss hint for an authored near miss, otherwise the progressive hints', () => {
    expect(hintFor([count], [attempt(submit('2'))])).toBe('Near miss: check the other list.');
    expect(hintFor([count], [attempt(submit('7'))])).toBe('First hint.');
    expect(hintFor([count], [attempt(submit('3', []))])).toBe('Cite the ledger.');
  });
});
