import { describe, expect, it } from 'vitest';
import { discoveriesAt, segmentAt } from '../../domain/audio';
import { caseId, isCaseAvailable } from '../../domain/case';
import {
  encodeOrder,
  evaluateDeduction,
  evaluateFinding,
  isComplete,
  isOrdering,
  orderOf,
  type DeductionSubmission,
  type OrderingQuestion,
} from '../../domain/deduction';
import { allPassageKeys, documentText, effectiveDocument, passageKeys } from '../../domain/evidence';
import { renderTimeline, rms } from '../../services/audio/reelSynth';
import { BACKGROUND_ISOLATION, CASE_003_CALL, ROOM_SOUND_DISCOVERY } from './case-003-audio';
import { CASE_003, CASE_003_IDS } from './case-003';

const C2 = caseId('case-002');
const C3 = caseId('case-003');
const sequence = CASE_003.questions.find(isOrdering) as OrderingQuestion;

const SUPPORTED: DeductionSubmission = {
  answers: {
    'call-box': 'no',
    'fifth-call-origin': 'private-line',
    caller: 'unknown',
    sequence: encodeOrder(['removed', 'call-1', 'trace-requested', 'call-5', 'refitted']),
  },
  citations: {
    'call-box': [CASE_003_IDS.fault],
    'fifth-call-origin': [CASE_003_IDS.trace],
    caller: [CASE_003_IDS.trace],
    sequence: [CASE_003_IDS.fault, CASE_003_IDS.trace],
  },
};

describe('Case 003 availability', () => {
  it('appears once Case 002 is closed', () => {
    expect(isCaseAvailable(CASE_003, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_003, (id) => id === C2)).toBe(true);
  });
});

describe('ordering questions', () => {
  it('starts from the authored order, which is not the answer', () => {
    expect(orderOf(sequence, undefined)).toEqual(sequence.items.map((i) => i.id));
    expect(orderOf(sequence, undefined)).not.toEqual(sequence.supportedOrder);
  });

  it('ignores malformed stored orders', () => {
    expect(orderOf(sequence, 'removed,removed,call-1,call-5,refitted')).toEqual(sequence.items.map((i) => i.id));
    expect(orderOf(sequence, 'removed,nonsense')).toEqual(sequence.items.map((i) => i.id));
  });

  it('accepts only the supported order, with citations', () => {
    expect(evaluateFinding(sequence, SUPPORTED)).toBe('holds');
    const swapped = { ...SUPPORTED, answers: { ...SUPPORTED.answers, sequence: 'call-1,removed,trace-requested,call-5,refitted' } };
    expect(evaluateFinding(sequence, swapped)).toBe('unsupported');
    expect(evaluateFinding(sequence, { ...SUPPORTED, citations: {} })).toBe('uncited');
  });

  it('always counts as answered', () => {
    const noOrder = { ...SUPPORTED, answers: { ...SUPPORTED.answers, sequence: '' } };
    expect(isComplete(CASE_003.questions, noOrder)).toBe(true);
  });
});

describe('Case 003 findings', () => {
  it('accepts the supported findings', () => {
    expect(evaluateDeduction(CASE_003.questions, SUPPORTED).outcome).toBe('correct');
  });

  it.each([
    ['call-box', 'yes'],
    ['call-box', 'another-box'],
    ['fifth-call-origin', 'harrow-lane'],
    ['caller', 'hoaxer'],
    ['caller', 'pell'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_003.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('the background analysis is optional', () => {
    expect(JSON.stringify(SUPPORTED.citations)).not.toContain(CASE_003_IDS.analysis);
  });

  it('findings name no caller', () => {
    for (const q of CASE_003.questions) expect(q.finding).not.toMatch(/Pell|Ellery|Mara|Ward/);
  });
});

describe('Case 003 content', () => {
  it('records the canon facts', () => {
    const text = CASE_003.evidence.flatMap((e) => (e.kind === 'document' ? documentText(e.document) : [])).join('\n');
    expect(text).toContain('Station Road call box');
    expect(text).toContain('1–10 November 1986');
    expect(text).toContain('Private line, ex-directory');
    expect(text).toContain('[redacted]');
    expect(text).toContain('12 Harrow Lane');
  });

  it('the handset’s chain of custody covers every call', () => {
    const handset = CASE_003.evidence.find((e) => e.id === CASE_003_IDS.handset);
    if (handset?.kind !== 'object') throw new Error('missing handset');
    expect(handset.provenance.map((p) => p.action)).toEqual(['Removed for repair', 'Tagged and stored', 'Refitted']);
    expect(handset.linked).toContain(CASE_003_IDS.fault);
  });

  it('the background filter reveals the room and records the discovery', () => {
    const call = segmentAt(CASE_003_CALL, 8);
    if (!call) throw new Error('missing segment');
    expect(discoveriesAt(call, new Set())).toEqual([]);
    expect(discoveriesAt(call, new Set([BACKGROUND_ISOLATION.id]))).toEqual([ROOM_SOUND_DISCOVERY]);
  });

  it('the filter brings the room sound up in the mix', () => {
    const plain = renderTimeline(CASE_003_CALL, new Set());
    const filtered = renderTimeline(CASE_003_CALL, new Set([BACKGROUND_ISOLATION.id]));
    expect(filtered.every((v) => Number.isFinite(v) && Math.abs(v) <= 1)).toBe(true);
    // Kettle whistle, late in the call segment, with voices suppressed.
    expect(rms(filtered, 15.5, 16.8)).toBeGreaterThan(rms(plain, 15.5, 16.8) * 2);
  });
});

describe('Case 003 end beat: a sixth call appears', () => {
  const log = CASE_003.evidence.find((e) => e.id === CASE_003_IDS.callLog);
  if (log?.kind !== 'document') throw new Error('missing log');

  it('is absent until Case 003 closes', () => {
    expect(effectiveDocument(log, () => false)).toBe(log.document);
  });

  it('adds a sixth row at the end of the table without disturbing other passages', () => {
    const changed = effectiveDocument(log, (id) => id === C3);
    const table = changed.blocks[1];
    expect(table?.type === 'table' && table.rows.at(-1)).toEqual([
      '6',
      '',
      '23:10',
      'Records facility, night entrance',
      'Not attended.',
    ]);
    const before = passageKeys(log.document);
    const after = passageKeys(changed);
    expect(after.filter((k) => !before.includes(k))).toEqual(['b1.5']);
    expect(allPassageKeys(log)).toContain('b1.5');
  });
});
