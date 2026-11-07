import { describe, expect, it } from 'vitest';
import {
  FULL_VIEW,
  MAX_SCALE,
  clampView,
  fitRegion,
  isFullView,
  pan,
  zoomAt,
  type PhotoRegion,
} from './photoView';

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

describe('photo view', () => {
  it('cannot pan at full view', () => {
    expect(pan(FULL_VIEW, 0.3, -0.3)).toEqual(FULL_VIEW);
  });

  it('keeps the photo covering the viewport and limits zoom', () => {
    expect(clampView({ scale: 2, x: 0.5, y: -5 })).toEqual({ scale: 2, x: 0, y: -1 });
    expect(clampView({ scale: 10, x: 0, y: 0 }).scale).toBe(MAX_SCALE);
    expect(clampView({ scale: 0.2, x: 0, y: 0 })).toEqual(FULL_VIEW);
  });

  it('zooms about a fixed point', () => {
    const view = zoomAt(FULL_VIEW, 2, 0.25, 0.75);
    // The photo point under (0.25, 0.75) stays under it.
    close((0.25 - view.x) / view.scale, 0.25);
    close((0.75 - view.y) / view.scale, 0.75);
    expect(view.scale).toBe(2);
  });

  it('zooming back out returns to the full view', () => {
    expect(isFullView(zoomAt(zoomAt(FULL_VIEW, 3, 0.9, 0.9), 1))).toBe(true);
  });

  it('pans within bounds when zoomed', () => {
    const zoomed = zoomAt(FULL_VIEW, 2);
    expect(pan(zoomed, -10, 0).x).toBe(-1);
    expect(pan(zoomed, 10, 0).x).toBe(0);
  });

  it('centres a region, clamped at the photo edge', () => {
    const middle: PhotoRegion = { id: 'm', label: 'M', note: '', x: 0.45, y: 0.45, width: 0.1, height: 0.1 };
    const view = fitRegion(middle);
    expect(view.scale).toBe(MAX_SCALE);
    close((0.5 - view.x) / view.scale, 0.5);
    close((0.5 - view.y) / view.scale, 0.5);

    const corner: PhotoRegion = { id: 'c', label: 'C', note: '', x: 0.7, y: 0.9, width: 0.3, height: 0.1 };
    const cornerView = fitRegion(corner);
    expect(cornerView.x).toBe(1 - cornerView.scale);
    expect(cornerView.y).toBe(1 - cornerView.scale);
  });
});
