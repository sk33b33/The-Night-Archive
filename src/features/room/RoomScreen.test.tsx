import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CASES } from '../../content/cases';
import type { CaseId } from '../../domain/case';
import { roomStore } from '../../world/roomStore';
import type { ArchiveView } from '../archive/ArchiveScreen';
import { RoomScreen } from './RoomScreen';

const view = (overrides: Partial<ArchiveView> = {}): ArchiveView => ({
  cases: CASES.slice(0, 9),
  statusOf: () => 'new',
  amendedCount: () => 0,
  onOpenCase: () => {},
  anomalies: [],
  onOpenAnomaly: () => {},
  ...overrides,
});

beforeEach(() => {
  roomStore.reset();
  roomStore.setSceneUnavailable(true);
});
afterEach(cleanup);

const place = (name: RegExp) => screen.getByRole('button', { name });

describe('RoomScreen', () => {
  it('lists every object in Places when the scene cannot be drawn, and explains why', () => {
    render(<RoomScreen view={view()} onLeave={() => {}} onOpenSettings={() => {}} focusOnMount={false} />);
    expect(screen.getByText(/cannot be shown on this device/)).toBeTruthy();
    for (const name of [/^Desk computer/, /^Filing cabinet, Season 1/, /^Filing cabinet, Season 2/, /^Unfiled tray/, /^Reading room door/]) {
      expect(place(name)).toBeTruthy();
    }
  });

  it('each drawer holds its own season, and Escape steps back', () => {
    const onOpenCase = vi.fn();
    render(<RoomScreen view={view({ onOpenCase })} onLeave={() => {}} onOpenSettings={() => {}} focusOnMount={false} />);
    fireEvent.click(place(/^Filing cabinet, Season 2/));
    expect(screen.getByRole('heading', { name: 'Filing cabinet · Season 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Case 008/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Case 001/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Case 009/ }));
    expect(onOpenCase).toHaveBeenCalledWith('case-009' as CaseId);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: 'Filing cabinet · Season 2' })).toBeNull();
    expect(roomStore.get().panel).toBeNull();
  });

  it('an empty drawer and an empty tray say so', () => {
    render(<RoomScreen view={view({ cases: CASES.slice(0, 3) })} onLeave={() => {}} onOpenSettings={() => {}} focusOnMount={false} />);
    fireEvent.click(place(/^Filing cabinet, Season 2/));
    expect(screen.getByText(/This drawer is empty/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Step back' }));
    fireEvent.click(place(/^Unfiled tray/));
    expect(screen.getByText('The tray is empty.')).toBeTruthy();
  });

  it('the door leaves the reading room', () => {
    const onLeave = vi.fn();
    render(<RoomScreen view={view()} onLeave={onLeave} onOpenSettings={() => {}} focusOnMount={false} />);
    fireEvent.click(place(/^Reading room door/));
    expect(onLeave).toHaveBeenCalled();
    expect(roomStore.get().panel).toBeNull();
  });

  it('with the scene drawn, Places is a toggle and the controls hint can be hidden', () => {
    roomStore.setSceneUnavailable(false);
    render(<RoomScreen view={view()} onLeave={() => {}} onOpenSettings={() => {}} focusOnMount={false} />);
    expect(screen.queryByRole('navigation', { name: 'Places' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Places' }));
    expect(screen.getByRole('navigation', { name: 'Places' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hide controls' }));
    expect(screen.queryByRole('button', { name: 'Hide controls' })).toBeNull();
  });

  it('shows what is in front of you, with a button to use it', () => {
    roomStore.setSceneUnavailable(false);
    roomStore.setFocus('pc');
    render(<RoomScreen view={view()} onLeave={() => {}} onOpenSettings={() => {}} focusOnMount={false} />);
    fireEvent.click(screen.getByRole('button', { name: /^Open the archive terminal/ }));
    expect(screen.getByRole('heading', { name: 'Archive terminal · NA-07' })).toBeTruthy();
  });
});
