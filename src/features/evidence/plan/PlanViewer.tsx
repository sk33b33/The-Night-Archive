import { useId, useState } from 'react';
import { SegmentedControl } from '../../../components/SegmentedControl';
import type { EvidenceId, EvidenceItem, PlanEvidence, PlanRoom } from '../../../domain/evidence';

interface PlanViewerProps {
  readonly item: PlanEvidence;
  /** Evidence the player can open, to follow an entry to its source. */
  readonly available: readonly EvidenceItem[];
  readonly onOpenEvidence: (id: EvidenceId) => void;
}

/** Centre of a polygon's bounding box, for its label. */
function centre(points: string): { x: number; y: number } {
  const xy = points.split(/\s+/).map((p) => p.split(',').map(Number));
  const xs = xy.map(([x = 0]) => x);
  const ys = xy.map(([, y = 0]) => y);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

/**
 * A floor plan as a view of the records: choose a time, see which rooms a
 * record speaks about, and read exactly what each record says. The drawing
 * is decorative; the time selector and room list are the controls.
 */
export function PlanViewer({ item, available, onOpenEvidence }: PlanViewerProps) {
  const id = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const step = item.steps[stepIndex] ?? item.steps[0];
  const rooms: readonly PlanRoom[] = [...item.rooms, ...(step?.extraRooms ?? [])];
  const [roomId, setRoomId] = useState<string | null>(null);
  if (!step) return null;

  const entriesFor = (room: string) => step.entries.filter((e) => e.room === room);
  const selected = rooms.find((r) => r.id === roomId);
  const titleOf = (evidenceId: EvidenceId) => available.find((e) => e.id === evidenceId)?.title;

  return (
    <section className="plan" aria-label={`${item.title}`}>
      <SegmentedControl
        legend="Time"
        options={item.steps.map((s, i) => ({ value: String(i), label: s.label ?? s.time }))}
        value={String(stepIndex)}
        onChange={(v) => setStepIndex(Number(v))}
      />

      <div className="print print--dark">
        <svg className="plan__drawing" viewBox="0 0 400 300" aria-hidden="true">
          <rect width="400" height="300" fill="#11161a" />
          {rooms.map((room) => {
            const recorded = entriesFor(room.id).length > 0;
            const c = room.labelAt ?? centre(room.points);
            return (
              <g
                key={room.id}
                className={['plan__room', recorded ? 'has-record' : '', room.sealed ? 'is-sealed' : '', room.id === roomId ? 'is-selected' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setRoomId(room.id)}
              >
                <polygon points={room.points} />
                <text x={c.x} y={c.y} textAnchor="middle">
                  {room.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="plan__note">
        Rooms are lit only where a record speaks about them at {step.time}. An unlit room means no record, not nobody.
      </p>

      <section aria-labelledby={`${id}-rooms`}>
        <h2 id={`${id}-rooms`} className="panel__title">
          Rooms at {step.label ?? step.time}
        </h2>
        <ul className="segments">
          {rooms.map((room) => {
            const count = entriesFor(room.id).length;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  className="segments__button"
                  aria-current={room.id === roomId ? 'true' : undefined}
                  onClick={() => setRoomId(room.id)}
                >
                  <span>
                    {room.label}
                    {room.sealed ? ' (sealed)' : ''}
                  </span>
                  <span className="segments__time">
                    {count === 0 ? 'No record' : `${count} ${count === 1 ? 'record' : 'records'}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="panel plan__entries" role="status">
        {selected ? (
          <>
            <h3 className="plan__room-title">
              {selected.label} · {step.time}
            </h3>
            {entriesFor(selected.id).length === 0 ? (
              <p className="prose">No record speaks about this room at {step.time}.</p>
            ) : (
              <ul className="plan__entry-list">
                {entriesFor(selected.id).map((entry) => {
                  const title = titleOf(entry.source);
                  return (
                    <li key={`${entry.source}-${entry.text}`}>
                      <p>{entry.text}</p>
                      {title ? (
                        <button type="button" className="link-button" onClick={() => onOpenEvidence(entry.source)}>
                          Source: {title}
                        </button>
                      ) : (
                        <p className="prose">Source: a record not in your case files.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <p className="prose">Choose a room to read what the records say about it.</p>
        )}
      </div>
    </section>
  );
}
