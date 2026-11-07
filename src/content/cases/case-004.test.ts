import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import {
  encodeSelection,
  evaluateDeduction,
  evaluateFinding,
  hintFor,
  isComplete,
  isMulti,
  selectionOf,
  type DeductionAttempt,
  type DeductionSubmission,
  type MultiQuestion,
} from '../../domain/deduction';
import { allPassageKeys, effectiveDocument, evidenceUnlockedBy, passageKeys } from '../../domain/evidence';
import { FILE_0091 } from '../anomalies/file-0091';
import { DESK_PAPERS_DISCOVERY, CASE_004, CASE_004_IDS } from './case-004';

const C3 = caseId('case-003');
const C4 = caseId('case-004');
const multi = CASE_004.questions.find(isMulti) as MultiQuestion;

const SUPPORTED: DeductionSubmission = {
  answers: {
    intake: 'voided',
    papers: 'ledger-0091',
    'print-origin': 'unknown',
    'placed-in-1981': encodeSelection(['imprint', 'paper', 'order']),
  },
  citations: {
    intake: [CASE_004_IDS.ledger],
    papers: [CASE_004_IDS.papers],
    'print-origin': [CASE_004_IDS.print, CASE_004_IDS.orders],
    'placed-in-1981': [CASE_004_IDS.photo, CASE_004_IDS.print],
  },
};

const attempt = (submission: DeductionSubmission): DeductionAttempt => ({
  ...submission,
  submittedAt: '2026-01-01T00:00:00.000Z',
  outcome: evaluateDeduction(CASE_004.questions, submission).outcome,
});

describe('Case 004 availability', () => {
  it('appears after Case 003 and takes over the File 0091 anomaly', () => {
    expect(isCaseAvailable(CASE_004, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_004, (id) => id === C3)).toBe(true);
    expect(CASE_004.replacesAnomaly).toBe(FILE_0091.id);
  });
});

describe('select-all-that-apply questions', () => {
  it('normalises selections', () => {
    expect(selectionOf(multi, 'paper,imprint,paper,bogus')).toEqual(['imprint', 'paper']);
    expect(encodeSelection(['order', 'imprint'])).toBe('imprint,order');
  });

  it('holds only for the exact supported set', () => {
    expect(evaluateFinding(multi, SUPPORTED)).toBe('holds');
    const missing = { ...SUPPORTED, answers: { ...SUPPORTED.answers, 'placed-in-1981': 'imprint,order' } };
    const extra = { ...SUPPORTED, answers: { ...SUPPORTED.answers, 'placed-in-1981': 'imprint,order,paper,register' } };
    expect(evaluateFinding(multi, missing)).toBe('unsupported');
    expect(evaluateFinding(multi, extra)).toBe('unsupported');
  });

  it('hints distinguish a missing record from an extra one', () => {
    const missing = attempt({ ...SUPPORTED, answers: { ...SUPPORTED.answers, 'placed-in-1981': 'imprint' } });
    const extra = attempt({ ...SUPPORTED, answers: { ...SUPPORTED.answers, 'placed-in-1981': 'imprint,order,paper,building' } });
    expect(hintFor(CASE_004.questions, [missing])).toBe(multi.missingHint);
    expect(hintFor(CASE_004.questions, [extra])).toBe(multi.extraHint);
  });

  it('needs at least one selection to count as answered', () => {
    expect(isComplete(CASE_004.questions, SUPPORTED)).toBe(true);
    expect(isComplete(CASE_004.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, 'placed-in-1981': '' } })).toBe(false);
  });
});

describe('Case 004 findings', () => {
  it('accepts the supported findings', () => {
    expect(evaluateDeduction(CASE_004.questions, SUPPORTED).outcome).toBe('correct');
  });

  it('requires the desk-papers enlargement', () => {
    const noPapers = { ...SUPPORTED, citations: { ...SUPPORTED.citations, papers: [CASE_004_IDS.photo] } };
    expect(evaluateDeduction(CASE_004.questions, noPapers).outcome).toBe('incomplete');
    expect(evidenceUnlockedBy(CASE_004, DESK_PAPERS_DISCOVERY).map((e) => e.id)).toEqual([CASE_004_IDS.papers]);
  });

  it.each([
    ['intake', 'lost-record'],
    ['intake', 'never-used'],
    ['papers', 'illegible'],
    ['print-origin', 'yes'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_004.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('never settles the date or names who filed it', () => {
    for (const q of CASE_004.questions) {
      expect(q.finding).not.toMatch(/was taken in|taken after|filed by|night archivist|\bM\./i);
    }
  });
});

describe('Case 004 content', () => {
  it('the print’s chain of custody begins with the player', () => {
    const print = CASE_004.evidence.find((e) => e.id === CASE_004_IDS.print);
    if (print?.kind !== 'object') throw new Error('missing print');
    expect(print.provenance).toHaveLength(1);
    expect(print.provenance[0]?.holder).toContain('NA-07');
  });

  it('the ledger voids 0091 between 0090 and 0092', () => {
    const ledger = CASE_004.evidence.find((e) => e.id === CASE_004_IDS.ledger);
    if (ledger?.kind !== 'document') throw new Error('missing ledger');
    const table = ledger.document.blocks[0];
    expect(table?.type === 'table' && table.rows.map((r) => r[0])).toEqual(['0089', '0090', '0091', '0092']);
    expect(table?.type === 'table' && table.rows[2]).toEqual(['0091', '', '[Line ruled through]', '']);
  });
});

describe('Case 004 end beat: the voided line gains a date', () => {
  const ledger = CASE_004.evidence.find((e) => e.id === CASE_004_IDS.ledger);
  if (ledger?.kind !== 'document') throw new Error('missing ledger');

  it('is unchanged until Case 004 closes', () => {
    expect(effectiveDocument(ledger, () => false)).toBe(ledger.document);
  });

  it('dates the 0091 line "14 Oct" without changing any passage key', () => {
    const changed = effectiveDocument(ledger, (id) => id === C4);
    const table = changed.blocks[0];
    expect(table?.type === 'table' && table.rows[2]).toEqual(['0091', '14 Oct', '[Line ruled through]', '']);
    expect(passageKeys(changed)).toEqual(passageKeys(ledger.document));
    expect(allPassageKeys(ledger)).toEqual(passageKeys(ledger.document));
  });
});
