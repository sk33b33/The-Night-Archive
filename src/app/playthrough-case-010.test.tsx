import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState } from '../test/playthrough';

/** Case 010 end to end, from a save with Cases 001–009 closed. */
const CASE_FILES = caseFiles('case-010');
const BEFORE = Array.from({ length: 9 }, (_, i) => `case-00${i + 1}`);

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 010 playthrough', () => {
  it('reads the floor plan, matches the handover “M.”, closes the case, and Storage B appears', async () => {
    const repo = createMemoryRepository(closedSave(...BEFORE));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    click(/The Handover/);
    click('Open case files');

    // Floor plan at 06:00.
    click(/Floor plan, first floor/);
    fireEvent.click(screen.getByRole('radio', { name: '06:00' }));
    click(/^Stack room/);
    expect(screen.getByText('Your shift log: “05:50–06:04 Returns, stack room.”')).toBeTruthy();
    click(/^Reading room/);
    expect(screen.getByText(/someone seated at position 7/)).toBeTruthy();
    back(CASE_FILES);

    // Handwriting: the handover M against the slip.
    click(/Handover log: “M.”/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c010-slip-copy' } });
    click(/^Crossed “M”/);
    expect(screen.getByText('Added to the case files: Handover comparison note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const badge = question(/badge records place/);
    const camera = question(/camera 2 show at position 7/);
    const says = question(/say the night archivist was at position 7/);
    const hand = question(/consistent with the hand of slip 0094/);
    const seated = question(/Who was seated/);
    fireEvent.click(badge.getByRole('radio', { name: 'In the stack room.' }));
    fireEvent.click(badge.getByRole('checkbox', { name: 'Door and badge log' }));
    fireEvent.click(camera.getByRole('radio', { name: /Someone seated/ }));
    fireEvent.click(camera.getByRole('checkbox', { name: 'Camera 2 footage, 06:00' }));
    fireEvent.click(says.getByRole('checkbox', { name: 'The handover log' }));
    fireEvent.click(says.getByRole('checkbox', { name: 'Handover log' }));
    fireEvent.click(hand.getByRole('radio', { name: /consistent with it/ }));
    fireEvent.click(hand.getByRole('checkbox', { name: 'Handover comparison note' }));
    fireEvent.click(seated.getByRole('radio', { name: /cannot be established/ }));
    fireEvent.click(seated.getByRole('checkbox', { name: 'Camera 2 footage, 06:00' }));
    fireEvent.click(seated.getByRole('checkbox', { name: 'Door and badge log' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/The Handover/);
    click('Open case files');
    click(/Floor plan, first floor/);
    fireEvent.click(screen.getByRole('radio', { name: '06:00 · Storage B' }));
    click(/Storage B \(sealed\)/);
    expect(screen.getByText(/No record speaks about this room/)).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-010']?.discoveries).toEqual(['c010-handover-match']);
    });
  });
});
