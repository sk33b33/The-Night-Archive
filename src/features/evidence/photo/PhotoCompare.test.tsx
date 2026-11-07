import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { evidenceId, type PhotoEvidence } from '../../../domain/evidence';
import { PhotoCompare } from './PhotoCompare';

afterEach(cleanup);

const base = {
  kind: 'photo' as const,
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' as const },
  artwork: 'workstation-na07',
  alt: 'Test photograph',
  caption: 'c',
  catalogue: [],
};
const left: PhotoEvidence = {
  ...base,
  id: evidenceId('left'),
  title: 'Left photo',
  regions: [
    { id: 'shared', label: 'Shared thing', note: 'Left note.', x: 0.4, y: 0.4, width: 0.1, height: 0.1, revealsOnMatch: 'matched' },
    { id: 'only-left', label: 'Left only', note: 'Only here.', x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
  ],
};
const right: PhotoEvidence = {
  ...base,
  id: evidenceId('right'),
  title: 'Right photo',
  artwork: 'reading-room-1998',
  regions: [{ id: 'shared', label: 'Shared thing', note: 'Right note.', x: 0.4, y: 0.4, width: 0.1, height: 0.1 }],
};

describe('PhotoCompare', () => {
  it('pairs regions by ID and records a discovery only for a match in both', () => {
    const onMatch = vi.fn();
    render(<PhotoCompare left={left} right={right} onMatch={onMatch} />);
    fireEvent.click(screen.getByRole('button', { name: /Left only/ }));
    expect(onMatch).not.toHaveBeenCalled();
    expect(screen.getByText('Not in this photograph.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Shared thing/ }));
    expect(onMatch).toHaveBeenCalledWith('matched');
    expect(screen.getByText('Left note.')).toBeTruthy();
    expect(screen.getByText('Right note.')).toBeTruthy();
  });

  it('keeps both views in step when synced, and independent when not', () => {
    render(<PhotoCompare left={left} right={right} onMatch={() => {}} />);
    const [a, b] = screen.getAllByRole('group').filter((g) => g.getAttribute('aria-roledescription'));
    if (!a || !b) throw new Error('viewers missing');
    const layer = (g: HTMLElement) => (g.firstElementChild as HTMLElement).style.transform;
    fireEvent.keyDown(a, { key: '+' });
    expect(layer(b)).toBe(layer(a));
    fireEvent.click(screen.getByRole('switch', { name: /Keep views in step/ }));
    fireEvent.keyDown(a, { key: '+' });
    expect(layer(b)).not.toBe(layer(a));
  });
});
