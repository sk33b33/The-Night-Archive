import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SaveGame } from '../domain/save';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, caseFiles, click, openTerminal, question, resetBrowserState } from '../test/playthrough';

/**
 * Full Case 001 playthrough, as a regression test for the complete loop:
 * briefing → documents → audio filter → board → findings → File 0091,
 * with a "refresh" (fresh mount on the same save) in the middle.
 */
const noSound = () => null;

beforeEach(resetBrowserState);
afterEach(cleanup);

const heading = (name: string | RegExp) => screen.getByRole('heading', { level: 1, name });

const CASE_FILES = caseFiles('case-001');

describe('Case 001 full playthrough', () => {
  it('can be completed from a fresh start, surviving a refresh, to the end anomaly', async () => {
    const repo = createMemoryRepository();
    render(<App repository={repo} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('false'));

    // Shift starts; briefing; case files.
    click('Begin shift');
    openTerminal();
    click(/The Missing Recording/);
    expect(screen.getByText('Elias Ward (station staff)')).toBeTruthy();
    click('Open case files');
    expect(screen.getByText('0 of 5 items examined')).toBeTruthy();

    // Read every document.
    for (const title of ['Incident report', 'Night timetable', 'Maintenance record', 'Duty roster']) {
      click(new RegExp(title));
      expect(heading(title)).toBeTruthy();
      back(CASE_FILES);
    }
    expect(screen.getByText('4 of 5 items examined')).toBeTruthy();

    // Refresh: remount on the same save; Continue returns to the case files.
    await waitFor(() => expect((repo.stored() as SaveGame).cases['case-001']?.examined).toHaveLength(4));
    cleanup();
    window.history.replaceState(null, '');
    render(<App repository={repo} createEngine={noSound} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(screen.getByText('4 of 5 items examined')).toBeTruthy();

    // Audio: the filter reveals the second voice and files the filtered segment.
    click(/Audio reel/);
    click(/Voices/);
    fireEvent.click(screen.getByRole('switch', { name: /Voice isolation/ }));
    expect(screen.getByText('Mara, don’t file this.')).toBeTruthy();
    back(CASE_FILES);
    expect(screen.getByText('5 of 6 items examined')).toBeTruthy();

    // Board: one supported link and one hypothesis.
    click('Open evidence board');
    const connect = (from: string, relation: string, to: string) => {
      fireEvent.change(screen.getByLabelText('First item'), { target: { value: from } });
      fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: relation } });
      fireEvent.change(screen.getByLabelText('Second item'), { target: { value: to } });
      click('Add connection');
    };
    connect('c001-incident-report', 'contradicts', 'c001-duty-roster');
    connect('c001-audio-reel', 'contradicts', 'c001-timetable');
    expect(screen.getByText('1 supported · 1 hypothesis')).toBeTruthy();
    back(CASE_FILES);

    // Findings: a wrong theory first, then the supported findings.
    click('Case findings');
    const reliability = question(/relied on/);
    const recording = question(/recording show/);
    const caller = question(/Who made the call/);
    fireEvent.click(reliability.getByRole('radio', { name: /unreliable or incomplete/ }));
    fireEvent.click(reliability.getByRole('checkbox', { name: 'Duty roster' }));
    fireEvent.click(recording.getByRole('radio', { name: /leaves out/ }));
    fireEvent.click(recording.getByRole('checkbox', { name: 'Incident report' }));
    fireEvent.click(recording.getByRole('checkbox', { name: 'Filtered segment' }));
    fireEvent.click(caller.getByRole('radio', { name: /second voice/ }));
    fireEvent.click(caller.getByRole('checkbox', { name: 'Filtered segment' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings partly accepted' })).toBeTruthy();

    fireEvent.click(caller.getByRole('radio', { name: /cannot establish/ }));
    fireEvent.click(caller.getByRole('checkbox', { name: 'Duty roster' }));
    click('Submit findings');
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();

    // The end anomaly.
    click('Return to the archive');
    expect(screen.getByText('Closed')).toBeTruthy();
    click(/File 0091/);
    expect(heading('File 0091')).toBeTruthy();
    expect(screen.getByText('1998')).toBeTruthy();

    // The save holds the whole history.
    await waitFor(() => {
      const progress = (repo.stored() as SaveGame).cases['case-001'];
      expect(progress?.discoveries).toEqual(['c001-second-voice']);
      expect(progress?.board.links).toHaveLength(2);
      expect(progress?.attempts.map((a) => a.outcome)).toEqual(['partial', 'correct']);
      expect(progress?.attempts[0]?.answers['caller-identity']).toBe('second-voice');
    });

    // A later session still sees the closed case and the unfiled file.
    cleanup();
    resetBrowserState();
    await act(async () => {
      render(<App repository={repo} createEngine={noSound} />);
    });
    click('Reading room');
    openTerminal();
    expect(screen.getByText('Closed')).toBeTruthy();
    expect(screen.getByRole('button', { name: /File 0091/ })).toBeTruthy();
  });
});
