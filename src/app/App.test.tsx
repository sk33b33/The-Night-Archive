import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { evidenceId } from '../domain/evidence';
import { createSave, recordVisit } from '../domain/progress';
import { SAVE_VERSION, type SaveGame } from '../domain/save';
import { createMemoryRepository, type SaveRepository } from '../services/persistence/saveRepository';
import { PREFERENCES_STORAGE_KEY } from '../services/preferences/preferences';
import { App } from './App';

const CASE_001 = caseId('case-001');

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '');
});

afterEach(cleanup);

/** jsdom's history.back() is asynchronous; deliver the popstate it would fire. */
function simulateBack(stack: readonly object[]) {
  window.history.replaceState({ nightArchiveStack: stack }, '');
  fireEvent(window, new PopStateEvent('popstate', { state: window.history.state }));
}

function fakeEngine() {
  const engine = {
    starts: [] as { offset: number; rate: number; filters: string }[],
    stops: 0,
    start(offset: number, rate: number, filters: ReadonlySet<string>) {
      engine.starts.push({ offset: Math.round(offset), rate, filters: [...filters].join('+') });
    },
    stop() {
      engine.stops += 1;
    },
    dispose() {},
  };
  return engine;
}

async function renderReady(repository: SaveRepository | null = createMemoryRepository()) {
  render(<App repository={repository} />);
  // The menu settles once the save has loaded.
  await waitFor(() => expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('false'));
}

function heading(name: string) {
  return screen.getByRole('heading', { level: 1, name });
}

describe('main menu', () => {
  it('shows the title and tagline', async () => {
    await renderReady();
    expect(heading('The Night Archive')).toBeTruthy();
    expect(screen.getByText(/Some stories refuse to stay buried/)).toBeTruthy();
  });

  it('explains why Continue is disabled when there is no save', async () => {
    await renderReady();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText('No saved shift on this device yet.')).toBeTruthy();
    fireEvent.click(continueButton);
    expect(heading('The Night Archive')).toBeTruthy();
  });

  it('holds Begin shift until the stored save has loaded', () => {
    const neverLoads: SaveRepository = {
      load: () => new Promise(() => undefined),
      save: () => Promise.resolve(),
      clear: () => Promise.resolve(),
    };
    render(<App repository={neverLoads} />);
    const begin = screen.getByRole('button', { name: 'Begin shift' });
    expect(begin.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(begin);
    expect(heading('The Night Archive')).toBeTruthy();
  });

  it.each([
    [{ version: SAVE_VERSION + 1, createdAt: 'x' }, /newer version/],
    [{ version: 'broken' }, /could not be read/],
  ])('explains an unusable save %j', async (stored, message) => {
    await renderReady(createMemoryRepository(stored));
    expect(screen.getByText(message)).toBeTruthy();
  });

  it('explains when storage is unavailable and warns during play', async () => {
    await renderReady(null);
    expect(screen.getByText(/not allowing storage/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    expect(screen.getByText(/Progress is not being saved/)).toBeTruthy();
  });
});

describe('shift flow', () => {
  it('begins a shift, opens the Case 001 briefing, and saves progress', async () => {
    const repo = createMemoryRepository();
    await renderReady(repo);

    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    expect(document.activeElement).toBe(heading('Archive dashboard'));
    expect(screen.getByText('New')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    expect(heading('The Missing Recording')).toBeTruthy();
    expect(screen.getByText('Elias Ward (station staff)')).toBeTruthy();
    expect(screen.getByText('No incident confirmed')).toBeTruthy();

    await waitFor(() => {
      const stored = repo.stored() as SaveGame;
      expect(stored.resume).toEqual({ screen: 'briefing', caseId: 'case-001' });
      expect(stored.cases['case-001']?.status).toBe('opened');
    });

    simulateBack([{ id: 'menu' }, { id: 'archive' }]);
    expect(screen.getByText('Opened')).toBeTruthy();
  });

  it('opens the case files, examines a document, and searches it', async () => {
    const repo = createMemoryRepository();
    await renderReady(repo);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));

    expect(screen.getByText('0 of 5 items examined')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Filtered segment/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Night timetable/ }));
    expect(heading('Night timetable')).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Departures after 23:00' })).toBeTruthy();

    const search = screen.getByRole('searchbox', { name: 'Search this document' });
    fireEvent.change(search, { target: { value: 'carrow' } });
    expect(screen.getByRole('status').textContent).toBe('3 matches');
    expect(document.querySelectorAll('mark').length).toBe(3);
    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByRole('status').textContent).toBe('0 matches');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(document.querySelectorAll('mark').length).toBe(0);

    await waitFor(() => {
      const stored = repo.stored() as SaveGame;
      expect(stored.cases['case-001']?.examined).toEqual(['c001-timetable']);
      expect(stored.resume).toEqual({
        screen: 'evidence',
        caseId: 'case-001',
        evidenceId: 'c001-timetable',
      });
    });

    simulateBack([{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-001' }]);
    expect(screen.getByText('1 of 5 items examined')).toBeTruthy();
    expect(screen.getByText('Examined')).toBeTruthy();
  });

  it('plays the reel, and the filter reveals the second voice and files a new item', async () => {
    const engine = fakeEngine();
    const repo = createMemoryRepository();
    render(<App repository={repo} createEngine={() => engine} />);
    await waitFor(() => expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('false'));
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));
    fireEvent.click(screen.getByRole('button', { name: /Audio reel/ }));

    expect(heading('Audio reel')).toBeTruthy();
    expect(screen.getByText('[Tape hiss]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(engine.starts).toEqual([{ offset: 0, rate: 1, filters: '' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(engine.stops).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Announcement/ }));
    expect(screen.getByText(/two-ten service to Carrow Junction has been cancelled/)).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: '0.5×' }));
    expect((screen.getByRole('radio', { name: '0.5×' }) as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /Voices/ }));
    expect(screen.getByText('Don’t open the east door.')).toBeTruthy();
    expect(screen.getByText('[Tape noise rises]')).toBeTruthy();
    expect(screen.queryByText(/Mara/)).toBeNull();

    fireEvent.click(screen.getByRole('switch', { name: /Voice isolation/ }));
    expect(screen.getByText('Mara, don’t file this.')).toBeTruthy();
    expect(screen.getByText('Added to the case files: Filtered segment.')).toBeTruthy();

    await waitFor(() => {
      const stored = repo.stored() as SaveGame;
      expect(stored.cases['case-001']?.discoveries).toEqual(['c001-second-voice']);
    });

    simulateBack([{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-001' }]);
    expect(screen.getByText('1 of 6 items examined')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Filtered segment/ }));
    expect(screen.getByText('Mara, don’t file this.')).toBeTruthy();
    const fixed = screen.getByRole('switch', { name: /Voice isolation/ }) as HTMLInputElement;
    expect(fixed.checked).toBe(true);
    expect(fixed.disabled).toBe(true);
    expect(screen.getByText('Applied permanently to this copy.')).toBeTruthy();
    // Already discovered: no repeated "added" notice.
    expect(screen.queryByText(/Added to the case files/)).toBeNull();
  });

  it('keeps captions working when sound is unavailable', async () => {
    render(<App repository={createMemoryRepository()} createEngine={() => null} />);
    await waitFor(() => expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('false'));
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));
    fireEvent.click(screen.getByRole('button', { name: /Audio reel/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByText(/Sound is not available on this device/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Clock chime/ }));
    expect(screen.getByText('[A station clock chimes]')).toBeTruthy();
  });

  it('creates board connections, shows supported vs hypothesis, and saves them', async () => {
    const repo = createMemoryRepository();
    await renderReady(repo);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open evidence board' }));
    expect(heading('Evidence board')).toBeTruthy();
    expect(screen.getByText(/No connections yet/)).toBeTruthy();

    // Tapping two cards fills the form.
    fireEvent.pointerDown(screen.getByRole('button', { name: /^Incident report/ }), { pointerId: 1, button: 0 });
    fireEvent.pointerUp(screen.getByRole('button', { name: /^Incident report/ }), { pointerId: 1 });
    fireEvent.keyDown(screen.getByRole('button', { name: /^Duty roster/ }), { key: 'Enter' });
    expect((screen.getByLabelText('First item') as HTMLSelectElement).value).toBe('c001-incident-report');
    expect((screen.getByLabelText('Second item') as HTMLSelectElement).value).toBe('c001-duty-roster');
    fireEvent.click(screen.getByRole('button', { name: 'Add connection' }));
    expect(screen.getByText(/Supported by the records: The report names Elias Ward/)).toBeTruthy();
    expect(screen.getByText('Incident report — contradicts — Duty roster')).toBeTruthy();

    // An unsupported connection becomes a hypothesis, with no penalty.
    fireEvent.change(screen.getByLabelText('First item'), { target: { value: 'c001-timetable' } });
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'contradicts' } });
    fireEvent.change(screen.getByLabelText('Second item'), { target: { value: 'c001-maintenance-record' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add connection' }));
    expect(screen.getByText(/added as a hypothesis/)).toBeTruthy();
    expect(screen.getByText('1 supported · 1 hypothesis')).toBeTruthy();

    // Duplicates are explained, not added.
    fireEvent.change(screen.getByLabelText('First item'), { target: { value: 'c001-duty-roster' } });
    fireEvent.change(screen.getByLabelText('Second item'), { target: { value: 'c001-incident-report' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add connection' }));
    expect(screen.getByText('That connection is already on the board.')).toBeTruthy();

    // Keyboard moves a card.
    fireEvent.keyDown(screen.getByRole('button', { name: /^Night timetable/ }), { key: 'ArrowRight' });

    await waitFor(() => {
      const board = (repo.stored() as SaveGame).cases['case-001']?.board;
      expect(board?.links).toHaveLength(2);
      expect(board?.positions['c001-timetable']).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /Remove connection: Night timetable/ }));
    expect(screen.getByText('1 supported · 0 hypotheses')).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: 'List' }));
    expect(screen.queryByRole('button', { name: /^Incident report, File 001/ })).toBeNull();
    expect(screen.getByText('Incident report — contradicts — Duty roster')).toBeTruthy();
  });

  it('submits findings, gets a hint, then closes the case', async () => {
    const repo = createMemoryRepository();
    await renderReady(repo);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Case findings' }));
    expect(heading('Case findings')).toBeTruthy();

    const submit = screen.getByRole('button', { name: 'Submit findings' });
    expect(submit.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText('Answer every question before submitting.')).toBeTruthy();

    const q = (prompt: RegExp) => {
      const section = screen.getByRole('heading', { name: prompt }).closest('section');
      if (!section) throw new Error('question section missing');
      return within(section);
    };
    const reliability = q(/relied on/);
    const recording = q(/recording show/);
    const caller = q(/Who made the call/);

    reliability.getByRole('radio', { name: /unreliable or incomplete/ }).click();
    reliability.getByRole('checkbox', { name: 'Duty roster' }).click();
    recording.getByRole('radio', { name: /leaves out/ }).click();
    recording.getByRole('checkbox', { name: 'Incident report' }).click();
    recording.getByRole('checkbox', { name: 'Audio reel' }).click();
    caller.getByRole('radio', { name: 'Mara.' }).click();

    fireEvent.click(screen.getByRole('button', { name: 'Submit findings' }));
    expect(screen.getByRole('heading', { name: 'Findings partly accepted' })).toBeTruthy();
    expect(screen.getByText(/Ask what the records actually establish/)).toBeTruthy();

    caller.getByRole('radio', { name: /cannot establish/ }).click();
    fireEvent.click(screen.getByRole('button', { name: 'Submit findings' }));
    expect(screen.getByRole('heading', { name: 'Findings incomplete' })).toBeTruthy();
    expect(screen.getByText(/Cite the record that casts doubt/)).toBeTruthy();

    caller.getByRole('checkbox', { name: 'Duty roster' }).click();
    fireEvent.click(screen.getByRole('button', { name: 'Submit findings' }));
    expect(screen.getByRole('heading', { name: 'Findings accepted' })).toBeTruthy();
    expect(screen.getByText('The caller’s identity remains unknown.')).toBeTruthy();
    expect(screen.getByText('3 submissions recorded')).toBeTruthy();

    await waitFor(() => {
      const attempts = (repo.stored() as SaveGame).cases['case-001']?.attempts ?? [];
      expect(attempts.map((a) => a.outcome)).toEqual(['partial', 'incomplete', 'correct']);
      expect(attempts[2]?.citations['caller-identity']).toEqual(['c001-duty-roster']);
      expect(attempts[0]?.answers['caller-identity']).toBe('mara');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Return to the archive' }));
    expect(heading('Archive dashboard')).toBeTruthy();
    expect(screen.getByText('Closed')).toBeTruthy();

    // The end anomaly appears, unexplained.
    fireEvent.click(screen.getByRole('button', { name: /File 0091/ }));
    expect(heading('File 0091')).toBeTruthy();
    expect(screen.getByRole('img', { name: /date imprinted in the corner reads 14 October 1981/ })).toBeTruthy();
    expect(screen.getByText('Workstation NA-07')).toBeTruthy();
    expect(screen.getByText('1998')).toBeTruthy();
  });

  it('keeps unsubmitted findings across a refresh', async () => {
    window.sessionStorage.clear();
    const repo = createMemoryRepository();
    await renderReady(repo);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    fireEvent.click(screen.getByRole('button', { name: /The Missing Recording/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open case files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Case findings' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Mara.' }));
    cleanup();

    window.history.replaceState(
      { nightArchiveStack: [{ id: 'menu' }, { id: 'archive' }, { id: 'findings', caseId: 'case-001' }] },
      '',
    );
    await act(async () => {
      render(<App repository={repo} />);
    });
    expect((screen.getByRole('radio', { name: 'Mara.' }) as HTMLInputElement).checked).toBe(true);
    window.sessionStorage.clear();
  });

  it('shows the workstation on the dashboard and no anomaly before the case closes', async () => {
    await renderReady();
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    expect(screen.getByText('NA-07')).toBeTruthy();
    expect(screen.queryByText('File 0091')).toBeNull();
  });

  it('refuses to open the anomaly from history before the case is closed', async () => {
    window.history.replaceState(
      { nightArchiveStack: [{ id: 'menu' }, { id: 'anomaly', anomalyId: 'file-0091' }] },
      '',
    );
    await act(async () => {
      render(<App repository={createMemoryRepository()} />);
    });
    expect(screen.getByText('There is no record of this file.')).toBeTruthy();
  });

  it('Continue resumes at saved evidence with Back leading to the case files', async () => {
    const saved = recordVisit(
      createSave(new Date('2026-01-01T00:00:00Z')),
      { screen: 'evidence', caseId: CASE_001, evidenceId: evidenceId('c001-duty-roster') },
      new Date('2026-01-01T00:01:00Z'),
    );
    await renderReady(createMemoryRepository(saved));

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(heading('Duty roster')).toBeTruthy();

    // The in-app Back button defers to the browser history; wait for the
    // real popstate so it cannot leak into the next test.
    fireEvent.click(screen.getByRole('button', { name: /Case files/ }));
    await waitFor(() => expect(screen.getByText('1 of 5 items examined')).toBeTruthy());
  });

  it('upgrades a version 1 save and resumes from it', async () => {
    const v1 = {
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:01:00.000Z',
      resume: { screen: 'briefing', caseId: 'case-001' },
      cases: { 'case-001': { status: 'opened', firstOpenedAt: '2026-01-01T00:01:00.000Z' } },
    };
    await renderReady(createMemoryRepository(v1));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(heading('The Missing Recording')).toBeTruthy();
  });

  it('ignores history entries that point at unknown evidence', async () => {
    window.history.replaceState(
      {
        nightArchiveStack: [
          { id: 'menu' },
          { id: 'evidence', caseId: 'case-001', evidenceId: 'c001-not-real' },
        ],
      },
      '',
    );
    await act(async () => {
      render(<App repository={createMemoryRepository()} />);
    });
    // Unknown evidence is rejected while parsing history, so the app starts at the menu.
    expect(heading('The Night Archive')).toBeTruthy();
  });

  it('restores the current screen from history after a refresh', async () => {
    window.history.replaceState(
      { nightArchiveStack: [{ id: 'menu' }, { id: 'archive' }, { id: 'briefing', caseId: 'case-001' }] },
      '',
    );
    await act(async () => {
      render(<App repository={createMemoryRepository()} />);
    });
    expect(heading('The Missing Recording')).toBeTruthy();
  });

  it('shows a warning when a save write fails', async () => {
    const failing: SaveRepository = {
      load: () => Promise.resolve(undefined),
      save: () => Promise.reject(new Error('quota')),
      clear: () => Promise.resolve(),
    };
    await renderReady(failing);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    expect(await screen.findByText(/latest progress could not be saved/)).toBeTruthy();
  });
});

describe('settings', () => {
  it('persists and applies preferences', async () => {
    await renderReady();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('radio', { name: /Reduced/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Large/ }));

    expect(document.documentElement.dataset.motion).toBe('reduced');
    expect(document.documentElement.dataset.textSize).toBe('large');
    const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({ motion: 'reduced', textSize: 'large' });
  });

  it('disables erase when there is nothing saved', async () => {
    await renderReady();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(
      screen.getByRole('button', { name: 'Erase saved progress' }).getAttribute('aria-disabled'),
    ).toBe('true');
    expect(screen.getByText('There is no saved progress to erase.')).toBeTruthy();
  });

  it('erases progress only after confirmation', async () => {
    const repo = createMemoryRepository(createSave(new Date('2026-01-01T00:00:00Z')));
    await renderReady(repo);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    fireEvent.click(screen.getByRole('button', { name: 'Erase saved progress' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep progress' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep progress' }));
    expect(repo.stored()).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Erase saved progress' }));
    fireEvent.click(screen.getByRole('button', { name: 'Erase progress' }));
    expect(await screen.findByText('Saved progress erased.')).toBeTruthy();
    expect(repo.stored()).toBeUndefined();

    simulateBack([{ id: 'menu' }]);
    expect(screen.getByRole('button', { name: 'Begin shift' })).toBeTruthy();
  });
});
