import { describe, expect, it } from 'vitest';
import { caseId, isCaseAvailable } from '../../domain/case';
import { encodeOrder, encodeSelection, evaluateDeduction, type DeductionSubmission } from '../../domain/deduction';
import { effectiveDocument, evidenceUnlockedBy } from '../../domain/evidence';
import { CASE_001, CASE_001_IDS } from './case-001';
import { CASE_006, CASE_006_IDS, VIEWPOINT_DISCOVERY } from './case-006';

const C5 = caseId('case-005');
const C6 = caseId('case-006');

const SUPPORTED: DeductionSubmission = {
  answers: {
    'position-7': 'unknown',
    'night-entrance': 'door-no-badge',
    viewpoint: 'camera-2-viewpoint',
    tonight: encodeOrder(['on-shift', 'door', 'break-begins', 'figure', 'break-ends', 'found']),
    'someone-else': encodeSelection(['cctv', 'still']),
  },
  citations: {
    'position-7': [CASE_006_IDS.cctv, CASE_006_IDS.shift],
    'night-entrance': [CASE_006_IDS.cctv, CASE_006_IDS.access],
    viewpoint: [CASE_006_IDS.viewpoint],
    tonight: [CASE_006_IDS.shift, CASE_006_IDS.cctv],
    'someone-else': [CASE_006_IDS.cctv],
  },
};

const footage = CASE_006.evidence.find((e) => e.id === CASE_006_IDS.cctv);
if (footage?.kind !== 'cctv') throw new Error('missing footage');

describe('Case 006', () => {
  it('appears after Case 005 closes', () => {
    expect(isCaseAvailable(CASE_006, () => false)).toBe(false);
    expect(isCaseAvailable(CASE_006, (id) => id === C5)).toBe(true);
  });

  it('frames run forward through the night (past midnight) with unique timestamps', () => {
    // Seconds since 12:00, so 03:40 after midnight comes after 23:15.
    const seconds = footage.frames.map((f) => {
      const [h = 0, m = 0, s = 0] = f.time.split(':').map(Number);
      return ((h + 12) % 24) * 3600 + m * 60 + s;
    });
    expect(seconds.every((v, i) => i === 0 || v > (seconds[i - 1] ?? 0))).toBe(true);
    expect(footage.frames[0]?.time).toBe('22:00:00');
    expect(footage.frames.at(-1)?.time).toBe('04:10:00');
  });

  it('the figure appears only at 03:40:02, and the door is open only at 23:10:04', () => {
    expect(footage.frames.filter((f) => f.scene.figure).map((f) => f.time)).toEqual(['03:40:02']);
    expect(footage.frames.filter((f) => f.scene.door === 'ajar').map((f) => f.time)).toEqual(['23:10:04']);
  });

  it('the archivist is absent from the frames inside the logged break', () => {
    const inBreak = footage.frames.filter((f) => f.time >= '03:30:00' && f.time < '03:50:00');
    expect(inBreak.length).toBeGreaterThan(0);
    expect(inBreak.every((f) => !f.scene.archivist)).toBe(true);
  });

  it('never shows or describes the figure’s face', () => {
    const text = JSON.stringify(CASE_006).toLowerCase();
    expect(text).not.toMatch(/face is visible|her face|his face/);
    expect(text).toContain('face is not visible');
  });

  it('the window region matches between the still and the photograph and files the viewpoint note', () => {
    const photos = CASE_006.evidence.filter((e) => e.kind === 'photo');
    for (const p of photos) {
      if (p.kind !== 'photo') continue;
      expect(p.regions.find((r) => r.id === 'window')?.revealsOnMatch).toBe(VIEWPOINT_DISCOVERY);
    }
    expect(evidenceUnlockedBy(CASE_006, VIEWPOINT_DISCOVERY).map((e) => e.id)).toEqual([CASE_006_IDS.viewpoint]);
  });

  it('accepts the supported findings and requires the viewpoint note', () => {
    expect(evaluateDeduction(CASE_006.questions, SUPPORTED).outcome).toBe('correct');
    const noNote = { ...SUPPORTED, citations: { ...SUPPORTED.citations, viewpoint: [CASE_006_IDS.still] } };
    expect(evaluateDeduction(CASE_006.questions, noNote).outcome).toBe('incomplete');
  });

  it.each([
    ['position-7', 'you'],
    ['position-7', 'm'],
    ['night-entrance', 'no'],
    ['night-entrance', 'figure-entered'],
    ['viewpoint', 'camera-2'],
    ['viewpoint', 'desk'],
  ])('never accepts an unsupported theory (%s = %s)', (q, option) => {
    expect(evaluateDeduction(CASE_006.questions, { ...SUPPORTED, answers: { ...SUPPORTED.answers, [q]: option } }).outcome).toBe(
      'partial',
    );
  });

  it('findings never identify the figure', () => {
    for (const q of CASE_006.questions) expect(q.finding).not.toMatch(/Mara|\bM\.|Elias|was you|by you/);
  });
});

describe('Case 006 end beat A: the 1981 call, received at NA-07', () => {
  const report = CASE_001.evidence.find((e) => e.id === CASE_001_IDS.report);
  if (report?.kind !== 'document') throw new Error('missing report');

  it('is absent until Case 006 closes', () => {
    const before = effectiveDocument(report, (id) => id !== C6);
    expect(JSON.stringify(before)).not.toContain('extension NA-07');
  });

  it('is appended after the earlier annotation once both cases are closed', () => {
    const after = effectiveDocument(report, () => true);
    expect(after.blocks.slice(-2)).toEqual([
      { type: 'annotation', text: 'Filed. — M.' },
      { type: 'annotation', text: 'Report time 03:40: received at extension NA-07.' },
    ]);
  });
});
