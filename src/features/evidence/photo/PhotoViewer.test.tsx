import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { PhotoRegion } from '../../../domain/photoView';
import { PhotoViewer } from './PhotoViewer';

afterEach(cleanup);

const regions: PhotoRegion[] = [
  { id: 'a', label: 'Asset label', note: 'A label reads X-1.', x: 0.4, y: 0.4, width: 0.1, height: 0.05 },
  { id: 'b', label: 'Corner', note: 'Something in the corner.', x: 0.8, y: 0.85, width: 0.2, height: 0.15 },
];

function setup() {
  render(
    <PhotoViewer regions={regions}>
      <svg role="img" aria-label="Test photo" />
    </PhotoViewer>,
  );
  const viewport = screen.getByRole('group', { name: 'Photograph' });
  const layer = viewport.firstElementChild as HTMLElement;
  return { viewport, layer };
}

describe('PhotoViewer', () => {
  it('starts at the whole photograph with zoom-out and reset disabled', () => {
    setup();
    expect(screen.getByText('Full view')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Zoom out' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Reset view' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('zooms with buttons and resets', () => {
    const { layer } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('1.5×')).toBeTruthy();
    expect(layer.style.transform).toContain('scale(1.5)');
    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(screen.getByText('Full view')).toBeTruthy();
  });

  it('caps zoom and explains the limit', () => {
    setup();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('4× (maximum)')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Zoom in' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('supports keyboard zoom, pan, and reset', () => {
    const { viewport, layer } = setup();
    fireEvent.keyDown(viewport, { key: '+' });
    fireEvent.keyDown(viewport, { key: 'ArrowRight' });
    expect(layer.style.transform).toBe('translate(-35%, -25%) scale(1.5)');
    fireEvent.keyDown(viewport, { key: '0' });
    expect(layer.style.transform).toBe('translate(0%, 0%) scale(1)');
  });

  it('examines a region: zooms to it and shows its note', () => {
    const { layer } = setup();
    expect(screen.getByText('Choose a region to examine it closely.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Asset label' }));
    expect(screen.getByText('A label reads X-1.')).toBeTruthy();
    expect(layer.style.transform).toContain('scale(4)');
    expect(screen.getByRole('button', { name: 'Asset label' }).getAttribute('aria-current')).toBe('true');
  });

  it('can hide region outlines', () => {
    const { layer } = setup();
    expect(layer.querySelectorAll('.photo-region')).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show outlines' }));
    expect(layer.querySelectorAll('.photo-region')).toHaveLength(0);
  });
});
