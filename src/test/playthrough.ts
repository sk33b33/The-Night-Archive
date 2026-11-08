import { fireEvent, queries, screen, within, type BoundFunctions } from '@testing-library/react';
import { caseId } from '../domain/case';
import { createSave, recordAttempt } from '../domain/progress';
import type { SaveGame } from '../domain/save';
import { roomStore } from '../world/roomStore';

/** Shared helpers for the App-level playthrough tests. */

export const click = (name: string | RegExp): void => {
  fireEvent.click(screen.getByRole('button', { name }));
};

/** Delivers the popstate a real Back would fire (jsdom's history.back() is async). */
export function back(stack: readonly object[]): void {
  window.history.replaceState({ nightArchiveStack: stack }, '');
  fireEvent(window, new PopStateEvent('popstate', { state: window.history.state }));
}

/** The navigation stack for a case's files, for use with back(). */
export function caseFiles(id: string): readonly object[] {
  return [{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: id }];
}

/** A save in which the given cases are already closed. */
export function closedSave(...ids: string[]): SaveGame {
  let save = createSave(new Date('2026-01-01T00:00:00Z'));
  for (const id of ids) {
    save = recordAttempt(save, caseId(id), {
      submittedAt: '2026-01-01T01:00:00.000Z',
      outcome: 'correct',
      answers: {},
      citations: {},
    });
  }
  return save;
}

/** Queries scoped to one findings question, found by its prompt. */
export function question(prompt: RegExp): BoundFunctions<typeof queries> {
  const section = screen.getByRole('heading', { name: prompt }).closest('section');
  if (!section) throw new Error(`No question matching ${String(prompt)}`);
  return within(section);
}

/** In the reading room, uses the NA-07 computer to open the archive terminal (via Places). */
export function openTerminal(): void {
  fireEvent.click(screen.getByRole('button', { name: /^Desk computer, NA-07/ }));
}

/** Resets browser state between playthrough tests. */
export function resetBrowserState(): void {
  roomStore.reset();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, '');
}
