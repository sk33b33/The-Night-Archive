import { useId, useRef, useState } from 'react';
import {
  eventsInOrder,
  minutesOf,
  type EvidenceId,
  type EvidenceItem,
  type TimelineEvent,
  type TimelineEvidence,
} from '../../../domain/evidence';

interface TimelineViewerProps {
  readonly item: TimelineEvidence;
  /** Evidence the player can open, to follow an event to its source. */
  readonly available: readonly EvidenceItem[];
  readonly onOpenEvidence: (id: EvidenceId) => void;
}

const keyOf = (e: TimelineEvent) => `${e.track}@${e.time}@${e.text}`;

/** Axis ticks every half hour within the range. */
function ticks(from: number, to: number): number[] {
  const first = Math.ceil(from / 30) * 30;
  const out: number[] = [];
  for (let t = first; t <= to; t += 30) out.push(t);
  return out;
}

const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Several records on one time axis. The chart is a picture of the list
 * below it (mouse and touch can pick an event there too); the list, in time
 * order and filterable by source, is the control and the accessible view.
 */
export function TimelineViewer({ item, available, onOpenEvidence }: TimelineViewerProps) {
  const id = useId();
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const from = minutesOf(item.range.from);
  const to = minutesOf(item.range.to);
  const at = (time: string) => `${((minutesOf(time) - from) / (to - from)) * 100}%`;
  const tracks = item.tracks.filter((t) => !hidden.has(t.id));
  const events = eventsInOrder(item).filter((e) => !hidden.has(e.track));
  const trackOf = (trackId: string) => item.tracks.find((t) => t.id === trackId);
  const titleOf = (evidenceId: EvidenceId) => available.find((e) => e.id === evidenceId)?.title;

  const toggle = (trackId: string, show: boolean) => {
    const next = new Set(hidden);
    if (show) next.delete(trackId);
    else next.add(trackId);
    setHidden(next);
  };

  const pick = (event: TimelineEvent) => {
    const key = keyOf(event);
    setSelected(key);
    const rows = Array.from(listRef.current?.children ?? []) as HTMLElement[];
    rows.find((row) => row.dataset.event === key)?.focus();
  };

  return (
    <section className="timeline" aria-label={item.title}>
      <fieldset className="timeline__filters">
        <legend className="panel__title">Sources</legend>
        <div className="citations__list">
          {item.tracks.map((track) => (
            <label key={track.id} className="citation">
              <input type="checkbox" checked={!hidden.has(track.id)} onChange={(e) => toggle(track.id, e.target.checked)} />
              <span>{track.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {tracks.length > 0 && (
        <div className="print print--dark timeline__chart" aria-hidden="true">
          <div className="timeline__axis">
            {ticks(from, to).map((t) => (
              <span key={t} className="timeline__tick" style={{ left: at(clock(t)) }}>
                {clock(t)}
              </span>
            ))}
          </div>
          {tracks.map((track) => (
            <div key={track.id} className="timeline__row">
              <span className="timeline__label">{track.label}</span>
              <span className="timeline__bar">
                {ticks(from, to).map((t) => (
                  <span key={t} className="timeline__gridline" style={{ left: at(clock(t)) }} />
                ))}
                {item.events
                  .filter((e) => e.track === track.id)
                  .map((e) => (
                    <span
                      key={keyOf(e)}
                      className={`timeline__marker${selected === keyOf(e) ? ' is-selected' : ''}`}
                      style={{ left: at(e.time) }}
                      onClick={() => pick(e)}
                    />
                  ))}
              </span>
            </div>
          ))}
        </div>
      )}

      <section aria-labelledby={`${id}-events`}>
        <h2 id={`${id}-events`} className="panel__title">
          In time order
        </h2>
        {events.length === 0 ? (
          <p className="prose">No sources are shown. Choose at least one source to see what it records.</p>
        ) : (
          <ol className="timeline__list" ref={listRef}>
            {events.map((e) => {
              const track = trackOf(e.track);
              const source = track?.source;
              const title = source && titleOf(source);
              return (
                <li
                  key={keyOf(e)}
                  data-event={keyOf(e)}
                  tabIndex={-1}
                  className={`timeline__event${selected === keyOf(e) ? ' is-selected' : ''}`}
                >
                  <span className="timeline__time">{e.time}</span>
                  <span className="timeline__body">
                    <span className="timeline__track">{track?.label}</span>
                    <span>{e.text}</span>
                    {source && title ? (
                      <button type="button" className="link-button" onClick={() => onOpenEvidence(source)}>
                        Source: {title}
                      </button>
                    ) : (
                      <span className="timeline__nosource">
                        {source ? 'Source: a record not in your case files.' : 'Source: no record on file.'}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
}
