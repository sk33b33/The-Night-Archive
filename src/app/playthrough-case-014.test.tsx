import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState, openTerminal } from '../test/playthrough';

/** Case 014 end to end, from a save with Cases 001–013 closed, for both endings. */
const CASE_FILES = caseFiles('case-014');
const BEFORE = Array.from({ length: 13 }, (_, i) => `case-${String(i + 1).padStart(3, '0')}`);

beforeEach(resetBrowserState);
afterEach(cleanup);

async function acceptFindings() {
  const repo = createMemoryRepository(closedSave(...BEFORE));
  render(<App repository={repo} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
  click('Continue');
  openTerminal();
  click(/Case 014/);
  click('Open case files');
  click(/Post record, NA-07 \(full\)/);
  expect(screen.getByText('Mara —')).toBeTruthy();
  back(CASE_FILES);

  click('Case findings');
  const named = question(/Which record names the night archivist/);
  fireEvent.click(named.getByRole('radio', { name: /^The full post record/ }));
  fireEvent.click(named.getByRole('checkbox', { name: 'Post record, NA-07 (full)' }));
  const addressed = question(/Whom does the second voice address/);
  fireEvent.click(addressed.getByRole('radio', { name: 'The night archivist at NA-07, by first name.' }));
  fireEvent.click(addressed.getByRole('checkbox', { name: 'Post record, NA-07 (full)' }));
  fireEvent.click(addressed.getByRole('checkbox', { name: 'NA-07 answerphone recording' }));
  const logged = question(/Which records log a 0:31 call/);
  fireEvent.click(logged.getByRole('checkbox', { name: /^The exchange record/ }));
  fireEvent.click(logged.getByRole('checkbox', { name: /^The extension log/ }));
  fireEvent.click(logged.getByRole('checkbox', { name: 'Exchange record, route BW-4, 1981' }));
  fireEvent.click(logged.getByRole('checkbox', { name: 'Extension log, NA-07, tonight' }));
  const years = question(/Put these in order/);
  const up = (name: RegExp, times: number) => {
    for (let i = 0; i < times; i++) fireEvent.click(years.getByRole('button', { name }));
  };
  // Start: tonight, created, call-1981, sealed, withdrawn.
  up(/^Move up: The east door is sealed/, 3); // sealed, tonight, created, call-1981, withdrawn
  up(/^Move up: A call leaves the east platform kiosk/, 2); // sealed, call-1981, tonight, created, withdrawn
  up(/^Move up: Route BW-4 is withdrawn/, 2); // sealed, call-1981, withdrawn, tonight, created
  up(/^Move up: Extension NA-07 is created/, 1); // sealed, call-1981, withdrawn, created, tonight
  fireEvent.click(years.getByRole('checkbox', { name: 'Dates on file' }));
  const how = question(/How did a voice recorded in 1981/);
  fireEvent.click(how.getByRole('radio', { name: 'It cannot be established.' }));
  fireEvent.click(how.getByRole('checkbox', { name: 'Audio reel, 1981' }));
  fireEvent.click(how.getByRole('checkbox', { name: 'Post record, NA-07 (full)' }));
  click('Submit findings');
  expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();
  return repo;
}

describe('Case 014 playthrough', () => {
  it('accepted findings do not close the case until the choice is confirmed; filed ending', async () => {
    const repo = await acceptFindings();
    expect(screen.queryByText('This file is closed.')).toBeNull();

    // Leaving before choosing keeps the case open.
    click('Return to the archive');
    expect(screen.queryByText(/Season 2 is complete/)).toBeNull();
    click(/Case 014/);
    click('Open case files');
    click('Case findings');

    click('Sign and file 0094');
    click('Go back');
    click('Sign and file 0094');
    click('Confirm: Sign and file 0094');
    expect(screen.getByText('Sign and file 0094. The shift is closed.')).toBeTruthy();
    expect(screen.getByText('This file is closed.')).toBeTruthy();

    click('Return to the archive');
    expect(screen.getByText('Closed 06:12 · Filed: 0091, 0093, 0094')).toBeTruthy();
    expect(screen.getByText('Season 2 is complete. In this save, intake 0094 was signed and filed.')).toBeTruthy();
    click(/Case 014/);
    click('Open case files');
    click(/Intake slip 0094/);
    expect(screen.getByText('Received by: night archivist, NA-07. 06:12.')).toBeTruthy();

    await waitFor(() => expect((repo.stored() as SaveGame).choices).toEqual({ 'file-0094': 'filed' }));
  });

  it('unfiled ending: the ledger says not filed and the 1981 night desk log gains a line', async () => {
    const repo = await acceptFindings();
    click('Leave 0094 unfiled');
    expect(screen.getByText(/The slip stays unsigned, and intake 0094 is recorded as not filed\./)).toBeTruthy();
    click('Confirm: Leave 0094 unfiled');

    click('Return to the archive');
    expect(screen.getByText('Closed 06:12 · Not filed: 0094')).toBeTruthy();
    expect(screen.getByText('Season 2 is complete. In this save, intake 0094 was left unfiled.')).toBeTruthy();
    click(/Case 014/);
    click('Open case files');
    click(/Night desk log, 1981/);
    expect(screen.getByText('06:12')).toBeTruthy();
    back(CASE_FILES);
    click(/Intake ledger, tonight/);
    expect(screen.getByText('Not filed')).toBeTruthy();

    await waitFor(() => expect((repo.stored() as SaveGame).choices).toEqual({ 'file-0094': 'unfiled' }));
  });
});
