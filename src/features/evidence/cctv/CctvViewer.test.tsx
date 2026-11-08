import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evidenceId, type CctvEvidence } from '../../../domain/evidence';
import { CctvViewer } from './CctvViewer';

const item: CctvEvidence = {
  id: evidenceId('cam'),
  kind: 'cctv',
  title: 'Test footage',
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' },
  artwork: 'reading-room-camera-2',
  catalogue: [],
  frames: [
    { time: '22:00:00', scene: { door: 'shut' }, description: 'Frame one.', regions: [] },
    {
      time: '23:10:04',
      scene: { door: 'ajar' },
      description: 'Frame two.',
      regions: [{ id: 'door', label: 'Door', note: 'Open.', x: 0.6, y: 0.2, width: 0.1, height: 0.3 }],
    },
    { time: '23:11:30', scene: { door: 'shut' }, description: 'Frame three.', regions: [] },
  ],
};

beforeEach(() => {
  document.documentElement.dataset.motion = 'full';
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

const time = () => screen.getByText(/· frame/).textContent;

describe('CctvViewer', () => {
  it('steps frame by frame and stays put at the ends', () => {
    render(<CctvViewer item={item} />);
    expect(time()).toBe('22:00:00 · frame 1 of 3');
    fireEvent.click(screen.getByRole('button', { name: 'Previous frame' }));
    expect(time()).toBe('22:00:00 · frame 1 of 3');
    fireEvent.click(screen.getByRole('button', { name: 'Next frame' }));
    expect(time()).toBe('23:10:04 · frame 2 of 3');
    expect(screen.getByRole('img', { name: 'Frame two.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Door' })).toBeTruthy();
  });

  it('scrubs and jumps from the frame list', () => {
    render(<CctvViewer item={item} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Frame' }), { target: { value: '2' } });
    expect(time()).toBe('23:11:30 · frame 3 of 3');
    fireEvent.click(screen.getByRole('button', { name: /22:00:00/ }));
    expect(time()).toBe('22:00:00 · frame 1 of 3');
  });

  it('plays through the frames and stops on the last', () => {
    vi.useFakeTimers();
    render(<CctvViewer item={item} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    act(() => {
      vi.advanceTimersByTime(700 * 5);
    });
    expect(time()).toBe('23:11:30 · frame 3 of 3');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
  });

  it('offers no playback under reduced motion, and says why', () => {
    document.documentElement.dataset.motion = 'reduced';
    render(<CctvViewer item={item} />);
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
    expect(screen.getByText(/Playback is off because reduced motion is on/)).toBeTruthy();
  });
});
