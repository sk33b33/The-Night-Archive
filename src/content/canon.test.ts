import { describe, expect, it } from 'vitest';
import type { CaseDefinition } from '../domain/case';
import { effectiveDocument, type DocumentBlock, type DocumentEvidence, type EvidenceItem } from '../domain/evidence';
import { CASES } from './cases';

/**
 * Cross-case canon. Seasons 1 and 2 are one night (plus 1981), and many
 * records are filed again as copies in later cases. A copy must say what
 * its original says, as amended by the time the later case opens, so an
 * edit to one record cannot quietly contradict another. See the season
 * rule "every timestamp must agree across cases".
 */

const ALL_CLOSED = () => true;

function caseNumber(c: CaseDefinition): number {
  return Number(c.number);
}

/** Every item with this title, with the case it is filed in. */
function copies(title: string | RegExp): { caseFile: CaseDefinition; item: EvidenceItem }[] {
  return CASES.flatMap((caseFile) =>
    caseFile.evidence
      .filter((item) => (typeof title === 'string' ? item.title === title : title.test(item.title)))
      .map((item) => ({ caseFile, item })),
  );
}

function asDocument(item: EvidenceItem): DocumentEvidence {
  if (item.kind !== 'document') throw new Error(`${item.id} is not a document`);
  return item;
}

/**
 * A document as it reads when a later case opens: amendments from cases
 * closed before then are in effect. Amendments from the copy's own case or
 * later are not, and no closing choice has been made.
 */
function asReadIn(item: DocumentEvidence, beforeCase: number): readonly DocumentBlock[] {
  return effectiveDocument(item, (id) => Number(id.slice(-3)) < beforeCase).blocks;
}

const tables = (blocks: readonly DocumentBlock[]) => blocks.flatMap((b) => (b.type === 'table' ? [b.rows] : []));
const fields = (blocks: readonly DocumentBlock[]) =>
  Object.fromEntries(blocks.flatMap((b) => (b.type === 'fields' ? b.fields.map((f) => [f.label, f.value]) : [])));
const annotations = (blocks: readonly DocumentBlock[]) =>
  blocks.flatMap((b) => (b.type === 'annotation' ? [b.text] : []));

const original = (title: string) => {
  const first = copies(title).sort((a, b) => caseNumber(a.caseFile) - caseNumber(b.caseFile))[0];
  if (!first) throw new Error(`no ${title}`);
  return first;
};

describe('cross-case canon', () => {
  it('copies of the 1981 incident report agree with Case 001 as amended', () => {
    const source = asDocument(original('Incident report').item);
    for (const { caseFile, item } of copies('Incident report, 1981')) {
      const before = caseNumber(caseFile);
      const expected = asReadIn(source, before);
      const copy = asDocument(item).document.blocks;
      for (const [label, value] of Object.entries(fields(copy))) {
        expect(fields(expected)[label], `${caseFile.id}: ${label}`).toBe(value);
      }
      for (const note of annotations(copy)) expect(annotations(expected), caseFile.id).toContain(note);
    }
  });

  it('copies of the 1981 duty roster agree with Case 001', () => {
    const source = tables(asDocument(original('Duty roster').item).document.blocks);
    for (const { caseFile, item } of copies('Duty roster, 1981')) {
      expect(tables(asDocument(item).document.blocks), caseFile.id).toEqual(source);
    }
  });

  it('every copy of tonight’s intake ledger gives 0093 and 0094 the same time, description and filer', () => {
    const seen: string[][] = [];
    for (const { caseFile, item } of copies('Intake ledger, tonight')) {
      const rows = tables(effectiveDocument(asDocument(item), ALL_CLOSED).blocks).flat();
      for (const row of rows) {
        if (row[0] === '0093' || row[0] === '0094') {
          seen.push([caseFile.id, ...row.slice(0, 4)]);
          // Case 008 reads the ledger before the slip exists: 0094 is reserved, its time filled in at 06:00.
          if (caseFile.id === 'case-008' && row[0] === '0094') {
            expect(row.slice(1, 4)).toEqual(['06:00', 'Reserved', '']);
            continue;
          }
          expect(row.slice(1, 4), `${caseFile.id} ${row[0]}`).toEqual(
            row[0] === '0093' ? ['03:40', 'Photograph', 'M.'] : ['06:00', 'Photograph', 'M.'],
          );
        }
      }
    }
    expect(seen.length).toBeGreaterThanOrEqual(6);
  });

  it('copies of the SB-07 line agree with Case 011’s inventory as amended', () => {
    const inventory = asDocument(original('Sealing inventory, 1981').item);
    const sb07 = tables(effectiveDocument(inventory, ALL_CLOSED).blocks)
      .flat()
      .find((r) => r[1] === 'SB-07');
    expect(sb07).toBeDefined();
    for (const { caseFile, item } of copies('Sealing inventory, SB-07 line')) {
      expect(tables(asDocument(item).document.blocks).flat(), caseFile.id).toEqual([sb07]);
    }
  });

  it('the 1981 exchange record and night desk log read the same wherever filed', () => {
    const exchange = copies(/^Exchange record, route BW-4/).map(({ item }) => tables(asDocument(item).document.blocks));
    expect(exchange.length).toBe(2);
    expect(exchange[1]).toEqual(exchange[0]);
    // Before the finale's choice, the 1981 night desk log is one line.
    const desk = copies(/^Night desk log/).map(({ item }) => tables(asDocument(item).document.blocks));
    expect(desk.length).toBe(2);
    expect(desk[1]).toEqual(desk[0]);
  });

  it('copies of the building history and the audio comparison note agree', () => {
    const history = copies(/^Building history/).map(({ item }) => tables(asDocument(item).document.blocks));
    expect(history.length).toBe(2);
    expect(history[1]).toEqual(history[0]);
    const notes = copies('Audio comparison note').map(({ item }) => asDocument(item).document);
    expect(notes.length).toBe(2);
    expect(notes[1]).toEqual(notes[0]);
  });

  it('copies of recordings use the same timeline as their originals', () => {
    for (const title of ['Audio reel, 1981', 'NA-07 answerphone recording']) {
      const timelines = copies(title).map(({ item }) => (item.kind === 'audio' ? item.timeline : null));
      expect(new Set(timelines).size, title).toBe(1);
    }
  });

  it('the post record holder is “M. —” until the finale’s personnel copy names “Mara —”', () => {
    for (const { caseFile, item } of copies(/post record/i)) {
      const holder = fields(asDocument(item).document.blocks).Holder;
      expect(holder, caseFile.id).toBe(caseFile.id === 'case-014' ? 'Mara —' : 'M. —');
    }
    // No record before the finale names Mara; only the 1981 reel's voice does.
    for (const caseFile of CASES.filter((c) => caseNumber(c) < 14)) {
      for (const item of caseFile.evidence) {
        if (item.kind === 'document') expect(JSON.stringify(item.document), `${caseFile.id} ${item.id}`).not.toContain('Mara');
      }
    }
  });
});
