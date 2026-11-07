import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  FULL_VIEW,
  MAX_SCALE,
  MIN_SCALE,
  PAN_STEP,
  ZOOM_STEP,
  fitRegion,
  pan,
  zoomAt,
  type PhotoRegion,
  type PhotoView,
} from '../../../domain/photoView';

interface PhotoViewerProps {
  /** The photograph itself; it must fill a 4:3 box. */
  readonly children: ReactNode;
  readonly regions: readonly PhotoRegion[];
  /** Called when the player examines a region from the list. */
  readonly onExamine?: (region: PhotoRegion) => void;
}

interface Gesture {
  readonly startView: PhotoView;
  readonly startDistance: number;
  readonly start: { readonly x: number; readonly y: number };
}

/**
 * Zoom, pan, and authored regions for a photograph. Works with touch
 * (drag, pinch, double-tap), mouse (drag, double-click, Ctrl+wheel), and
 * keyboard (+/−/0 and arrows). Every action also has a visible button.
 */
export function PhotoViewer({ children, regions, onExamine }: PhotoViewerProps) {
  const id = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<PhotoView>(FULL_VIEW);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [showRegions, setShowRegions] = useState(true);
  const [gesturing, setGesturing] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  /** Pointer position as a fraction of the viewport. */
  const toFraction = (clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0.5, y: 0.5 };
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  };

  const update = (next: PhotoView) => {
    setView(next);
    if (next.scale === MIN_SCALE) setActiveRegion(null);
  };

  const beginGesture = () => {
    const points = [...pointers.current.values()];
    const [a, b] = points;
    if (!a) return;
    const mid = b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a;
    gesture.current = {
      startView: viewRef.current,
      startDistance: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      start: mid,
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Unsupported: the gesture still works while over the photo.
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setGesturing(true);
    beginGesture();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const [a, b] = [...pointers.current.values()];
    if (!a) return;
    const g = gesture.current;
    if (b && g.startDistance > 0) {
      const mid = toFraction((a.x + b.x) / 2, (a.y + b.y) / 2);
      const ratio = Math.hypot(a.x - b.x, a.y - b.y) / g.startDistance;
      update(zoomAt(g.startView, g.startView.scale * ratio, mid.x, mid.y));
    } else {
      update(pan(g.startView, (a.x - g.start.x) / rect.width, (a.y - g.start.y) / rect.height));
    }
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setGesturing(false);
    } else {
      beginGesture();
    }
  };

  // Ctrl+wheel (also what trackpad pinch sends) zooms; a plain wheel still scrolls the page.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY / 200);
      setView((v) =>
        zoomAt(v, v.scale * factor, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height),
      );
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => PhotoView> = {
      '+': () => zoomAt(view, view.scale * ZOOM_STEP),
      '=': () => zoomAt(view, view.scale * ZOOM_STEP),
      '-': () => zoomAt(view, view.scale / ZOOM_STEP),
      '0': () => FULL_VIEW,
      ArrowLeft: () => pan(view, PAN_STEP, 0),
      ArrowRight: () => pan(view, -PAN_STEP, 0),
      ArrowUp: () => pan(view, 0, PAN_STEP),
      ArrowDown: () => pan(view, 0, -PAN_STEP),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    update(action());
  };

  const atMin = view.scale <= MIN_SCALE;
  const atMax = view.scale >= MAX_SCALE;
  const active = regions.find((r) => r.id === activeRegion);
  const layerStyle = {
    transform: `translate(${view.x * 100}%, ${view.y * 100}%) scale(${view.scale})`,
    '--photo-scale': view.scale,
  } as CSSProperties;

  return (
    <div className="photo-viewer">
      <p id={`${id}-help`} className="visually-hidden">
        Plus and minus zoom, arrow keys move around the photograph, and 0 shows the whole photograph.
      </p>
      <div
        ref={viewportRef}
        className="photo-viewer__viewport"
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable photograph"
        aria-label="Photograph"
        aria-describedby={`${id}-help`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={(event) => {
          const p = toFraction(event.clientX, event.clientY);
          update(atMax ? FULL_VIEW : zoomAt(view, view.scale * 2, p.x, p.y));
        }}
        onKeyDown={onKeyDown}
      >
        <div className={gesturing ? 'photo-viewer__layer is-gesturing' : 'photo-viewer__layer'} style={layerStyle}>
          {children}
          {showRegions &&
            regions.map((region) => (
              <span
                key={region.id}
                className={region.id === activeRegion ? 'photo-region is-active' : 'photo-region'}
                style={{
                  left: `${region.x * 100}%`,
                  top: `${region.y * 100}%`,
                  width: `${region.width * 100}%`,
                  height: `${region.height * 100}%`,
                }}
                aria-hidden="true"
              />
            ))}
        </div>
      </div>

      <div className="photo-viewer__toolbar">
        <button
          type="button"
          className="icon-button"
          onClick={() => update(zoomAt(view, view.scale / ZOOM_STEP))}
          disabled={atMin}
          aria-label="Zoom out"
          aria-describedby={`${id}-zoom`}
        >
          −
        </button>
        <p id={`${id}-zoom`} className="photo-viewer__zoom" aria-live="polite">
          {atMin ? 'Full view' : atMax ? `${MAX_SCALE}× (maximum)` : `${view.scale.toFixed(1)}×`}
        </p>
        <button
          type="button"
          className="icon-button"
          onClick={() => update(zoomAt(view, view.scale * ZOOM_STEP))}
          disabled={atMax}
          aria-label="Zoom in"
          aria-describedby={`${id}-zoom`}
        >
          +
        </button>
        <button
          type="button"
          className="link-button"
          onClick={() => update(FULL_VIEW)}
          disabled={atMin}
          aria-describedby={`${id}-zoom`}
        >
          Reset view
        </button>
      </div>

      {regions.length > 0 && (
        <section className="photo-regions" aria-labelledby={`${id}-regions`}>
          <div className="photo-regions__head">
            <h2 id={`${id}-regions`} className="panel__title">
              Marked regions
            </h2>
            <label className="photo-regions__toggle">
              <input
                type="checkbox"
                checked={showRegions}
                onChange={(event) => setShowRegions(event.target.checked)}
              />
              Show outlines
            </label>
          </div>
          <ul className="segments">
            {regions.map((region) => (
              <li key={region.id}>
                <button
                  type="button"
                  className="segments__button"
                  aria-current={region.id === activeRegion ? 'true' : undefined}
                  onClick={() => {
                    setActiveRegion(region.id);
                    setView(fitRegion(region));
                    onExamine?.(region);
                  }}
                >
                  {region.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="photo-regions__note" role="status">
            {active ? active.note : 'Choose a region to examine it closely.'}
          </p>
        </section>
      )}
    </div>
  );
}
