import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState, openTerminal } from '../test/playthrough';

/** Case 013 end to end, from a save with Cases 001–012 closed. */
const CASE_FILES = caseFiles('case-013');
const BEFORE = Array.from({ length: 12 }, (_, i) => `case-${String(i + 1).padStart(3, '0')}`);

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 013 playthrough', () => {
  it('cross-references the registers, closes the case, and the night desk log comes on file', async () => {
    const repo = createMemoryRepository(closedSave(...BEFORE));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    openTerminal();
    click(/Case 013/);
    click('Open case files');
    expect(screen.queryByText(/Night desk log/)).toBeNull();

    click(/Staff cross-reference, 1981/);
    fireEvent.change(screen.getByLabelText('Name or initial'), { target: { value: 'Ward' } });
    click('Search');
    expect(screen.getByText('Added to the case files: Cross-reference note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const registers = question(/Which 1981 registers list a Ward/);
    fireEvent.click(registers.getByRole('checkbox', { name: 'Records facility staff' }));
    fireEvent.click(registers.getByRole('checkbox', { name: 'Cross-reference note' }));
    const post = question(/What post did E. Ward hold/);
    fireEvent.click(post.getByRole('radio', { name: /^Courier, records facility/ }));
    fireEvent.click(post.getByRole('checkbox', { name: 'Cross-reference note' }));

    const order = question(/Put these in order/);
    const up = (name: RegExp, times: number) => {
      for (let i = 0; i < times; i++) fireEvent.click(order.getByRole('button', { name }));
    };
    // Start: report, ended, joined, sb07, out.
    up(/^Move up: E. Ward joins/, 2); // joined, report, ended, sb07, out
    up(/^Move up: E. Ward signs out/, 3); // joined, out, report, ended, sb07
    up(/^Move up: Box SB-07/, 1); // joined, out, report, sb07, ended
    for (const name of ['Records facility staff, 1979–1983', 'Courier log, 13–14 October 1981', 'Incident report, 1981', 'Sealing inventory, SB-07 line']) {
      fireEvent.click(order.getByRole('checkbox', { name }));
    }

    const after = question(/after E. Ward signs out/);
    fireEvent.click(after.getByRole('radio', { name: 'No return is recorded.' }));
    fireEvent.click(after.getByRole('checkbox', { name: 'Courier log, 13–14 October 1981' }));
    const same = question(/Is the report’s “Elias Ward”/);
    fireEvent.click(same.getByRole('radio', { name: 'It cannot be established.' }));
    fireEvent.click(same.getByRole('checkbox', { name: 'Cross-reference note' }));
    fireEvent.click(same.getByRole('checkbox', { name: 'Duty roster, 1981' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/Case 013/);
    click('Open case files');
    click(/Night desk log, 13–14 October 1981/);
    expect(screen.getByText('Call received from E. Ward. Not filed.')).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-013']?.discoveries).toEqual(['c013-ward-search']);
    });
  });
});
