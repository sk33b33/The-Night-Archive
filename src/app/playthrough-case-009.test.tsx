import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState } from '../test/playthrough';

/** Case 009 end to end, from a save with Cases 001–008 closed. */
const CASE_FILES = caseFiles('case-009');
const BEFORE = ['case-001', 'case-002', 'case-003', 'case-004', 'case-005', 'case-006', 'case-007', 'case-008'];

beforeEach(resetBrowserState);
afterEach(cleanup);

describe('Case 009 playthrough', () => {
  it('compares letterforms, closes the case, and the register gains “— tonight”', async () => {
    const repo = createMemoryRepository(closedSave(...BEFORE));
    render(<App repository={repo} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    click(/The Hand/);
    click('Open case files');

    // The slip against the 1979 specimen: the crossed M.
    click(/The 0094 intake slip/);
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c009-specimen' } });
    click(/^Crossed “M”/);
    expect(screen.getByText('Added to the case files: Specimen comparison note.')).toBeTruthy();
    // Then against the “0091” sample: the open 0.
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'c009-sample-0091' } });
    click(/^Open “0”/);
    expect(screen.getByText(/Sample comparison note/)).toBeTruthy();
    back(CASE_FILES);

    click('Case findings');
    const one = question(/consistent with one hand\?/);
    const standard = question(/strongest conclusion/);
    const named = question(/name a night archivist/);
    const order = question(/in order of the record’s date/);
    const same = question(/same person\?/);
    fireEvent.click(one.getByRole('radio', { name: /share the same letterforms/ }));
    fireEvent.click(one.getByRole('checkbox', { name: 'Sample comparison note' }));
    fireEvent.click(one.getByRole('checkbox', { name: 'Examiner’s method note' }));
    fireEvent.click(standard.getByRole('radio', { name: /consistent with one hand/ }));
    fireEvent.click(standard.getByRole('checkbox', { name: 'Examiner’s method note' }));
    fireEvent.click(named.getByRole('checkbox', { name: 'The staff register' }));
    fireEvent.click(named.getByRole('checkbox', { name: 'The night archivist post record' }));
    fireEvent.click(named.getByRole('checkbox', { name: 'Staff register extract' }));
    // Start: slip, calendar, specimen, ledger → specimen, ledger, calendar, slip.
    const up = (text: RegExp, n: number) => {
      for (let i = 0; i < n; i++) fireEvent.click(order.getByRole('button', { name: text }));
    };
    up(/^Move up: The specimen signature card/, 2);
    up(/^Move up: The intake ledger/, 2);
    up(/^Move up: The Harrow Lane calendar/, 1);
    fireEvent.click(order.getByRole('checkbox', { name: 'Staff register extract' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'The 0094 intake slip' }));
    fireEvent.click(same.getByRole('radio', { name: /cannot establish/ }));
    fireEvent.click(same.getByRole('checkbox', { name: 'Staff register extract' }));
    fireEvent.click(same.getByRole('checkbox', { name: 'Night archivist post record' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    click('Return to the archive');
    click(/The Hand/);
    expect(screen.getByText('1983 — tonight')).toBeTruthy();

    await waitFor(() => {
      expect([...((repo.stored() as SaveGame).cases['case-009']?.discoveries ?? [])].sort()).toEqual(
        ['c009-samples-match', 'c009-specimen-match'].sort(),
      );
    });
  });
});
