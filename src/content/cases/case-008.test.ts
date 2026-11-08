import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable, seasonOf } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { effectiveDocument, evidenceUnlockedBy } from '../../domain/evidence';
import { FILE_0093 } from '../anomalies/file-0091';
import { CASE_008, CASE_008_IDS, TIMING_DISCOVERY } from './case-008';
import { CASES } from '.';

const C7 = caseId('case-007');
const C8 = caseId('case-008');

const SUPPORTED: DeductionSubmission = {
  answers: {
    filed: '0340',
    matches: '0512',
    sequence: encodeOrder(['filed', 'lamp', 'delivered', 'moment', 'received']),
    'desk-0512': encodeSelection(['cctv', 'lamp', 'post']),
    sender: 'unknown',
  },
  citations: {
    filed: [CASE_008_IDS.ledger],
    matches: [CASE_008_IDS.timing],
    sequence: [CASE_008_IDS.ledger, CASE_008_IDS.cctv],
    'desk-0512': [CASE_008_IDS.cctv],
    sender: [CASE_008_IDS.post],
  },
};

const footage = CASE_008.evidence.find((e) => e.id === CASE_008_IDS.cctv);
if (footage?.kind !== 'cctv') throw new Error('missing footage');

describe('Case 008', () => {
  it('opens Season 2 after Case 007 closes; earlier cases are Season 1', () => {
    expect(isCaseAvailable(CASE_008, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_008, (id) => id === C7)).toBe(true);
    expect(seasonOf(CASE_008)).toBe(2);
    expect(CASES.filter((c) => c.id !== C8).every((c) => seasonOf(c) === 1)).toBe(true);
  });

  it('does not take over File 0093, so Case 007’s final beat stays visible', () => {
    expect(CASE_008.replacesAnomaly).toBeUndefined();
  });

  it('File 0093 now shows the pre-dawn view: lamp off, envelope, clock at 05:12', () => {
    expect(FILE_0093.photograph.variant).toBe('predawn');
    expect(FILE_0093.photograph.alt).toMatch(/lamp switched off/);
    expect(FILE_0093.photograph.regions.find((r) => r.id === 'wall-clock')?.note).toContain('05:12');
  });

  it('matching the wall clock with the 05:12 still files the timing note', () => {
    for (const id of [CASE_008_IDS.photo, CASE_008_IDS.still]) {
      const photo = CASE_008.evidence.find((e) => e.id === id);
      if (photo?.kind !== 'photo') throw new Error('missing photo');
      expect(photo.regions.find((r) => r.id === 'wall-clock')?.revealsOnMatch).toBe(TIMING_DISCOVERY);
    }
    expect(evidenceUnlockedBy(CASE_008, TIMING_DISCOVERY).map((e) => e.id)).toEqual([CASE_008_IDS.timing]);
  });

  it('the footage agrees with the logs: lamp off 05:08–05:19, envelope from 05:10, desk empty at 05:12', () => {
    const at = (t: string) => footage.frames.find((f) => f.time === t)?.scene;
    expect(at('05:08:10')?.lamp).toBe(false);
    expect(at('05:10:20')).toMatchObject({ porter: true, envelope: true });
    expect(at('05:12:00')).toMatchObject({ lamp: false, envelope: true });
    expect(at('05:12:00')?.archivist).toBeFalsy();
    expect(at('05:19:10')?.lamp).toBe(true);
  });

  it('the envelope stays sealed', () => {
    const envelope = CASE_008.evidence.find((e) => e.id === CASE_008_IDS.envelope);
    if (envelope?.kind !== 'object') throw new Error('missing envelope');
    expect(envelope.details.find((d) => d.label === 'Seal')?.value).toBe('Unbroken');
    expect(envelope.provenance.at(-1)?.action).toBe('Received. Not opened.');
  });

  it('accepts the supported findings and requires the timing note', () => {
    expect(evaluateDeduction(CASE_008.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, matches: [CASE_008_IDS.photo] } };
    expect(evaluateDeduction(CASE_008.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['filed', '0512'],
    ['matches', '0340'],
    ['matches', 'never'],
    ['sender', 'm'],
    ['sender', 'porter'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_008.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('findings record a match and an order, never a prediction or a cause', () => {
    for (const q of CASE_008.questions) expect(q.finding).not.toMatch(/predict|future|because|caused|by M\.|by you/i);
  });

  it('end beat A: 0094’s time fills in as 06:00 once Case 008 closes', () => {
    const ledger = CASE_008.evidence.find((e) => e.id === CASE_008_IDS.ledger);
    if (ledger?.kind !== 'document') throw new Error('missing ledger');
    const before = effectiveDocument(ledger, () => false).blocks[0];
    const after = effectiveDocument(ledger, (id) => id === C8).blocks[0];
    expect(before?.type === 'table' && before.rows[1]).toEqual(['0094', '', 'Reserved', '']);
    expect(after?.type === 'table' && after.rows[1]).toEqual(['0094', '06:00', 'Reserved', '']);
  });
});
