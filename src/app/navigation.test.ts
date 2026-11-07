import { describe, expect, it } from 'vitest';
import {
  canGoBack,
  currentScreen,
  initialNavigation,
  navigationReducer,
  type NavigationState,
} from './navigation';
import { fromHistoryState, toHistoryState } from './historySync';

describe('navigationReducer', () => {
  it('starts on the main menu with no back history', () => {
    expect(currentScreen(initialNavigation)).toBe('menu');
    expect(canGoBack(initialNavigation)).toBe(false);
  });

  it('pushes screens and pops them on back', () => {
    const atArchive = navigationReducer(initialNavigation, { type: 'navigate', to: 'archive' });
    expect(atArchive.stack).toEqual(['menu', 'archive']);
    const back = navigationReducer(atArchive, { type: 'back' });
    expect(back.stack).toEqual(['menu']);
  });

  it('ignores back at the root', () => {
    expect(navigationReducer(initialNavigation, { type: 'back' })).toBe(initialNavigation);
  });

  it('returns the same state when navigating to the current screen', () => {
    const state: NavigationState = { stack: ['menu', 'settings'] };
    expect(navigationReducer(state, { type: 'navigate', to: 'settings' })).toBe(state);
  });

  it('unwinds instead of duplicating a screen already in the stack', () => {
    const state: NavigationState = { stack: ['menu', 'archive', 'settings'] };
    expect(navigationReducer(state, { type: 'navigate', to: 'archive' }).stack).toEqual([
      'menu',
      'archive',
    ]);
    expect(navigationReducer(state, { type: 'navigate', to: 'menu' })).toBe(initialNavigation);
  });

  it('returns home from anywhere', () => {
    const state: NavigationState = { stack: ['menu', 'archive', 'settings'] };
    expect(navigationReducer(state, { type: 'home' })).toBe(initialNavigation);
  });
});

describe('history state', () => {
  it('round-trips a navigation stack', () => {
    const state: NavigationState = { stack: ['menu', 'settings'] };
    expect(fromHistoryState(toHistoryState(state))).toEqual(state);
  });

  it.each([
    null,
    'menu',
    {},
    { nightArchiveStack: [] },
    { nightArchiveStack: ['archive'] },
    { nightArchiveStack: ['menu', 'case-999'] },
  ])('rejects malformed state %j', (raw) => {
    expect(fromHistoryState(raw)).toBeNull();
  });
});
