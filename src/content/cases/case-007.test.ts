import { describe, expect, it } from 'vitest';
import { matchDiscovery, pairSegments, visibleLines } from '../../domain/audio';
import { imprintDate, resolveDateStamp, TONIGHT, visibleAnomalies, withDate } from '../../domain/anomaly';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { documentText, evidenceUnlockedBy } from '../../domain/evidence';
import { ANOMALIES, FILE_0093 } from '../anomalies/file-0091';
import { CASE_001_REEL, VOICE_ISOLATION } from './case-001-audio';
import { CASE_007_TONIGHT, RECORDINGS_MATCH_DISCOVERY } from './case-007-audio';
import { CASE_007, CASE_007_IDS } from './case-007';

const C6 = caseId('case-006');
const C7 = caseId('case-007');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'what-reached': 'matching-call',
    impossible: encodeSelection(['routing', 'register']),
    route: encodeOrder(['in-service', 'withdrawn', 'created', 'received']),
    addressed: 'whoever-answers',
    'who-placed': 'unknown',
  },
  citations: {
    'what-reached': [CASE_007_IDS.extensionLog, CASE_007_IDS.comparison],
    impossible: [CASE_007_IDS.routing],
    route: [CASE_007_IDS.routing, CASE_007_IDS.register],
    addressed: [CASE_007_IDS.tonight],
    'who-placed': [CASE_007_IDS.extensionLog],
  },
};

describe('Case 007', () => {
  it('appears after Case 006 closes', () => {
    expect(isCaseAvailable(CASE_007, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_007, (id) => id === C6)).toBe(true);
  });

  it('tonight’s recording shares every segment with the 1981 reel, and matching the voices files the note', () => {
    const pairs = pairSegments(CASE_007_TONIGHT, CASE_001_REEL);
    expect(pairs.map((p) => p.id)).toEqual(['leader', 'announcement', 'clock', 'voices', 'end']);
    expect(pairs.every((p) => p.left && p.right)).toBe(true);
    const voices = pairs.find((p) => p.id === 'voices');
    expect(voices && matchDiscovery(voices)).toBe(RECORDINGS_MATCH_DISCOVERY);
    expect(evidenceUnlockedBy(CASE_007, RECORDINGS_MATCH_DISCOVERY).map((e) => e.id)).toEqual([CASE_007_IDS.comparison]);
  });

  it('the name is only heard with the filter, as in 1981', () => {
    const voices = CASE_007_TONIGHT.segments.find((s) => s.id === 'voices');
    if (!voices) throw new Error('missing voices');
    expect(visibleLines(voices, new Set()).map((l) => l.text).join(' ')).not.toContain('Mara');
    expect(visibleLines(voices, new Set([VOICE_ISOLATION.id])).map((l) => l.text)).toContain('Mara, don’t file this.');
  });

  it('reveal level 1: no record names the holder of NA-07', () => {
    const text = CASE_007.evidence.flatMap((e) => (e.kind === 'document' ? documentText(e.document) : [])).join('\n');
    expect(text).toContain('M. —');
    expect(text).not.toContain('Mara');
  });

  it('accepts the supported findings and requires the comparison note', () => {
    expect(evaluateDeduction(CASE_007.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, 'what-reached': [CASE_007_IDS.extensionLog] } };
    expect(evaluateDeduction(CASE_007.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['what-reached', 'nothing'],
    ['what-reached', 'new-call'],
    ['addressed', 'you'],
    ['addressed', 'elias'],
    ['who-placed', 'you'],
    ['who-placed', 'elias'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_007.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('findings never explain the mechanism or name anyone', () => {
    for (const q of CASE_007.questions) {
      expect(q.finding).not.toMatch(/time|travel|Mara|Elias|by you|you made/i);
    }
  });
});

describe('Final beat A: File 0093', () => {
  it('appears only once Case 007 is closed', () => {
    expect(visibleAnomalies(ANOMALIES, (id) => id !== C7).map((a) => a.id)).not.toContain('file-0093');
    expect(visibleAnomalies(ANOMALIES, () => true).map((a) => a.id)).toContain('file-0093');
  });

  it('is dated tonight, from the device clock', () => {
    const now = new Date(2026, 10, 8, 3, 40);
    expect(FILE_0093.photograph.dateStamp).toBe(TONIGHT);
    expect(imprintDate(now)).toBe('08 NOV 2026');
    expect(resolveDateStamp(TONIGHT, now)).toBe('08 NOV 2026');
    expect(resolveDateStamp('14 OCT 1981', now)).toBe('14 OCT 1981');
    expect(withDate(FILE_0093.photograph.alt, TONIGHT, now)).toContain('reads 08 NOV 2026.');
  });

  it('is never explained', () => {
    const text = JSON.stringify(FILE_0093).toLowerCase();
    for (const word of ['because', 'explain', 'predict', 'impossible', 'travel', 'future']) expect(text).not.toContain(word);
  });
});
