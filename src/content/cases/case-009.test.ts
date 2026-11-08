import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable, seasonOf } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { documentText, effectiveDocument, evidenceUnlockedBy } from '../../domain/evidence';
import { CASE_009, CASE_009_IDS } from './case-009';
import { glyphRegions, HAND_SAMPLES, SAMPLES_DISCOVERY, SPECIMEN_DISCOVERY } from './case-009-hands';

const C8 = caseId('case-008');
const C9 = caseId('case-009');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'one-hand': 'yes',
    standard: 'consistent',
    'named-m': encodeSelection(['register', 'post']),
    records: encodeOrder(['specimen', 'ledger', 'calendar', 'slip']),
    'same-person': 'unknown',
  },
  citations: {
    'one-hand': [CASE_009_IDS.samplesNote, CASE_009_IDS.method],
    standard: [CASE_009_IDS.method],
    'named-m': [CASE_009_IDS.register],
    records: [CASE_009_IDS.register, CASE_009_IDS.slip],
    'same-person': [CASE_009_IDS.register, CASE_009_IDS.post],
  },
};

describe('Case 009', () => {
  it('follows Case 008 in Season 2', () => {
    expect(isCaseAvailable(CASE_009, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_009, (id) => id === C8)).toBe(true);
    expect(seasonOf(CASE_009)).toBe(2);
  });

  it('letterform regions come from the same layout as the artwork', () => {
    const slip = glyphRegions(HAND_SAMPLES.slip);
    expect(slip.map((r) => r.id).sort()).toEqual(['crossed-m', 'open-zero']);
    expect(glyphRegions(HAND_SAMPLES.specimen).find((r) => r.id === 'crossed-m')?.revealsOnMatch).toBe(SPECIMEN_DISCOVERY);
    expect(glyphRegions(HAND_SAMPLES.ledger0091).find((r) => r.id === 'open-zero')?.revealsOnMatch).toBe(SAMPLES_DISCOVERY);
  });

  it('matching letterforms files both comparison notes', () => {
    expect(evidenceUnlockedBy(CASE_009, SPECIMEN_DISCOVERY).map((e) => e.id)).toEqual([CASE_009_IDS.specimenNote]);
    expect(evidenceUnlockedBy(CASE_009, SAMPLES_DISCOVERY).map((e) => e.id)).toEqual([CASE_009_IDS.samplesNote]);
  });

  it('the envelope is opened here, not in Case 008', () => {
    const envelope = CASE_009.evidence.find((e) => e.id === CASE_009_IDS.envelope);
    if (envelope?.kind !== 'object') throw new Error('missing envelope');
    expect(envelope.provenance.at(-1)).toMatchObject({ date: 'Tonight, 05:20', action: 'Opened' });
  });

  it('accepts the supported findings and requires the sample comparison', () => {
    expect(evaluateDeduction(CASE_009.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, 'one-hand': [CASE_009_IDS.method] } };
    expect(evaluateDeduction(CASE_009.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['one-hand', 'no'],
    ['standard', 'same-person'],
    ['same-person', 'yes'],
    ['same-person', 'no'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_009.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('never links the hand to the player, Mara, or a forgery', () => {
    for (const q of CASE_009.questions) expect(q.finding).not.toMatch(/Mara|forg|you wrote|by you|the player/i);
    const text = CASE_009.evidence.flatMap((e) => (e.kind === 'document' ? documentText(e.document) : [])).join('\n');
    expect(text).not.toMatch(/Mara|same person wrote/i);
  });

  it('end beat A: the register gains “— tonight” once Case 009 closes', () => {
    const register = CASE_009.evidence.find((e) => e.id === CASE_009_IDS.register);
    if (register?.kind !== 'document') throw new Error('missing register');
    const before = effectiveDocument(register, () => false).blocks[0];
    const after = effectiveDocument(register, (id) => id === C9).blocks[0];
    expect(before?.type === 'table' && before.rows[0]?.[3]).toBe('1983');
    expect(after?.type === 'table' && after.rows[0]?.[3]).toBe('1983 — tonight');
  });
});
