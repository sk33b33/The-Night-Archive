import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { effectiveDocument, type DocumentEvidence } from '../../domain/evidence';
import { FINALE } from '../archive';
import { CONTENT_INDEX } from './index';
import { CASE_014, CASE_014_IDS } from './case-014';

const C13 = caseId('case-013');
const C14 = caseId('case-014');

function doc(id: string): DocumentEvidence {
  const item = CASE_014.evidence.find((e) => e.id === id);
  if (item?.kind !== 'document') throw new Error(`missing ${id}`);
  return item;
}
const text = (item: DocumentEvidence, chosen: string | undefined, closed = true) =>
  JSON.stringify(
    effectiveDocument(
      item,
      (id) => closed && id === C14,
      (choiceId, value) => choiceId === FINALE.choiceId && value === chosen,
    ),
  );

const SUPPORTED: DeductionSubmission = {
  answers: {
    named: 'post-mara',
    addressed: 'night-archivist',
    'logged-0031': encodeSelection(['exchange', 'extension']),
    years: encodeOrder(['sealed', 'call-1981', 'withdrawn', 'created', 'tonight']),
    how: 'unknown',
  },
  citations: {
    named: [CASE_014_IDS.post],
    addressed: [CASE_014_IDS.post, CASE_014_IDS.tonight],
    'logged-0031': [CASE_014_IDS.exchange, CASE_014_IDS.extensionLog],
    years: [CASE_014_IDS.dates],
    how: [CASE_014_IDS.reel, CASE_014_IDS.post],
  },
};

describe('Case 014', () => {
  it('follows Case 013', () => {
    expect(isCaseAvailable(CASE_014, (id) => id === C13)).toBe(true);
    expect(isCaseAvailable(CASE_014, () => false)).toBe(false);
  });

  it('reveal level 2: one record names “Mara —”, surname withheld', () => {
    const post = JSON.stringify(doc(CASE_014_IDS.post).document);
    expect(post).toContain('Mara —');
    expect(post).toContain('Surname withheld.');
    const naming = CASE_014.evidence.filter((e) => e.kind === 'document' && JSON.stringify(e.document).includes('Mara'));
    expect(naming.map((e) => e.id)).toEqual([CASE_014_IDS.post]);
  });

  it('accepts the supported findings, which do not depend on the choice', () => {
    expect(evaluateDeduction(CASE_014.questions, SUPPORTED).outcome).toBe('correct');
  });

  it.each([
    ['named', 'post-m'],
    ['addressed', 'player-self'],
    ['addressed', 'ward'],
    ['logged-0031', encodeSelection(['exchange', 'extension', 'night-desk'])],
    ['how', 'same-person'],
    ['how', 'recorded-tonight'],
  ])('never accepts an unsupported answer (%s = %s)', (q, answer) => {
    expect(evaluateDeduction(CASE_014.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: answer } }).outcome).toBe(
      'partial',
    );
  });

  it('no finding says the player made a call, owns the voice, is the 1979 M., or wrote the slip', () => {
    const findings = CASE_014.questions.map((q) => q.finding).join(' ');
    expect(findings).not.toMatch(/\byou\b|your voice|same person|Mara wrote|time travel/i);
  });

  it('the closing choice is the finale’s, and both options are known to the save', () => {
    expect(CASE_014.closingChoice?.id).toBe(FINALE.choiceId);
    const values = CASE_014.closingChoice?.options.map((o) => o.value);
    expect(values).toEqual(['filed', 'unfiled']);
    for (const v of values ?? []) {
      expect(CONTENT_INDEX.isKnownChoice(FINALE.choiceId, v)).toBe(true);
      expect(FINALE.shiftLine[v]).toBeTruthy();
      expect(FINALE.ending[v]).toBeTruthy();
    }
    expect(CONTENT_INDEX.isKnownChoice(FINALE.choiceId, 'maybe')).toBe(false);
    // Neither option is presented as the right one.
    expect(JSON.stringify(CASE_014.closingChoice)).not.toMatch(/correct|right|wrong|should/i);
  });

  it('before the choice, every record reads as it stands', () => {
    for (const id of [CASE_014_IDS.slip, CASE_014_IDS.ledger, CASE_014_IDS.nightDesk]) {
      expect(text(doc(id), 'filed', false)).toBe(JSON.stringify(doc(id).document));
      expect(text(doc(id), undefined)).toBe(JSON.stringify(doc(id).document));
    }
  });

  it('filed ending: the slip is signed and the ledger line is filed; the 1981 log is unchanged', () => {
    expect(text(doc(CASE_014_IDS.slip), 'filed')).toContain('Received by: night archivist, NA-07. 06:12.');
    expect(text(doc(CASE_014_IDS.ledger), 'filed')).toContain('["0094","06:00","Photograph","M.","Filed"]');
    expect(text(doc(CASE_014_IDS.nightDesk), 'filed')).not.toContain('06:12');
  });

  it('unfiled ending: the slip stays blank, the ledger says not filed, and the 1981 log gains a line', () => {
    expect(text(doc(CASE_014_IDS.slip), 'unfiled')).not.toContain('Received by: night archivist');
    expect(text(doc(CASE_014_IDS.ledger), 'unfiled')).toContain('"Not filed"');
    expect(text(doc(CASE_014_IDS.nightDesk), 'unfiled')).toContain('["06:12","Not filed."]');
  });
});
