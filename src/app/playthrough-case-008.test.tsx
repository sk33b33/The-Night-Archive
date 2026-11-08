import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState, openTerminal } from '../test/playthrough';

/** Case 008 end to end, from a save with Season 1 (Cases 001–007) closed. */
const CASE_FILES = caseFiles('case-008');
const SEASON_1 = ['case-001', 'case-002', 'case-003', 'case-004', 'case-005', 'case-006', 'case-007'];

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 008 playthrough', () => {
  it('groups the archive by season and keeps File 0093 in Unfiled', async () => {
    render(<App repository={createMemoryRepository(closedSave(...SEASON_1))} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    openTerminal();
    expect(screen.getByRole('heading', { name: 'Season 1' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Season 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^No intake record.*File 0093/ })).toBeTruthy();
  });

  it('matches the photograph to 05:12, closes the case, and 0094 gains a time', async () => {
    const repo = createMemoryRepository(closedSave(...SEASON_1));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    openTerminal();
    click(/The Next Number/);
    expect(screen.getByText('Reserved')).toBeTruthy();
    click('Open case files');

    click(/Camera 2 footage, before dawn/);
    click(/05:08:10/);
    click('Desk lamp');
    expect(screen.getByText('The desk lamp goes off. No one is at the desk.')).toBeTruthy();
    back(CASE_FILES);

    click(/File 0093 photograph/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c008-still-0512' } });
    click(/^Wall clock/);
    expect(screen.getByText('Added to the case files: Timing note.')).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const filed = question(/When was File 0093 filed/);
    const matches = question(/match the records of the desk/);
    const order = question(/order they happened/);
    const desk = question(/desk at 05:12/);
    const sender = question(/Who sent the envelope/);
    fireEvent.click(filed.getByRole('radio', { name: /03:40, as the intake ledger/ }));
    fireEvent.click(filed.getByRole('checkbox', { name: 'Intake ledger, tonight' }));
    fireEvent.click(matches.getByRole('radio', { name: /05:12, later tonight/ }));
    fireEvent.click(matches.getByRole('checkbox', { name: 'Timing note' }));
    // Start: moment, received, filed, delivered, lamp → filed, lamp, delivered, moment, received.
    const up = (text: RegExp, n: number) => {
      for (let i = 0; i < n; i++) fireEvent.click(order.getByRole('button', { name: text }));
    };
    up(/^Move up: File 0093 is filed/, 2);
    up(/^Move up: The desk lamp goes off/, 3);
    up(/^Move up: An envelope is delivered/, 2);
    fireEvent.click(order.getByRole('checkbox', { name: 'Intake ledger, tonight' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Camera 2 footage, before dawn' }));
    fireEvent.click(desk.getByRole('checkbox', { name: 'The camera 2 footage' }));
    fireEvent.click(desk.getByRole('checkbox', { name: 'The lamp circuit log' }));
    fireEvent.click(desk.getByRole('checkbox', { name: 'The internal post log' }));
    fireEvent.click(desk.getByRole('checkbox', { name: 'Lamp circuit log' }));
    fireEvent.click(sender.getByRole('radio', { name: /cannot be established/ }));
    fireEvent.click(sender.getByRole('checkbox', { name: 'Internal post log' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/The Next Number/);
    expect(screen.getByText('06:00')).toBeTruthy();

    await waitFor(() => {
      expect((repo.stored() as SaveGame).cases['case-008']?.discoveries).toEqual(['c008-timing']);
    });
  });
});
