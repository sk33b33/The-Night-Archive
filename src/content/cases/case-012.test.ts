import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { minutesOf, withAmendments } from '../../domain/evidence';
import { CASE_012, CASE_012_IDS, NIGHT } from './case-012';

const C11 = caseId('case-011');
const C12 = caseId('case-012');
const timeline = CASE_012.evidence.find((e) => e.id === CASE_012_IDS.timeline);
if (timeline?.kind !== 'timeline') throw new Error('missing timeline');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'night-order': encodeOrder(['lights', 'open', 'unanswered', 'kiosk', 'sealed']),
    'says-open': encodeSelection(['porter']),
    minutes: '15',
    'door-open': 'disagree',
    'kiosk-caller': 'unknown',
  },
  citations: {
    'night-order': [CASE_012_IDS.timeline],
    'says-open': [CASE_012_IDS.porter],
    minutes: [CASE_012_IDS.porter, CASE_012_IDS.exchange],
    'door-open': [CASE_012_IDS.porter, CASE_012_IDS.supervisor],
    'kiosk-caller': [CASE_012_IDS.exchange, CASE_012_IDS.roster],
  },
};

const at = (text: RegExp) => NIGHT.find((e) => text.test(e.text))?.time ?? '';

describe('Case 012', () => {
  it('follows Case 011', () => {
    expect(isCaseAvailable(CASE_012, (id) => id === C11)).toBe(true);
    expect(isCaseAvailable(CASE_012, () => false)).toBe(false);
  });

  it('the timeline is a view of the records: every track names a source in the case, every event a track', () => {
    const ids = new Set<string>(CASE_012.evidence.map((e) => e.id));
    for (const track of timeline.tracks) expect(track.source && ids.has(track.source)).toBe(true);
    const tracks = new Set(timeline.tracks.map((t) => t.id));
    for (const e of timeline.events) {
      expect(tracks.has(e.track)).toBe(true);
      expect(minutesOf(e.time)).toBeGreaterThanOrEqual(minutesOf(timeline.range.from));
      expect(minutesOf(e.time)).toBeLessThanOrEqual(minutesOf(timeline.range.to));
    }
  });

  it('agrees with Case 001 canon and with the finding times', () => {
    expect(at(/service cancelled/)).toBe('02:10');
    expect(at(/Outgoing call/)).toBe('03:40');
    expect(at(/Call received/)).toBe('03:40');
    expect(minutesOf(at(/Outgoing call/)) - minutesOf(at(/standing open/))).toBe(15);
    expect(minutesOf(at(/Outgoing call/)) - minutesOf(at(/No answer/))).toBe(10);
    expect(at(/door sealed, boarding intact/)).toBe('04:05');
  });

  it('only the porter’s log says the door was open', () => {
    const open = NIGHT.filter((e) => /\bopen\b/i.test(e.text));
    expect(open.map((e) => e.track)).toEqual(['porter']);
  });

  it('accepts the supported findings', () => {
    expect(evaluateDeduction(CASE_012.questions, SUPPORTED).outcome).toBe('correct');
  });

  it.each([
    ['says-open', encodeSelection(['porter', 'signal'])],
    ['minutes', '10'],
    ['door-open', 'yes'],
    ['door-open', 'no'],
    ['kiosk-caller', 'ward'],
    ['kiosk-caller', 'okafor'],
  ])('never accepts an unsupported answer (%s = %s)', (q, answer) => {
    expect(evaluateDeduction(CASE_012.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: answer } }).outcome).toBe(
      'partial',
    );
  });

  it('end beat A: a night-desk track with no record on file appears once Case 012 closes', () => {
    expect(withAmendments(timeline, () => false).tracks).toHaveLength(5);
    const amended = withAmendments(timeline, (id) => id === C12);
    const desk = amended.tracks.at(-1);
    expect(desk).toEqual({ id: 'night-desk', label: 'Records facility, night desk, 1981' });
    expect(amended.events.filter((e) => e.track === 'night-desk')).toEqual([
      { track: 'night-desk', time: '03:40', text: 'Call received from E. Ward. Not filed.' },
    ]);
  });
});
