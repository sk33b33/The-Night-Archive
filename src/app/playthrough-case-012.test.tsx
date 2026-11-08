import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState, openTerminal } from '../test/playthrough';

/** Case 012 end to end, from a save with Cases 001–011 closed. */
const CASE_FILES = caseFiles('case-012');
const BEFORE = Array.from({ length: 11 }, (_, i) => `case-${String(i + 1).padStart(3, '0')}`);

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 012 playthrough', () => {
  it('reads the night on one timeline, closes the case, and the night desk appears', async () => {
    const repo = createMemoryRepository(closedSave(...BEFORE));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    openTerminal();
    click(/Case 012/);
    click('Open case files');

    click(/The night of 13–14 October 1981/);
    expect(screen.getByText('East door standing open. Boards stacked on the platform.')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Porter’s log (D. Okafor)' }));
    expect(screen.queryByText('East door standing open. Boards stacked on the platform.')).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Porter’s log (D. Okafor)' }));
    const [firstSource] = screen.getAllByRole('button', { name: 'Source: Porter’s log' });
    if (!firstSource) throw new Error('no source link');
    fireEvent.click(firstSource);
    expect(screen.getByRole('heading', { name: 'Porter’s log', level: 1 })).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const order = question(/Put what the records describe in order/);
    const up = (name: RegExp, times: number) => {
      for (let i = 0; i < times; i++) fireEvent.click(order.getByRole('button', { name }));
    };
    up(/^Move up: The signal box records lights/, 2);
    up(/^Move up: The porter records the east door/, 3);
    up(/^Move up: The porter phones/, 2);
    fireEvent.click(order.getByRole('checkbox', { name: 'The night of 13–14 October 1981' }));

    const says = question(/Which records say the east door was open/);
    fireEvent.click(says.getByRole('checkbox', { name: 'The porter’s log' }));
    fireEvent.click(says.getByRole('checkbox', { name: 'Porter’s log' }));

    const minutes = question(/How many minutes/);
    fireEvent.change(minutes.getByLabelText('Your count'), { target: { value: '15' } });
    fireEvent.click(minutes.getByRole('checkbox', { name: 'Porter’s log' }));
    fireEvent.click(minutes.getByRole('checkbox', { name: 'Exchange record, route BW-4' }));

    const door = question(/Was the east door open/);
    fireEvent.click(door.getByRole('radio', { name: /records disagree/ }));
    fireEvent.click(door.getByRole('checkbox', { name: 'Porter’s log' }));
    fireEvent.click(door.getByRole('checkbox', { name: 'Supervisor’s occurrence book' }));

    const caller = question(/Who used the east platform kiosk/);
    fireEvent.click(caller.getByRole('radio', { name: 'It cannot be established.' }));
    fireEvent.click(caller.getByRole('checkbox', { name: 'Exchange record, route BW-4' }));
    fireEvent.click(caller.getByRole('checkbox', { name: 'Duty roster, 1981' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/Case 012/);
    click('Open case files');
    click(/The night of 13–14 October 1981/);
    expect(screen.getByRole('checkbox', { name: 'Records facility, night desk, 1981' })).toBeTruthy();
    expect(screen.getByText('Call received from E. Ward. Not filed.')).toBeTruthy();
    expect(screen.getByText('Source: no record on file.')).toBeTruthy();
  });
});
