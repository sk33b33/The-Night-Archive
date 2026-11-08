import { useId, useState } from 'react';
import type { PhotoEvidence } from '../../../domain/evidence';
import { FULL_VIEW, clampView, fitRegion, type PhotoRegion, type PhotoView } from '../../../domain/photoView';
import { PHOTO_ARTWORK } from './artwork';
import { PhotoViewer } from './PhotoViewer';

interface PhotoCompareProps {
  readonly left: PhotoEvidence;
  readonly right: PhotoEvidence;
  /** Called with a discovery ID when a region is matched in both photographs. */
  readonly onMatch: (discoveryId: string) => void;
}

interface RegionPair {
  readonly id: string;
  readonly label: string;
  readonly left?: PhotoRegion | undefined;
  readonly right?: PhotoRegion | undefined;
}

/** Regions from both photographs, paired by ID, in left-then-right order. */
function pairRegions(left: PhotoEvidence, right: PhotoEvidence): RegionPair[] {
  const pairs = new Map<string, RegionPair>();
  for (const r of left.regions) pairs.set(r.id, { id: r.id, label: r.label, left: r });
  for (const r of right.regions) {
    const existing = pairs.get(r.id);
    pairs.set(r.id, existing ? { ...existing, right: r } : { id: r.id, label: r.label, right: r });
  }
  return [...pairs.values()];
}

/**
 * Two photographs side by side (stacked on narrow screens). With "Keep
 * views in step" on, zooming or panning either moves both by the same
 * amount. Choosing a region found in both photographs zooms each to its
 * own copy of that region: a match.
 */
export function PhotoCompare({ left, right, onMatch }: PhotoCompareProps) {
  const id = useId();
  const [synced, setSynced] = useState(true);
  const [leftView, setLeftView] = useState<PhotoView>(FULL_VIEW);
  const [rightView, setRightView] = useState<PhotoView>(FULL_VIEW);
  const [active, setActive] = useState<RegionPair | null>(null);
  const pairs = pairRegions(left, right);

  /**
   * In step: apply the same change (zoom ratio and pan) to both photographs,
   * so each keeps its own framing. This matters when a matched region sits
   * in a different place in each photograph.
   */
  const moveBoth = (from: PhotoView, to: PhotoView) => {
    const ratio = to.scale / from.scale;
    const apply = (v: PhotoView) =>
      clampView({ scale: v.scale * ratio, x: v.x + (to.x - from.x), y: v.y + (to.y - from.y) });
    setLeftView(apply);
    setRightView(apply);
  };

  const examine = (pair: RegionPair) => {
    setActive(pair);
    const leftFit = pair.left ? fitRegion(pair.left) : FULL_VIEW;
    const rightFit = pair.right ? fitRegion(pair.right) : FULL_VIEW;
    setLeftView(leftFit);
    setRightView(rightFit);
    const discovery = pair.left && pair.right ? (pair.left.revealsOnMatch ?? pair.right.revealsOnMatch) : undefined;
    if (discovery) onMatch(discovery);
  };

  const side = (item: PhotoEvidence, view: PhotoView, setView: (v: PhotoView) => void, region?: PhotoRegion) => {
    const Artwork = PHOTO_ARTWORK[item.artwork];
    return (
      <div className="compare__column">
        <p className="compare__label">{item.title}</p>
        <div className="print">
          {Artwork ? (
            <PhotoViewer
              regions={item.regions}
              view={view}
              onViewChange={(next) => (synced ? moveBoth(view, next) : setView(next))}
              activeRegionId={region?.id ?? null}
              hideRegionList
              label={`Photograph: ${item.title}`}
            >
              <Artwork alt={item.alt} />
            </PhotoViewer>
          ) : (
            <p className="notice notice--warning" role="alert">
              This photograph could not be displayed.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <label className="switch switch--compact">
        <input type="checkbox" role="switch" checked={synced} onChange={(e) => setSynced(e.target.checked)} />
        <span className="switch__text">
          <span className="switch__label">Keep views in step</span>
          <span className="switch__hint">Zoom and move both photographs together.</span>
        </span>
      </label>
      <div className="compare">
        {side(left, leftView, setLeftView, active?.left)}
        {side(right, rightView, setRightView, active?.right)}
      </div>
      <section className="panel" aria-labelledby={`${id}-regions`}>
        <h2 id={`${id}-regions`} className="panel__title">
          Regions in both photographs
        </h2>
        <ul className="segments">
          {pairs.map((pair) => (
            <li key={pair.id}>
              <button
                type="button"
                className="segments__button"
                aria-current={active?.id === pair.id ? 'true' : undefined}
                onClick={() => examine(pair)}
              >
                <span>{pair.label}</span>
                <span className="segments__time">
                  {pair.left && pair.right ? 'Both' : pair.left ? left.title : right.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="photo-compare__notes" role="status">
          {active ? (
            <>
              <p>
                <strong>{left.title}:</strong> {active.left?.note ?? 'Not in this photograph.'}
              </p>
              <p>
                <strong>{right.title}:</strong> {active.right?.note ?? 'Not in this photograph.'}
              </p>
            </>
          ) : (
            <p className="prose">Choose a region to examine it in both photographs.</p>
          )}
        </div>
      </section>
    </>
  );
}
