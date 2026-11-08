interface WallClockProps {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** "HH:MM" (seconds ignored). */
  readonly time: string;
  readonly face?: string;
  readonly ink?: string;
}

/**
 * The reading-room wall clock, above position 7. It appears in every view of
 * that wall, so its hands always agree with the moment shown.
 */
export function WallClock({ cx, cy, r, time, face = '#d9d1bd', ink = '#26241f' }: WallClockProps) {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const minuteAngle = (m / 60) * 360;
  const hourAngle = (((h % 12) + m / 60) / 12) * 360;
  const hand = (angle: number, length: number, width: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(rad) * length}
        y2={cy + Math.sin(rad) * length}
        stroke={ink}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={face} stroke={ink} strokeWidth={1.5} />
      {Array.from({ length: 12 }, (_, i) => {
        const rad = (i / 12) * 2 * Math.PI;
        return (
          <line
            key={i}
            x1={cx + Math.sin(rad) * (r - 3)}
            y1={cy - Math.cos(rad) * (r - 3)}
            x2={cx + Math.sin(rad) * (r - 1)}
            y2={cy - Math.cos(rad) * (r - 1)}
            stroke={ink}
            strokeWidth={0.8}
          />
        );
      })}
      {hand(hourAngle, r * 0.5, 1.8)}
      {hand(minuteAngle, r * 0.8, 1.2)}
      <circle cx={cx} cy={cy} r={1.2} fill={ink} />
    </g>
  );
}

/** The clock's position on the far wall, shared by every view of position 7. */
export const READING_ROOM_CLOCK = { cx: 196, cy: 38, r: 14 } as const;
