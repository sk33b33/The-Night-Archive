import { useEffect, useId, useState } from 'react';
import type { CctvEvidence } from '../../../domain/evidence';
import { FULL_VIEW, type PhotoRegion, type PhotoView } from '../../../domain/photoView';
import { prefersReducedMotion } from '../../../services/preferences/motion';
import { PhotoViewer } from '../photo/PhotoViewer';
import { CCTV_ARTWORK } from './artwork';

interface CctvViewerProps {
  readonly item: CctvEvidence;
  /** Called when the player examines a region in a frame. */
  readonly onExamine?: (region: PhotoRegion) => void;
}

const FRAME_INTERVAL_MS = 700;

/**
 * CCTV footage as a sequence of frames: step, scrub, or play; inspect any
 * frame with zoom, pan, and regions. Zoom is kept while stepping so the
 * same spot can be watched across frames. Under reduced motion, frames are
 * stepped by the player only.
 */
export function CctvViewer({ item, onExamine }: CctvViewerProps) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<PhotoView>(FULL_VIEW);
  const [reduced] = useState(prefersReducedMotion);
  const last = item.frames.length - 1;
  const frame = item.frames[index];
  const Artwork = CCTV_ARTWORK[item.artwork];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, last]);

  if (!frame || !Artwork) {
    return (
      <p className="notice notice--warning" role="alert">
        This footage could not be displayed.
      </p>
    );
  }

  const go = (next: number) => {
    setPlaying(false);
    setIndex(Math.min(Math.max(next, 0), last));
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Playing from the last frame starts again from the first.
    if (index >= last) setIndex(0);
    setPlaying(true);
  };

  return (
    <section className="cctv" aria-label={`${item.title} footage`}>
      <div className="print print--dark">
        <PhotoViewer
          // Remount per frame so each frame's regions and description apply,
          // while the shared view keeps the zoom.
          key={index}
          regions={frame.regions}
          view={view}
          onViewChange={setView}
          label={`Frame ${index + 1} of ${item.frames.length}, ${frame.time}`}
          {...(onExamine ? { onExamine } : {})}
        >
          <Artwork scene={frame.scene} time={frame.time} alt={frame.description} />
        </PhotoViewer>
      </div>

      <div className="cctv__transport">
        <button
          type="button"
          className="icon-button icon-button--dark"
          aria-label="Previous frame"
          aria-disabled={index === 0 || undefined}
          onClick={() => go(index - 1)}
        >
          ◀
        </button>
        {reduced ? (
          <p className="cctv__note">
            Playback is off because reduced motion is on. Step through the frames instead.
          </p>
        ) : (
          <button type="button" className="btn btn--secondary cctv__play" onClick={togglePlay}>
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
        <button
          type="button"
          className="icon-button icon-button--dark"
          aria-label="Next frame"
          aria-disabled={index === last || undefined}
          onClick={() => go(index + 1)}
        >
          ▶
        </button>
      </div>

      <label htmlFor={`${id}-scrub`} className="visually-hidden">
        Frame
      </label>
      <input
        id={`${id}-scrub`}
        className="player__scrub"
        type="range"
        min={0}
        max={last}
        step={1}
        value={index}
        aria-valuetext={`Frame ${index + 1} of ${item.frames.length}, ${frame.time}`}
        onChange={(event) => go(Number(event.target.value))}
      />
      <p className="cctv__time" aria-live="polite">
        {frame.time} · frame {index + 1} of {item.frames.length}
      </p>

      <section aria-labelledby={`${id}-frames`}>
        <h2 id={`${id}-frames`} className="panel__title">
          Frames
        </h2>
        <ol className="cctv__frames">
          {item.frames.map((f, i) => (
            <li key={f.time}>
              <button
                type="button"
                className="segments__button"
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <span className="segments__time">{f.time}</span>
                {f.regions.length > 0 && <span className="cctv__marked">Marked</span>}
              </button>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
