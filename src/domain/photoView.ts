/**
 * Photo viewport maths. Positions are fractions of the viewport size, so the
 * rules are independent of screen size. The photo layer is drawn with
 * `translate(x, y) scale(scale)` from its top-left corner. Pure; no React.
 */
export interface PhotoView {
  readonly scale: number;
  /** Offset of the photo's top-left corner, as a fraction of the viewport. */
  readonly x: number;
  readonly y: number;
}

/** A marked area of a photograph, in fractions of its width and height. */
export interface PhotoRegion {
  readonly id: string;
  readonly label: string;
  /** What can be seen there. Observation only, never interpretation. */
  readonly note: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Discovery recorded when the player examines this region. */
  readonly revealsDiscovery?: string;
}

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
export const ZOOM_STEP = 1.5;
export const PAN_STEP = 0.1;

export const FULL_VIEW: PhotoView = { scale: 1, x: 0, y: 0 };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Keeps the photo covering the viewport: no empty margins when zoomed. */
export function clampView(view: PhotoView): PhotoView {
  const scale = clamp(view.scale, MIN_SCALE, MAX_SCALE);
  return {
    scale,
    x: clamp(view.x, 1 - scale, 0),
    y: clamp(view.y, 1 - scale, 0),
  };
}

/** Zooms to `scale`, keeping the point (px, py) of the viewport fixed. */
export function zoomAt(view: PhotoView, scale: number, px = 0.5, py = 0.5): PhotoView {
  const next = clamp(scale, MIN_SCALE, MAX_SCALE);
  const cx = (px - view.x) / view.scale;
  const cy = (py - view.y) / view.scale;
  return clampView({ scale: next, x: px - cx * next, y: py - cy * next });
}

export function pan(view: PhotoView, dx: number, dy: number): PhotoView {
  return clampView({ ...view, x: view.x + dx, y: view.y + dy });
}

/** Centres a region and zooms so it fills most of the viewport. */
export function fitRegion(region: PhotoRegion, fill = 0.7): PhotoView {
  const scale = clamp(fill / Math.max(region.width, region.height), MIN_SCALE, MAX_SCALE);
  const cx = region.x + region.width / 2;
  const cy = region.y + region.height / 2;
  return clampView({ scale, x: 0.5 - cx * scale, y: 0.5 - cy * scale });
}

export function isFullView(view: PhotoView): boolean {
  return view.scale === MIN_SCALE;
}
