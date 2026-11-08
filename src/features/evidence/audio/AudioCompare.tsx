import { useCallback, useId, useState } from 'react';
import { SegmentedControl } from '../../../components/SegmentedControl';
import {
  formatTime,
  matchDiscovery,
  pairSegments,
  spokenTime,
  visibleLines,
  type AudioSegment,
  type SegmentPair,
} from '../../../domain/audio';
import type { AudioEvidence } from '../../../domain/evidence';
import { useReelPlayer, type EngineFactory } from './useReelPlayer';

interface AudioCompareProps {
  readonly left: AudioEvidence;
  readonly right: AudioEvidence;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  readonly onDiscover: (discoveryId: string) => readonly string[];
  readonly createEngine?: EngineFactory | undefined;
}

type Side = 'left' | 'right';

/**
 * Two recordings compared segment by segment. One plays at a time (two
 * mixes at once would be noise): the player chooses which to listen to.
 * Both caption boxes follow the same segment, and the aligned list jumps
 * both recordings to a segment. Choosing a segment present in both is a
 * match, which can record a discovery.
 */
export function AudioCompare({ left, right, onDiscover, createEngine }: AudioCompareProps) {
  const id = useId();
  const [filed, setFiled] = useState<readonly string[]>([]);
  const [side, setSide] = useState<Side>('left');
  const [matched, setMatched] = useState<string | null>(null);

  const discover = useCallback(
    (discoveryId: string) => {
      const titles = onDiscover(discoveryId);
      if (titles.length > 0) setFiled((prev) => [...prev, ...titles]);
    },
    [onDiscover],
  );
  const leftPlayer = useReelPlayer(left, discover, createEngine);
  const rightPlayer = useReelPlayer(right, discover, createEngine);
  const active = side === 'left' ? leftPlayer : rightPlayer;
  const activeItem = side === 'left' ? left : right;
  const pairs = pairSegments(left.timeline, right.timeline);
  const currentPair = pairs.find((p) => (side === 'left' ? p.left : p.right)?.id === active.segment?.id);

  const listenTo = (next: Side) => {
    if (next === side) return;
    if (active.playing) active.togglePlay();
    setSide(next);
  };

  const examine = (pair: SegmentPair) => {
    if (active.playing) active.togglePlay();
    if (pair.left) leftPlayer.seek(pair.left.start);
    if (pair.right) rightPlayer.seek(pair.right.start);
    setMatched(pair.id);
    const discovery = matchDiscovery(pair);
    if (discovery) discover(discovery);
  };

  const captions = (title: string, segment: AudioSegment | undefined, filters: ReadonlySet<string>) => (
    <div className="captions">
      <p className="captions__segment">
        {title}
        {segment ? ` · ${segment.label}` : ' · No matching segment'}
      </p>
      {segment &&
        visibleLines(segment, filters).map((line) => (
          <p key={line.text} className={line.speaker ? 'captions__line' : 'captions__line is-sound'}>
            {line.speaker && <span className="captions__speaker">{line.speaker}: </span>}
            {line.text}
          </p>
        ))}
    </div>
  );

  return (
    <section className="player" aria-label={`Comparing ${left.title} with ${right.title}`}>
      <SegmentedControl
        legend="Listening to"
        options={[
          { value: 'left', label: left.title },
          { value: 'right', label: right.title },
        ]}
        value={side}
        onChange={listenTo}
      />

      <div className="player__transport">
        <button
          type="button"
          className="player__play"
          onClick={active.togglePlay}
          aria-label={active.playing ? `Pause ${activeItem.title}` : `Play ${activeItem.title}`}
        >
          <span aria-hidden="true" className="player__icon">
            {active.playing ? '❚❚' : '▶'}
          </span>
        </button>
        <p className="player__time">
          {formatTime(active.position)} / {formatTime(active.duration)}
        </p>
      </div>
      <label htmlFor={`${id}-scrub`} className="visually-hidden">
        Position in {activeItem.title}
      </label>
      <input
        id={`${id}-scrub`}
        className="player__scrub"
        type="range"
        min={0}
        max={active.duration}
        step={0.5}
        value={active.position}
        aria-valuetext={`${spokenTime(active.position)} of ${spokenTime(active.duration)}`}
        onChange={(event) => active.seek(Number(event.target.value))}
      />

      {activeItem.filters.length > 0 && (
        <fieldset className="filters">
          <legend className="segmented__legend">Filters ({activeItem.title})</legend>
          {activeItem.filters.map((filter) => (
            <label key={filter.id} className="switch">
              <input
                type="checkbox"
                role="switch"
                checked={active.activeFilters.has(filter.id)}
                disabled={activeItem.fixedFilters.includes(filter.id)}
                onChange={(event) => active.setFilter(filter.id, event.target.checked)}
              />
              <span className="switch__text">
                <span className="switch__label">{filter.label}</span>
                <span className="switch__hint">{filter.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="compare" aria-live="polite">
        {captions(left.title, side === 'left' ? leftPlayer.segment : currentPair?.left, leftPlayer.activeFilters)}
        {captions(right.title, side === 'right' ? rightPlayer.segment : currentPair?.right, rightPlayer.activeFilters)}
      </div>

      {filed.length > 0 && (
        <p className="notice notice--filed" role="status">
          Added to the case files: {filed.join(', ')}.
        </p>
      )}

      <section aria-labelledby={`${id}-segments`}>
        <h2 id={`${id}-segments`} className="panel__title">
          Segments in both recordings
        </h2>
        <ol className="segments">
          {pairs.map((pair) => (
            <li key={pair.id}>
              <button
                type="button"
                className="segments__button"
                aria-current={matched === pair.id ? 'true' : undefined}
                onClick={() => examine(pair)}
              >
                <span>{pair.label}</span>
                <span className="segments__time">
                  {pair.left && pair.right ? 'Both' : pair.left ? left.title : right.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
