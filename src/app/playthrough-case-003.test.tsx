import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, closedSave, question, resetBrowserState } from '../test/playthrough';

/** Case 003 end to end, from a save with Cases 001 and 002 closed. */
const noSound = () => null;
const CASE_FILES = caseFiles('case-003');

beforeEach(resetBrowserState);
afterEach(cleanup);

const heading = (name: string | RegExp) => screen.getByRole('heading', { level: 1, name });


describe('Case 003 playthrough', () => {
  it('can be completed, including the ordering question, and the call log gains a sixth call', async () => {
    const repo = createMemoryRepository(closedSave('case-001', 'case-002'));
    render(<App repository={repo} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    click(/The Unknown Caller/);
    expect(screen.getByRole('table', { name: 'Calls received' })).toBeTruthy();
    click('Open case files');
    expect(screen.getByText('0 of 6 items examined')).toBeTruthy();

    // The object: chain of custody and a linked record.
    click(/Call box handset/);
    expect(screen.getByText('Tagged and stored')).toBeTruthy();
    click(/Call box fault report/);
    expect(heading('Call box fault report')).toBeTruthy();
    back(CASE_FILES);

    // The recording: background isolation files the analysis.
    click(/Recording of call 5/);
    click(/The call/);
    expect(screen.getByText('[Faint background noise]')).toBeTruthy();
    fireEvent.click(screen.getByRole('switch', { name: /Background isolation/ }));
    expect(screen.getByText('[A kettle coming to the boil]')).toBeTruthy();
    expect(screen.getByText('Added to the case files: Background analysis.')).toBeTruthy();
    back(CASE_FILES);
    expect(screen.getByRole('button', { name: /Background analysis/ })).toBeTruthy();

    // Findings, including the ordering question.
    click('Case findings');
    const box = question(/Station Road call box\?/);
    const origin = question(/fifth call come from/);
    const caller = question(/Who made the calls/);
    const order = question(/in the order/);
    fireEvent.click(box.getByRole('radio', { name: /could not be used/ }));
    fireEvent.click(box.getByRole('checkbox', { name: 'Call box handset' }));
    fireEvent.click(origin.getByRole('radio', { name: /ex-directory/ }));
    fireEvent.click(origin.getByRole('checkbox', { name: 'Malicious-call trace' }));
    fireEvent.click(caller.getByRole('radio', { name: /cannot establish/ }));
    fireEvent.click(caller.getByRole('checkbox', { name: 'Malicious-call trace' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Call box fault report' }));
    fireEvent.click(order.getByRole('checkbox', { name: 'Malicious-call trace' }));

    // Authored start: call-5, refitted, call-1, trace-requested, removed.
    // Target: removed, call-1, trace-requested, call-5, refitted.
    const up = (text: RegExp, times: number) => {
      for (let i = 0; i < times; i++) fireEvent.click(order.getByRole('button', { name: text }));
    };
    up(/^Move up: The call box handset is removed/, 4); // removed, call-5, refitted, call-1, trace
    up(/^Move up: The first call/, 2); // removed, call-1, call-5, refitted, trace
    up(/^Move up: A trace is requested/, 2); // removed, call-1, trace, call-5, refitted
    expect(order.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('removed for repair'),
      expect.stringContaining('first call'),
      expect.stringContaining('trace is requested'),
      expect.stringContaining('fifth call'),
      expect.stringContaining('refitted'),
    ]);
    expect(screen.getByText('Moved to position 3 of 5: A trace is requested.')).toBeTruthy();
    // At the top, Move up stays focusable but does nothing.
    const top = order.getByRole('button', { name: /^Move up: The call box handset is removed/ });
    expect(top.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(top);
    expect(order.getAllByRole('listitem')[0]?.textContent).toContain('removed for repair');

    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    // End beat: the sixth call.
    click('Return to the archive');
    expect(screen.getAllByText('1 record amended since filing')).toHaveLength(2);
    click(/The Unknown Caller/);
    expect(screen.getByText('Records facility, night entrance')).toBeTruthy();

    await waitFor(() => {
      const progress = (repo.stored() as SaveGame).cases['case-003'];
      expect(progress?.discoveries).toEqual(['c003-room-sound']);
      expect(progress?.attempts.at(-1)?.answers.sequence).toBe('removed,call-1,trace-requested,call-5,refitted');
    });
  });
});
