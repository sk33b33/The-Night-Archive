import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UpdatePrompt, type ServiceWorkerStatus } from './UpdatePrompt';

afterEach(cleanup);

function status(patch: Partial<ServiceWorkerStatus>): ServiceWorkerStatus {
  return { needRefresh: false, offlineReady: false, update: vi.fn(), dismiss: vi.fn(), ...patch };
}

describe('UpdatePrompt', () => {
  it('renders nothing when there is no news', () => {
    const { container } = render(<UpdatePrompt useStatus={() => status({})} />);
    expect(container.textContent).toBe('');
  });

  it('asks before updating and reassures that progress is saved', () => {
    const s = status({ needRefresh: true });
    render(<UpdatePrompt useStatus={() => s} />);
    expect(screen.getByText(/new version of the archive is available. Your progress is saved/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Update now' }));
    expect(s.update).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(s.dismiss).toHaveBeenCalledOnce();
  });

  it('announces offline readiness with a dismiss control only', () => {
    const s = status({ offlineReady: true });
    render(<UpdatePrompt useStatus={() => s} />);
    expect(screen.getByText('The archive is ready to work offline.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Update now' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(s.dismiss).toHaveBeenCalledOnce();
  });
});
