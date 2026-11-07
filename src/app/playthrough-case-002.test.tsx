import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { createSave, recordAttempt } from '../domain/progress';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';

/** Case 002 end to end, starting from a save where Case 001 is closed. */
const noSound = () => null;
const CASE_FILES = [{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-002' }];

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, '');
});
afterEach(cleanup);

const heading = (name: string | RegExp) => screen.getByRole('heading', { level: 1, name });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
function back(stack: readonly object[]) {
  window.history.replaceState({ nightArchiveStack: stack }, '');
  fireEvent(window, new PopStateEvent('popstate', { state: window.history.state }));
}

function case001Closed(): SaveGame {
  return recordAttempt(createSave(new Date('2026-01-01T00:00:00Z')), caseId('case-001'), {
    submittedAt: '2026-01-01T01:00:00.000Z',
    outcome: 'correct',
    answers: {},
    citations: {},
  });
}

describe('Case 002 playthrough', () => {
  it('is hidden until Case 001 closes', async () => {
    render(<App repository={createMemoryRepository()} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('false'));
    click('Begin shift');
    expect(screen.queryByText('The Empty House')).toBeNull();
    expect(screen.getByText('1', { selector: 'dd' })).toBeTruthy();
  });

  it('can be completed, and closing it changes the Case 001 report', async () => {
    const repo = createMemoryRepository(case001Closed());
    render(<App repository={repo} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(heading('Archive dashboard')).toBeTruthy();
    expect(screen.queryByText(/amended since filing/)).toBeNull();

    click(/The Empty House/);
    expect(screen.getByText('Property vacant since November 1982')).toBeTruthy();
    click('Open case files');
    expect(screen.getByText('0 of 6 items examined')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Calendar enlargement/ })).toBeNull();

    // The photograph: examining the calendar files the enlargement.
    click(/Kitchen photograph/);
    click('Radio');
    expect(screen.getByText('A radio on the counter. The dial is lit.')).toBeTruthy();
    click('Wall calendar');
    expect(screen.getByText('Added to the case files: Calendar enlargement.')).toBeTruthy();
    back(CASE_FILES);
    click(/Calendar enlargement/);
    click('Note on 2 March');
    expect(screen.getByText(/“Inspector — 10:00”/)).toBeTruthy();
    back(CASE_FILES);

    // The answerphone.
    click(/Answerphone cassette/);
    click(/Message/);
    expect(screen.getByText('It’s me. Don’t open the door for anyone tonight.')).toBeTruthy();
    back(CASE_FILES);

    // Findings.
    click('Case findings');
    const question = (prompt: RegExp) => {
      const section = screen.getByRole('heading', { name: prompt }).closest('section');
      if (!section) throw new Error('missing question');
      return within(section);
    };
    const vacant = question(/vacant on 2 March/);
    const expected = question(/know the inspection/);
    const occupant = question(/Who was living/);
    fireEvent.click(vacant.getByRole('radio', { name: /signs of recent occupation/ }));
    fireEvent.click(vacant.getByRole('checkbox', { name: 'Meter record card' }));
    fireEvent.click(expected.getByRole('radio', { name: /own calendar/ }));
    fireEvent.click(expected.getByRole('checkbox', { name: 'Calendar enlargement' }));
    fireEvent.click(occupant.getByRole('radio', { name: /M\. Ellery/ }));
    fireEvent.click(occupant.getByRole('checkbox', { name: 'Tenancy register' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings partly accepted' })).toBeTruthy();
    fireEvent.click(occupant.getByRole('radio', { name: /cannot establish/ }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    // The end beat: Case 001's report has changed.
    click('Return to the archive');
    expect(screen.getByText('1 record amended since filing')).toBeTruthy();
    click(/The Missing Recording/);
    expect(screen.getByText('Filed. — M.')).toBeTruthy();

    await waitFor(() => {
      const progress = (repo.stored() as SaveGame).cases['case-002'];
      expect(progress?.discoveries).toEqual(['c002-calendar-note']);
      expect(progress?.attempts.map((a) => a.outcome)).toEqual(['partial', 'correct']);
    });
  });
});
