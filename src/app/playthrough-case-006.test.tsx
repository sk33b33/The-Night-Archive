import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState, openTerminal } from '../test/playthrough';

/** Case 006 end to end, from a save with Cases 001–005 closed. */
const CASE_FILES = caseFiles('case-006');

beforeEach(resetBrowserState);
afterEach(cleanup);


describe('Case 006 playthrough', () => {
  it('reviews tonight’s footage, closes the case, and Case 001’s report gains a note', async () => {
    const repo = createMemoryRepository(closedSave('case-001', 'case-002', 'case-003', 'case-004', 'case-005'));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    openTerminal();
    click(/Someone Is Watching/);
    click('Open case files');

    // CCTV: jump to 23:10 and examine the door, then 03:40.
    click(/Camera 2 footage/);
    click(/23:10:04/);
    click('Night entrance');
    expect(screen.getByText('The night-entrance door stands open. No one is in frame.')).toBeTruthy();
    click(/03:40:02/);
    expect(screen.getByRole('img', { name: /A figure stands at position 7/ })).toBeTruthy();
    back(CASE_FILES);

    // Viewpoint: compare the still with the File 0091 photograph.
    click(/Camera 2 still, 03:40/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c006-photograph' } });
    click(/^Window/);
    expect(screen.getByText('Added to the case files: Viewpoint note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const who = question(/position 7 at 03:40/);
    const door = question(/night entrance after 22:02/);
    const view = question(/taken from\?/);
    const order = question(/tonight’s events in order/);
    const others = question(/someone other than you/);
    fireEvent.click(who.getByRole('radio', { name: /cannot be identified/ }));
    fireEvent.click(who.getByRole('checkbox', { name: 'Camera 2 footage' }));
    fireEvent.click(who.getByRole('checkbox', { name: 'Your shift log' }));
    fireEvent.click(door.getByRole('radio', { name: /no badge entry/ }));
    fireEvent.click(door.getByRole('checkbox', { name: 'Camera 2 footage' }));
    fireEvent.click(door.getByRole('checkbox', { name: 'Night-entrance access log' }));
    fireEvent.click(view.getByRole('radio', { name: /camera 2’s viewpoint/ }));
    fireEvent.click(view.getByRole('checkbox', { name: 'Viewpoint note' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Your shift log' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Camera 2 footage' }));
    // Start: figure, found, door, break-ends, on-shift, break-begins
    // Goal:  on-shift, door, break-begins, figure, break-ends, found
    const up = (text: RegExp, n: number) => {
      for (let i = 0; i < n; i++) fireEvent.click(order.getByRole('button', { name: text }));
    };
    up(/^Move up: You come on shift/, 4); // on-shift, figure, found, door, break-ends, break-begins
    up(/^Move up: The night-entrance door/, 2); // on-shift, door, figure, found, break-ends, break-begins
    up(/^Move up: Your break begins/, 3); // on-shift, door, break-begins, figure, found, break-ends
    up(/^Move up: Your break ends/, 1); // on-shift, door, break-begins, figure, break-ends, found
    fireEvent.click(others.getByRole('checkbox', { name: 'The camera 2 footage' }));
    fireEvent.click(others.getByRole('checkbox', { name: 'The camera 2 still' }));
    fireEvent.click(others.getByRole('checkbox', { name: 'Camera 2 footage' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/The Missing Recording/);
    expect(screen.getByText('Report time 03:40: received at extension NA-07.')).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-006']?.discoveries).toEqual(['c006-viewpoint']);
    });
  });
});
