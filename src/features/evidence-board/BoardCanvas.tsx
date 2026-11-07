import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  BOARD_SIZE,
  CARD_SIZE,
  RELATIONS,
  cardCentre,
  edgePoint,
  linkKey,
  type BoardLink,
  type BoardPosition,
  type LinkEvaluation,
} from '../../domain/board';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';

interface BoardCanvasProps {
  readonly evidence: readonly EvidenceItem[];
  readonly positionOf: (id: EvidenceId) => BoardPosition;
  readonly links: readonly BoardLink[];
  readonly evaluate: (link: BoardLink) => LinkEvaluation;
  readonly selected: readonly EvidenceId[];
  readonly onMove: (id: EvidenceId, position: BoardPosition) => void;
  readonly onSelect: (id: EvidenceId) => void;
}

interface Drag {
  readonly id: EvidenceId;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly origin: BoardPosition;
  readonly current: BoardPosition;
  readonly moved: boolean;
}

const KEY_STEP = 20;
const DRAG_THRESHOLD = 4;

/**
 * Spatial board. Cards move by pointer (mouse, touch, pen) or arrow keys;
 * activating a card selects it for a new connection. Lines are SVG.
 */
export function BoardCanvas({
  evidence,
  positionOf,
  links,
  evaluate,
  selected,
  onMove,
  onSelect,
}: BoardCanvasProps) {
  const instructionsId = useId();
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);

  const position = (id: EvidenceId) =>
    drag && drag.id === id ? drag.current : positionOf(id);
  const titleOf = new Map(evidence.map((e) => [e.id, e.title]));

  const update = (next: Drag | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const onPointerDown = (id: EvidenceId) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    // Keep receiving moves when the pointer leaves the card mid-drag.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Not supported (e.g. some test DOMs); dragging still works over the card.
    }
    const origin = positionOf(id);
    update({
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      current: origin,
      moved: false,
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    const moved = current.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD;
    update({ ...current, moved, current: { x: current.origin.x + dx, y: current.origin.y + dy } });
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    update(null);
    if (current.moved) onMove(current.id, current.current);
    else onSelect(current.id);
  };

  const onKeyDown = (id: EvidenceId) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const step = delta[event.key];
    if (step) {
      event.preventDefault();
      const p = positionOf(id);
      onMove(id, { x: p.x + step[0], y: p.y + step[1] });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="board-scroll">
      <p id={instructionsId} className="visually-hidden">
        Arrow keys move the card. Enter selects it for a new connection.
      </p>
      <div className="board" style={{ width: BOARD_SIZE.width, height: BOARD_SIZE.height }}>
        <svg
          className="board__lines"
          width={BOARD_SIZE.width}
          height={BOARD_SIZE.height}
          aria-hidden="true"
        >
          <defs>
            {(['supported', 'hypothesis'] as const).map((status) => (
              <marker
                key={status}
                id={`arrow-${status}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" className={`board__arrow is-${status}`} />
              </marker>
            ))}
          </defs>
          {links.map((link) => {
            if (!titleOf.has(link.from) || !titleOf.has(link.to)) return null;
            const a = cardCentre(position(link.from));
            const b = cardCentre(position(link.to));
            const start = edgePoint(a, b);
            const end = edgePoint(b, a);
            const { status } = evaluate(link);
            const label = RELATIONS[link.relation].label;
            const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
            const labelWidth = label.length * 7 + 16;
            return (
              <g key={linkKey(link)} className={`board__link is-${status}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  markerEnd={RELATIONS[link.relation].directed ? `url(#arrow-${status})` : undefined}
                />
                <rect
                  x={mid.x - labelWidth / 2}
                  y={mid.y - 11}
                  width={labelWidth}
                  height={22}
                  rx={11}
                />
                <text x={mid.x} y={mid.y + 4} textAnchor="middle">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {evidence.map((item) => {
          const p = position(item.id);
          const selectedIndex = selected.indexOf(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={[
                'board-card',
                drag?.id === item.id && drag.moved ? 'is-dragging' : '',
                selectedIndex === 0 ? 'is-from' : '',
                selectedIndex === 1 ? 'is-to' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                width: CARD_SIZE.width,
                height: CARD_SIZE.height,
                transform: `translate(${p.x}px, ${p.y}px)`,
              }}
              aria-pressed={selectedIndex >= 0}
              aria-describedby={instructionsId}
              onPointerDown={onPointerDown(item.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => update(null)}
              onKeyDown={onKeyDown(item.id)}
            >
              <span className={`kind kind--${item.kind}`}>{item.kind === 'audio' ? 'Audio' : 'Document'}</span>
              <span className="visually-hidden">:</span>{' '}
              <span className="board-card__title">{item.title}</span>
              <span className="visually-hidden">,</span>{' '}
              <span className="board-card__reference">{item.reference}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
