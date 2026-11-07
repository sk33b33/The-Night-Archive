import { useId } from 'react';
import { GrainFilter } from './Grain';

const COLS = 7;
const CELL_W = 360 / COLS;
const CELL_H = 44;
const TOP = 70;
const LEFT = 20;
/** March 1984 began on a Thursday (Monday-first grid). */
const FIRST_DAY_INDEX = 3;

/**
 * Enlargement of the calendar in the kitchen photograph. The note sits in
 * the 2 March box: x 225–277, y 70–114 of this 400×300 drawing.
 */
export function CalendarEnlargement({ alt }: { readonly alt: string }) {
  const id = useId().replace(/:/g, '');
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <GrainFilter id={`${id}-grain`} seed={3} />
      </defs>
      <g filter={`url(#${id}-grain)`}>
        <rect width="400" height="300" fill="#e4dfd2" />
        <rect width="400" height="40" fill="#8a3a2e" />
        <text x="200" y="27" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fontWeight="700" fill="#f1ece0" letterSpacing="2">
          MARCH 1984
        </text>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <text key={i} x={LEFT + i * CELL_W + CELL_W / 2} y="60" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6b665a">
            {d}
          </text>
        ))}
        {days.map((day) => {
          const index = FIRST_DAY_INDEX + day - 1;
          const x = LEFT + (index % COLS) * CELL_W;
          const y = TOP + Math.floor(index / COLS) * CELL_H;
          return (
            <g key={day}>
              <rect x={x} y={y} width={CELL_W} height={CELL_H} fill="none" stroke="#b9b2a2" strokeWidth="1" />
              <text x={x + 4} y={y + 12} fontSize="10" fontFamily="sans-serif" fill="#3a352d">
                {day}
              </text>
            </g>
          );
        })}
        {/* Handwriting in the 2 March box */}
        <g fill="#2f4f8a" fontFamily="'Segoe Print', 'Bradley Hand', cursive" fontSize="9">
          <text x="229" y="96" transform="rotate(-3 229 96)">Inspector</text>
          <text x="236" y="108" transform="rotate(-3 236 108)">10:00</text>
        </g>
        <path d="M228 99 q20 3 44 -2" stroke="#2f4f8a" strokeWidth="0.8" fill="none" />
        <rect width="400" height="300" fill="#c49a5c" opacity="0.06" />
      </g>
    </svg>
  );
}
