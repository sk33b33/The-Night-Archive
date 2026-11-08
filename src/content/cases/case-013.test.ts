import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { availableEvidence, isAmended, searchDiscovery, searchRegisters } from '../../domain/evidence';
import { CASE_013, CASE_013_IDS, WARD_DISCOVERY } from './case-013';

const C12 = caseId('case-012');
const C13 = caseId('case-013');
const crossref = CASE_013.evidence.find((e) => e.id === CASE_013_IDS.crossref);
if (crossref?.kind !== 'registry') throw new Error('missing cross-reference');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'registers-ward': encodeSelection(['facility']),
    'ward-post': 'courier',
    'ward-order': encodeOrder(['joined', 'out', 'report', 'sb07', 'ended']),
    'after-out': 'none',
    'same-ward': 'unknown',
  },
  citations: {
    'registers-ward': [CASE_013_IDS.note],
    'ward-post': [CASE_013_IDS.note],
    'ward-order': [CASE_013_IDS.facility, CASE_013_IDS.courier, CASE_013_IDS.report, CASE_013_IDS.sb07],
    'after-out': [CASE_013_IDS.courier],
    'same-ward': [CASE_013_IDS.note, CASE_013_IDS.roster],
  },
};

const hits = (query: string) =>
  Object.fromEntries(searchRegisters(crossref, query).map((r) => [r.register.id, r.matches.map((m) => m.name)]));

describe('Case 013', () => {
  it('follows Case 012', () => {
    expect(isCaseAvailable(CASE_013, (id) => id === C12)).toBe(true);
    expect(isCaseAvailable(CASE_013, () => false)).toBe(false);
  });

  it('only the records facility register has a Ward; near matches never match', () => {
    expect(hits('Ward')).toEqual({ railway: [], facility: ['E. Ward'], exchange: [], police: [] });
    expect(hits('ward')).toEqual(hits('WARD'));
    expect(hits('E. Ward').facility).toEqual(['E. Ward']);
    expect(hits('Warden').railway).toEqual(['E. Warden']);
    expect(hits('Edwards').police).toEqual(['PC H. Edwards']);
    expect(hits('Elias Ward').facility).toEqual([]);
  });

  it('the Bellwether roster names appear in the railway register', () => {
    for (const name of ['Hale', 'Okafor', 'Brennan']) expect(hits(name).railway).toHaveLength(1);
  });

  it('searching “Ward” files the note; near matches and empty searches do not', () => {
    expect(searchDiscovery(crossref, 'Ward')).toBe(WARD_DISCOVERY);
    expect(searchDiscovery(crossref, ' e. ward ')).toBe(WARD_DISCOVERY);
    for (const q of ['Warden', 'Edwards', 'War', '', 'Elias Ward']) expect(searchDiscovery(crossref, q)).toBeUndefined();
  });

  it('accepts the supported findings', () => {
    expect(evaluateDeduction(CASE_013.questions, SUPPORTED).outcome).toBe('correct');
  });

  it.each([
    ['registers-ward', encodeSelection(['facility', 'railway'])],
    ['ward-post', 'station'],
    ['ward-post', 'signalman'],
    ['after-out', 'returned'],
    ['same-ward', 'same'],
    ['same-ward', 'different'],
  ])('never accepts an unsupported answer (%s = %s)', (q, answer) => {
    expect(evaluateDeduction(CASE_013.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: answer } }).outcome).toBe(
      'partial',
    );
  });

  it('no finding names Ward as the caller, as Elias, or as sent by M.', () => {
    const text = CASE_013.questions.map((q) => q.finding).join(' ');
    expect(text).not.toMatch(/Ward (made|placed) the call|Ward is Elias|sent by M|authoris/i);
  });

  it('end beat A: the night desk log comes on file only once Case 013 closes, and counts as changed', () => {
    const desk = CASE_013.evidence.find((e) => e.id === CASE_013_IDS.nightDesk);
    if (!desk) throw new Error('missing night desk log');
    expect(availableEvidence(CASE_013.evidence, [WARD_DISCOVERY]).map((e) => e.id)).not.toContain(desk.id);
    expect(availableEvidence(CASE_013.evidence, [], (id) => id === C13).map((e) => e.id)).toContain(desk.id);
    expect(isAmended(desk, () => false)).toBe(false);
    expect(isAmended(desk, (id) => id === C13)).toBe(true);
  });
});
