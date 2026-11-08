import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { createSave, recordAttempt } from '../domain/progress';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';

/** Case 007 end to end, from a save with Cases 001–006 closed. */
const noSound = () => null;
const CASE_FILES = [{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-007' }];

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, '');
});
afterEach(cleanup);

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
function back(stack: readonly object[]) {
  window.history.replaceState({ nightArchiveStack: stack }, '');
  fireEvent(window, new PopStateEvent('popstate', { state: window.history.state }));
}
function closed(...ids: string[]): SaveGame {
  let save = createSave(new Date('2026-01-01T00:00:00Z'));
  for (const id of ids) {
    save = recordAttempt(save, caseId(id), { submittedAt: '2026-01-01T01:00:00.000Z', outcome: 'correct', answers: {}, citations: {} });
  }
  return save;
}

describe('Case 007 playthrough', () => {
  it('compares the recordings, closes the season’s last case, and File 0093 appears', async () => {
    const repo = createMemoryRepository(closed('case-001', 'case-002', 'case-003', 'case-004', 'case-005', 'case-006'));
    render(<App repository={repo} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(screen.queryByRole('button', { name: /File 0093/ })).toBeNull();
    click(/The Impossible Call/);
    click('Open case files');

    click(/NA-07 answerphone recording/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c007-reel-1981' } });
    click(/^Voices/);
    expect(screen.getByText('Added to the case files: Audio comparison note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const q = (prompt: RegExp) => {
      const section = screen.getByRole('heading', { name: prompt }).closest('section');
      if (!section) throw new Error('missing question');
      return within(section);
    };
    const what = q(/What reached extension/);
    const impossible = q(/should not have been possible/);
    const order = q(/^\d+\. Put these in order/);
    const addressed = q(/second voice speaking to/);
    const placed = q(/Who placed the call/);
    fireEvent.click(what.getByRole('radio', { name: /matches the 1981 reel/ }));
    fireEvent.click(what.getByRole('checkbox', { name: 'Extension log' }));
    fireEvent.click(what.getByRole('checkbox', { name: 'Audio comparison note' }));
    fireEvent.click(impossible.getByRole('checkbox', { name: 'The exchange routing record' }));
    fireEvent.click(impossible.getByRole('checkbox', { name: 'The extension register' }));
    fireEvent.click(impossible.getByRole('checkbox', { name: 'Exchange routing record' }));
    // Start: received, withdrawn, in-service, created → in-service, withdrawn, created, received.
    const up = (text: RegExp, n: number) => {
      for (let i = 0; i < n; i++) fireEvent.click(order.getByRole('button', { name: text }));
    };
    up(/^Move up: Route BW-4 enters service/, 2);
    up(/^Move up: Route BW-4 is withdrawn/, 1);
    up(/^Move up: Extension NA-07 is created/, 1);
    fireEvent.click(order.getByRole('checkbox', { name: 'Exchange routing record' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Extension register' }));
    fireEvent.click(addressed.getByRole('radio', { name: /Whoever answers/ }));
    fireEvent.click(addressed.getByRole('checkbox', { name: 'NA-07 answerphone recording' }));
    fireEvent.click(placed.getByRole('radio', { name: /cannot be established/ }));
    fireEvent.click(placed.getByRole('checkbox', { name: 'Extension log' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    expect(screen.getByRole('heading', { name: 'Unfiled' })).toBeTruthy();
    click(/File 0093/);
    expect(screen.getByRole('heading', { level: 1, name: 'File 0093' })).toBeTruthy();
    expect(screen.getByRole('img', { name: /The date imprinted in the corner reads \d{2} [A-Z]{3} \d{4}\./ })).toBeTruthy();
    expect(screen.getByText('0093')).toBeTruthy();
    expect(screen.getByText('Intake ledger', { selector: '.document__stamp' })).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-007']?.discoveries).toEqual(['c007-recordings-match']);
    });
  });
});
