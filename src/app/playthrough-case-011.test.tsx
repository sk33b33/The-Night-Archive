import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState } from '../test/playthrough';

/** Case 011 end to end, from a save with Cases 001–010 closed. */
const CASE_FILES = caseFiles('case-011');
const BEFORE = Array.from({ length: 10 }, (_, i) => `case-${String(i + 1).padStart(3, '0')}`);

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 011 playthrough', () => {
  it('locates the photograph, reconciles the boxes with counts, and SB-07’s contents appear', async () => {
    const repo = createMemoryRepository(closedSave(...BEFORE));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    click(/Case 011/);
    click('Open case files');

    // Compare the File 0094 photograph with the sealing photograph.
    click(/File 0094 photograph/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c011-sealing-photograph' } });
    click(/^Barred window/);
    expect(screen.getByText('Added to the case files: Location note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const sealed = question(/sealing inventory list/);
    const unaccounted = question(/how many boxes are unaccounted for/);
    const which = question(/Which boxes are unaccounted for/);
    const shows = question(/What does the File 0094 photograph show/);
    const when = question(/When was the File 0094 photograph taken/);

    // A count must be a whole number before the findings can be submitted.
    fireEvent.change(sealed.getByLabelText('Your count'), { target: { value: 'forty' } });
    expect(sealed.getByText('Enter a whole number, using digits only.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit findings' }).getAttribute('aria-disabled')).toBe('true');
    fireEvent.change(sealed.getByLabelText('Your count'), { target: { value: '48' } });
    expect(sealed.queryByText('Enter a whole number, using digits only.')).toBeNull();
    fireEvent.click(sealed.getByRole('checkbox', { name: 'Sealing inventory, 1981' }));

    // A near miss: only the clearance list's missing boxes.
    fireEvent.change(unaccounted.getByLabelText('Your count'), { target: { value: '2' } });
    for (const name of ['Sealing inventory, 1981', 'Refit clearance list, 1997', 'Stack room accession, 1997']) {
      fireEvent.click(unaccounted.getByRole('checkbox', { name }));
    }
    for (const name of ['SB-07', 'SB-31', 'SB-40']) fireEvent.click(which.getByRole('checkbox', { name }));
    fireEvent.click(which.getByRole('checkbox', { name: 'Refit clearance list, 1997' }));
    fireEvent.click(which.getByRole('checkbox', { name: 'Stack room accession, 1997' }));
    fireEvent.click(shows.getByRole('radio', { name: /three unaccounted boxes/ }));
    fireEvent.click(shows.getByRole('checkbox', { name: 'Location note' }));
    fireEvent.click(shows.getByRole('checkbox', { name: 'File 0094 photograph' }));
    fireEvent.click(when.getByRole('radio', { name: /cannot establish/ }));
    fireEvent.click(when.getByRole('checkbox', { name: 'Building history (copy)' }));
    fireEvent.click(when.getByRole('checkbox', { name: 'Intake ledger, tonight' }));
    click('Submit findings');
    expect(screen.getByText(/You have counted the boxes not found at clearance/)).toBeTruthy();

    fireEvent.change(unaccounted.getByLabelText('Your count'), { target: { value: '3' } });
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/Case 011/);
    click('Open case files');
    click(/Sealing inventory, 1981/);
    expect(screen.getByText(/Contents: east door key, Bellwether\./)).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-011']?.discoveries).toEqual(['c011-location-match']);
    });
  });
});
