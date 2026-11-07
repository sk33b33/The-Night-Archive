import { describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { evidenceId } from '../domain/evidence';
import type { ContentIndex } from '../domain/save';
import {
  MENU,
  canGoBack,
  currentScreen,
  initialNavigation,
  navigationReducer,
  parseScreen,
  stackForResume,
  toResumePoint,
  type NavigationState,
  type Screen,
} from './navigation';
import { fromHistoryState, toHistoryState } from './historySync';

const archive: Screen = { id: 'archive' };
const settings: Screen = { id: 'settings' };
const briefing001: Screen = { id: 'briefing', caseId: caseId('case-001') };
const workspace: Screen = { id: 'investigation', caseId: caseId('case-001') };
const evidenceScreen: Screen = {
  id: 'evidence',
  caseId: caseId('case-001'),
  evidenceId: evidenceId('c001-timetable'),
};

describe('navigationReducer', () => {
  it('starts on the main menu with no back history', () => {
    expect(currentScreen(initialNavigation)).toEqual(MENU);
    expect(canGoBack(initialNavigation)).toBe(false);
  });

  it('pushes screens and pops them on back', () => {
    const atArchive = navigationReducer(initialNavigation, { type: 'navigate', to: archive });
    expect(atArchive.stack).toEqual([MENU, archive]);
    expect(navigationReducer(atArchive, { type: 'back' }).stack).toEqual([MENU]);
  });

  it('ignores back at the root', () => {
    expect(navigationReducer(initialNavigation, { type: 'back' })).toBe(initialNavigation);
  });

  it('returns the same state when navigating to the current screen', () => {
    const state: NavigationState = { stack: [MENU, archive, briefing001] };
    expect(
      navigationReducer(state, { type: 'navigate', to: { id: 'briefing', caseId: caseId('case-001') } }),
    ).toBe(state);
  });

  it('treats briefings for different cases as different screens', () => {
    const state: NavigationState = { stack: [MENU, archive, briefing001] };
    const other: Screen = { id: 'briefing', caseId: caseId('case-002') };
    expect(navigationReducer(state, { type: 'navigate', to: other }).stack).toHaveLength(4);
  });

  it('unwinds instead of duplicating a screen already in the stack', () => {
    const state: NavigationState = { stack: [MENU, archive, settings] };
    expect(navigationReducer(state, { type: 'navigate', to: archive }).stack).toEqual([MENU, archive]);
    expect(navigationReducer(state, { type: 'navigate', to: MENU })).toBe(initialNavigation);
  });

  it('returns home from anywhere', () => {
    const state: NavigationState = { stack: [MENU, archive, settings] };
    expect(navigationReducer(state, { type: 'home' })).toBe(initialNavigation);
  });
});

describe('resume points', () => {
  it('menu and settings are not resumable', () => {
    expect(toResumePoint(MENU)).toBeNull();
    expect(toResumePoint(settings)).toBeNull();
    expect(toResumePoint(archive)).toEqual({ screen: 'archive' });
    expect(toResumePoint(briefing001)).toEqual({ screen: 'briefing', caseId: 'case-001' });
    expect(toResumePoint(evidenceScreen)).toEqual({
      screen: 'evidence',
      caseId: 'case-001',
      evidenceId: 'c001-timetable',
    });
  });

  it('rebuilds evidence under the case workspace so Back walks up the case', () => {
    expect(
      stackForResume({
        screen: 'evidence',
        caseId: caseId('case-001'),
        evidenceId: evidenceId('c001-timetable'),
      }).stack,
    ).toEqual([MENU, archive, workspace, evidenceScreen]);
  });

  it('rebuilds a stack with the archive beneath a briefing', () => {
    expect(stackForResume({ screen: 'briefing', caseId: caseId('case-001') }).stack).toEqual([
      MENU,
      archive,
      briefing001,
    ]);
    expect(stackForResume({ screen: 'archive' }).stack).toEqual([MENU, archive]);
  });
});

describe('screen parsing and history state', () => {
  const known: ContentIndex = {
    isKnownCase: (id) => id === 'case-001',
    isKnownEvidence: (c, e) => c === 'case-001' && e === 'c001-timetable',
  };

  it('parses evidence screens only for known evidence', () => {
    expect(parseScreen({ ...evidenceScreen }, known)).toEqual(evidenceScreen);
    expect(parseScreen({ id: 'evidence', caseId: 'case-001', evidenceId: 'nope' }, known)).toBeNull();
    expect(parseScreen({ id: 'evidence', caseId: 'case-001' }, known)).toBeNull();
  });

  it('parses valid screens and rejects unknown cases', () => {
    expect(parseScreen({ id: 'briefing', caseId: 'case-001' }, known)).toEqual(briefing001);
    expect(parseScreen({ id: 'briefing', caseId: 'case-999' }, known)).toBeNull();
    expect(parseScreen({ id: 'briefing' }, known)).toBeNull();
    expect(parseScreen({ id: 'vault' }, known)).toBeNull();
  });

  it('round-trips a navigation stack', () => {
    const state: NavigationState = { stack: [MENU, archive, workspace, evidenceScreen] };
    expect(fromHistoryState(toHistoryState(state))).toEqual(state);
  });

  it.each([
    null,
    'menu',
    {},
    { nightArchiveStack: [] },
    { nightArchiveStack: [{ id: 'archive' }] },
    { nightArchiveStack: ['menu'] },
    { nightArchiveStack: [{ id: 'menu' }, { id: 'briefing', caseId: 'case-999' }] },
  ])('rejects malformed state %j', (raw) => {
    expect(fromHistoryState(raw)).toBeNull();
  });
});
