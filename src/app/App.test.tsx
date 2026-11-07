import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
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
    expect(screen.getByText('Elias Ward')).toBeTruthy();
    expect(screen.getByText('No incident confirmed')).toBeTruthy();
    const begin = screen.getByRole('button', { name: 'Begin investigation' });
    expect(begin.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText(/workspace is not available/)).toBeTruthy();

    await waitFor(() => {
      const stored = repo.stored() as SaveGame;
      expect(stored.resume).toEqual({ screen: 'briefing', caseId: 'case-001' });
      expect(stored.cases['case-001']?.status).toBe('opened');
    });

    simulateBack([{ id: 'menu' }, { id: 'archive' }]);
    expect(screen.getByText('Opened')).toBeTruthy();
  });

  it('Continue resumes at the saved briefing with Back leading to the archive', async () => {
    const saved = recordVisit(
      createSave(new Date('2026-01-01T00:00:00Z')),
      { screen: 'briefing', caseId: CASE_001 },
      new Date('2026-01-01T00:01:00Z'),
    );
    await renderReady(createMemoryRepository(saved));

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(heading('The Missing Recording')).toBeTruthy();
    expect(window.history.state).toEqual({
      nightArchiveStack: [{ id: 'menu' }, { id: 'archive' }, { id: 'briefing', caseId: 'case-001' }],
    });

    // The in-app Back button defers to the browser history; wait for the
    // real popstate so it cannot leak into the next test.
    fireEvent.click(screen.getByRole('button', { name: /Archive/ }));
    await waitFor(() => expect(heading('Archive dashboard')).toBeTruthy());
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
