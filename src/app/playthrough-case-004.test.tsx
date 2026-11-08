import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState } from '../test/playthrough';

/** Case 004 end to end, from a save with Cases 001–003 closed. */
const CASE_FILES = caseFiles('case-004');

beforeEach(resetBrowserState);
afterEach(cleanup);



describe('Case 004 playthrough', () => {
  it('shows File 0091 as Unfiled until Case 004 takes it over', async () => {
    render(<App repository={createMemoryRepository(closedSave('case-001', 'case-002'))} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(screen.getByRole('heading', { name: 'Unfiled' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Case 004/ })).toBeNull();
  });

  it('can be completed, and the voided ledger line gains a date', async () => {
    const repo = createMemoryRepository(closedSave('case-001', 'case-002', 'case-003'));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(screen.queryByRole('heading', { name: 'Unfiled' })).toBeNull();
    click(/Case 004/);
    expect(screen.getByText('[Line ruled through]')).toBeTruthy();
    click('Open case files');

    click(/The print/);
    expect(screen.getByText('Found and recorded')).toBeTruthy();
    back(CASE_FILES);

    click(/File 0091 photograph/);
    click('Papers on the desk');
    expect(screen.getByText('Added to the case files: Desk papers enlargement.')).toBeTruthy();
    back(CASE_FILES);
    click(/Desk papers enlargement/);
    click('Entry 0091');
    expect(screen.getByText(/No date, description, or initials/)).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const intake = question(/through intake/);
    const papers = question(/papers on the desk/);
    const print = question(/order 4471/);
    const placed = question(/in 1981\?/);
    fireEvent.click(intake.getByRole('radio', { name: /reserved in 1981 and voided/ }));
    fireEvent.click(intake.getByRole('checkbox', { name: 'Intake ledger, October 1981' }));
    fireEvent.click(papers.getByRole('radio', { name: /number 0091/ }));
    fireEvent.click(papers.getByRole('checkbox', { name: 'Desk papers enlargement' }));
    fireEvent.click(print.getByRole('radio', { name: /cannot be established/ }));
    fireEvent.click(print.getByRole('checkbox', { name: 'The print' }));
    fireEvent.click(print.getByRole('checkbox', { name: 'Kessler Photo order book' }));
    fireEvent.click(placed.getByRole('checkbox', { name: 'File 0091 photograph' }));
    fireEvent.click(placed.getByRole('checkbox', { name: 'The print' }));

    // Select all that apply: first include an extra record.
    for (const option of [/date imprint/, /paper stock/, 'The Kessler order book', /asset register/]) {
      fireEvent.click(placed.getByRole('checkbox', { name: option }));
    }
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings partly accepted' })).toBeTruthy();
    expect(screen.getByText(/includes a record that points away from 1981/)).toBeTruthy();
    fireEvent.click(placed.getByRole('checkbox', { name: /asset register/ }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/Case 004/);
    expect(screen.getByText('14 Oct')).toBeTruthy();

    await waitFor(() => {
      const progress = (repo.stored() as SaveGame).cases['case-004'];
      expect(progress?.attempts.at(-1)?.answers['placed-in-1981']).toBe('imprint,order,paper');
    });
  });
});
