import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { createSave, recordAttempt } from '../domain/progress';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';

/** Case 005 end to end, from a save with Cases 001–004 closed. */
const CASE_FILES = [{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-005' }];

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

describe('Case 005 playthrough', () => {
  it('compares the photographs, closes the case, and the print gains an earlier entry', async () => {
    const repo = createMemoryRepository(closed('case-001', 'case-002', 'case-003', 'case-004'));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    click(/The Wrong Date/);
    click('Open case files');

    click(/File 0091 photograph/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c005-installation-photo' } });
    expect(screen.getByRole('switch', { name: /Keep views in step/ })).toBeTruthy();
    click(/Terminal badge/);
    expect(screen.getByText('Added to the case files: Estates comparison note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const q = (prompt: RegExp) => {
      const section = screen.getByRole('heading', { name: prompt }).closest('section');
      if (!section) throw new Error('missing question');
      return within(section);
    };
    const imprint = q(/date imprint establish/);
    const terminal = q(/terminal in the photograph/);
    const print = q(/date the print/);
    const dates = q(/these dates in order/);
    const how = q(/How was a print/);
    fireEvent.click(imprint.getByRole('radio', { name: /set by hand/ }));
    fireEvent.click(imprint.getByRole('checkbox', { name: 'Camera manual extract' }));
    fireEvent.click(terminal.getByRole('radio', { name: /before 1996/ }));
    fireEvent.click(terminal.getByRole('checkbox', { name: 'Halden product catalogue' }));
    fireEvent.click(terminal.getByRole('checkbox', { name: 'Estates comparison note' }));
    fireEvent.click(print.getByRole('checkbox', { name: 'The paper data sheet' }));
    fireEvent.click(print.getByRole('checkbox', { name: 'The companies register' }));
    fireEvent.click(print.getByRole('checkbox', { name: 'Paper data sheet' }));
    fireEvent.click(print.getByRole('checkbox', { name: 'Companies register extract' }));
    fireEvent.click(dates.getByRole('checkbox', { name: 'Paper data sheet' }));
    fireEvent.click(dates.getByRole('checkbox', { name: 'Halden product catalogue' }));
    // Start: installed, imprint, terminal, paper, dissolved → paper, imprint, dissolved, terminal, installed.
    const up = (text: RegExp, n: number) => {
      for (let i = 0; i < n; i++) fireEvent.click(dates.getByRole('button', { name: text }));
    };
    up(/^Move up: The print’s paper/, 3);
    up(/^Move up: The date on the imprint/, 1);
    up(/^Move up: Kessler Photo is dissolved/, 2);
    up(/^Move up: The Halden 486/, 1);
    fireEvent.click(how.getByRole('radio', { name: /cannot establish how/ }));
    fireEvent.click(how.getByRole('checkbox', { name: 'Paper data sheet' }));
    fireEvent.click(how.getByRole('checkbox', { name: 'Companies register extract' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    // End beat B, seen in Case 004's print.
    click('Return to the archive');
    click(/Case 004/);
    click('Open case files');
    click(/The print/);
    const custody = screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(custody[0]).toContain('14 Oct 1981');
    expect(custody[0]).toContain('Placed');
    expect(custody[1]).toContain('Found and recorded');

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-005']?.discoveries).toEqual(['c005-badge-match']);
    });
  });
});
