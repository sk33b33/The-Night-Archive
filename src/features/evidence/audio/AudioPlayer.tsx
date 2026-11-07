import { useCallback, useId, useState } from 'react';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { formatTime, spokenTime, visibleLines } from '../../../domain/audio';
import type { AudioEvidence } from '../../../domain/evidence';
import { PLAYBACK_RATES } from '../../../domain/playback';
import { useReelPlayer, type EngineFactory } from './useReelPlayer';

interface AudioPlayerProps {
  readonly item: AudioEvidence;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  readonly onDiscover: (discoveryId: string) => readonly string[];
  readonly createEngine?: EngineFactory | undefined;
}

const RATE_OPTIONS = PLAYBACK_RATES.map((rate) => ({ value: rate, label: `${rate}×` }));

export function AudioPlayer({ item, onDiscover, createEngine }: AudioPlayerProps) {
  const [filed, setFiled] = useState<readonly string[]>([]);
  const handleDiscover = useCallback(
    (discoveryId: string) => {
      const titles = onDiscover(discoveryId);
      if (titles.length > 0) setFiled((prev) => [...prev, ...titles]);
    },
    [onDiscover],
  );
  const player = useReelPlayer(item, handleDiscover, createEngine);
  const sliderId = useId();
  const { timeline } = item;
  const lines = player.segment ? visibleLines(player.segment, player.activeFilters) : [];

  return (
    <section className="player" aria-label={`${item.title} player`}>
      <div className="player__transport">
        <button
          type="button"
          className="player__play"
          onClick={player.togglePlay}
          aria-label={player.playing ? 'Pause' : 'Play'}
        >
          <span aria-hidden="true" className="player__icon">
            {player.playing ? '❚❚' : '▶'}
          </span>
        </button>
        <p className="player__time">
          <span className="visually-hidden">Position </span>
          {formatTime(player.position)} <span aria-hidden="true">/</span>
          <span className="visually-hidden"> of </span> {formatTime(player.duration)}
        </p>
      </div>

      <label htmlFor={sliderId} className="visually-hidden">
        Position
      </label>
      <input
        id={sliderId}
        className="player__scrub"
        type="range"
        min={0}
        max={player.duration}
        step={0.5}
        value={player.position}
        aria-valuetext={`${spokenTime(player.position)} of ${spokenTime(player.duration)}`}
        onChange={(event) => player.seek(Number(event.target.value))}
      />

      {!player.soundAvailable && (
        <p className="notice notice--warning" role="status">
          Sound is not available on this device. Captions and segments still work.
        </p>
      )}

      <div className="captions" aria-live="polite">
        <p className="captions__segment">{player.segment?.label}</p>
        {lines.map((line) => (
          <p key={line.text} className={line.speaker ? 'captions__line' : 'captions__line is-sound'}>
            {line.speaker && <span className="captions__speaker">{line.speaker}: </span>}
            {line.text}
          </p>
        ))}
      </div>

      {filed.length > 0 && (
        <p className="notice notice--filed" role="status">
          Added to the case files: {filed.join(', ')}.
        </p>
      )}

      <div className="player__controls">
        <SegmentedControl
          legend="Speed"
          options={RATE_OPTIONS}
          value={player.rate}
          onChange={player.setRate}
        />

        {item.filters.length > 0 && (
          <fieldset className="filters">
            <legend className="segmented__legend">Filters</legend>
            {item.filters.map((filter) => {
              const fixed = item.fixedFilters.includes(filter.id);
              return (
                <label key={filter.id} className="switch">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={player.activeFilters.has(filter.id)}
                    disabled={fixed}
                    onChange={(event) => player.setFilter(filter.id, event.target.checked)}
                  />
                  <span className="switch__text">
                    <span className="switch__label">{filter.label}</span>
                    <span className="switch__hint">
                      {fixed ? 'Applied permanently to this copy.' : filter.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}
      </div>

      <section aria-labelledby={`${sliderId}-segments`}>
        <h2 id={`${sliderId}-segments`} className="panel__title">
          Segments
        </h2>
        <ol className="segments">
          {timeline.segments.map((segment) => {
            const current = segment.id === player.segment?.id;
            return (
              <li key={segment.id}>
                <button
                  type="button"
                  className="segments__button"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => player.seek(segment.start)}
                >
                  <span className="segments__time">{formatTime(segment.start)}</span>
                  <span>{segment.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </section>
  );
}
