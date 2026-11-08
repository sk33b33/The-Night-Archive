import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { withAmendments, type DocumentEvidence } from '../../domain/evidence';
import { CASE_011, CASE_011_IDS } from './case-011';
import { BOXES_IN_0094, boxPlace, PHOTO_0094_REGIONS } from './case-011-storage';

const C10 = caseId('case-010');
const C11 = caseId('case-011');

function doc(id: string): DocumentEvidence {
  const item = CASE_011.evidence.find((e) => e.id === id);
  if (item?.kind !== 'document') throw new Error(`missing ${id}`);
  return item;
}

/** Rows of a document's first table. */
function rows(item: DocumentEvidence): readonly (readonly string[])[] {
  const table = item.document.blocks.find((b) => b.type === 'table');
  if (table?.type !== 'table') throw new Error('no table');
  return table.rows;
}

/** Box numbers in a cell such as "SB-08 – SB-30" or "SB-07"; none for anything else. */
function boxes(cell: string): number[] {
  const m = /^SB-(\d\d)(?: – SB-(\d\d))?$/.exec(cell);
  if (!m) return [];
  const from = Number(m[1]);
  const to = Number(m[2] ?? m[1]);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const sealed = rows(doc(CASE_011_IDS.inventory)).flatMap((r) => boxes(r[1] ?? ''));
const transferred = rows(doc(CASE_011_IDS.clearance))
  .filter((r) => r[1] === 'Transferred to stack room')
  .flatMap((r) => boxes(r[0] ?? ''));
const notFound = rows(doc(CASE_011_IDS.clearance))
  .filter((r) => r[1] === 'Not found')
  .flatMap((r) => boxes(r[0] ?? ''));
const received = rows(doc(CASE_011_IDS.accession)).flatMap((r) => boxes(r[0] ?? ''));

const SUPPORTED: DeductionSubmission = {
  answers: {
    'sealed-count': '48',
    unaccounted: '3',
    'which-boxes': encodeSelection(['sb07', 'sb31', 'sb40']),
    'photo-shows': 'storage-b-three',
    'photo-when': 'unknown',
  },
  citations: {
    'sealed-count': [CASE_011_IDS.inventory],
    unaccounted: [CASE_011_IDS.inventory, CASE_011_IDS.clearance, CASE_011_IDS.accession],
    'which-boxes': [CASE_011_IDS.clearance, CASE_011_IDS.accession],
    'photo-shows': [CASE_011_IDS.location, CASE_011_IDS.photo],
    'photo-when': [CASE_011_IDS.history, CASE_011_IDS.ledger],
  },
};

describe('Case 011', () => {
  it('follows Case 010', () => {
    expect(isCaseAvailable(CASE_011, (id) => id === C10)).toBe(true);
    expect(isCaseAvailable(CASE_011, () => false)).toBe(false);
  });

  it('the records reconcile exactly as the findings say', () => {
    expect([...sealed].sort((a, b) => a - b)).toEqual(Array.from({ length: 48 }, (_, i) => i + 1));
    expect(transferred).toHaveLength(46);
    expect(notFound).toEqual([7, 31]);
    expect(received).toHaveLength(45);
    expect(transferred.filter((n) => !received.includes(n))).toEqual([40]);
    expect(received.every((n) => transferred.includes(n))).toBe(true);
    const unaccounted = sealed.filter((n) => !received.includes(n)).sort((a, b) => a - b);
    expect(unaccounted).toEqual([...BOXES_IN_0094]);
  });

  it('stated totals match the rows', () => {
    const clearanceFields = doc(CASE_011_IDS.clearance).document.blocks.find((b) => b.type === 'fields');
    if (clearanceFields?.type !== 'fields') throw new Error('no fields');
    expect(clearanceFields.fields.find((f) => f.label === 'Transferred')?.value).toBe(String(transferred.length));
    expect(clearanceFields.fields.find((f) => f.label === 'Not found')?.value).toBe(String(notFound.length));
    const accession = rows(doc(CASE_011_IDS.accession));
    expect(accession.at(-1)).toEqual(['Total received', String(received.length)]);
    for (const r of accession.slice(0, -1)) expect(Number(r[1])).toBe(boxes(r[0] ?? '').length);
  });

  it('the inventory shelves agree with the drawn layout', () => {
    const inventory = rows(doc(CASE_011_IDS.inventory));
    const shelf2 = inventory.filter((r) => r[0] === 'Bay A, shelf 2').flatMap((r) => boxes(r[1] ?? ''));
    expect(shelf2.sort((a, b) => a - b)).toEqual([7, 8, 9, 10, 11, 12]);
    // SB-07 and SB-08 sit side by side on the same plank.
    expect(boxPlace(7).y).toBe(boxPlace(8).y);
    expect(boxPlace(40).y).toBe(boxPlace(37).y);
    expect(PHOTO_0094_REGIONS.filter((r) => r.id.startsWith('box-'))).toHaveLength(3);
  });

  it('accepts the supported findings, and a count needs all three records', () => {
    expect(evaluateDeduction(CASE_011.questions, SUPPORTED).outcome).toBe('correct');
    const thin = { ...SUPPORTED, citations: { ...SUPPORTED.citations, unaccounted: [CASE_011_IDS.clearance] } };
    expect(evaluateDeduction(CASE_011.questions, thin).outcome).toBe('incomplete');
  });

  it.each([
    ['sealed-count', '46'],
    ['unaccounted', '2'],
    ['unaccounted', '1'],
    ['which-boxes', encodeSelection(['sb07', 'sb31'])],
    ['photo-shows', 'storage-b-tonight'],
    ['photo-when', 'tonight'],
    ['photo-when', 'sealing'],
  ])('never accepts an unsupported answer (%s = %s)', (q, answer) => {
    expect(evaluateDeduction(CASE_011.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: answer } }).outcome).toBe(
      'partial',
    );
  });

  it('no finding asserts an act, a theft, or what SB-07 contains', () => {
    const text = CASE_011.questions.map((q) => q.finding).join(' ');
    expect(text).not.toMatch(/stol|theft|took|removed|key|tonight’s photograph/i);
  });

  it('end beat A: the SB-07 line names its contents once Case 011 closes', () => {
    const inventory = doc(CASE_011_IDS.inventory);
    expect(rows(withAmendments(inventory, () => false))[1]?.[2]).toContain('Contents: not listed.');
    const amended = rows(withAmendments(inventory, (id) => id === C11));
    expect(amended[1]?.[1]).toBe('SB-07');
    expect(amended[1]?.[2]).toContain('Contents: east door key, Bellwether.');
  });
});
