import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PREFERENCES_STORAGE_KEY } from '../services/preferences/preferences';
import { App } from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '');
});

afterEach(cleanup);

describe('App shell', () => {
  it('shows the main menu with title and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'The Night Archive' })).toBeTruthy();
    expect(screen.getByText(/Some stories refuse to stay buried/)).toBeTruthy();
  });

  it('explains why Continue is disabled and ignores activation', () => {
    render(<App />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton.getAttribute('aria-disabled')).toBe('true');
    expect(continueButton.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText(/No saved shift on this device yet/)).toBeTruthy();
    fireEvent.click(continueButton);
    expect(screen.getByRole('heading', { level: 1, name: 'The Night Archive' })).toBeTruthy();
  });

  it('navigates to the archive and back to the menu', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Begin shift' }));
    const heading = screen.getByRole('heading', { level: 1, name: 'Archive dashboard' });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText('Your desk is clear.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Main menu/ }));
    // jsdom's history.back() is asynchronous; deliver the popstate it would fire.
    window.history.replaceState({ nightArchiveStack: ['menu'] }, '');
    fireEvent(window, new PopStateEvent('popstate', { state: window.history.state }));
    expect(screen.getByRole('heading', { level: 1, name: 'The Night Archive' })).toBeTruthy();
  });

  it('persists and applies settings', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('radio', { name: /Reduced/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Large/ }));

    expect(document.documentElement.dataset.motion).toBe('reduced');
    expect(document.documentElement.dataset.textSize).toBe('large');
    const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({ motion: 'reduced', textSize: 'large' });
  });

  it('restores the current screen from history after a refresh', () => {
    window.history.replaceState({ nightArchiveStack: ['menu', 'settings'] }, '');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy();
  });
});
