import { useId } from 'react';
import type { Glyph, HandSample } from '../../../../content/cases/case-009-hands';
import { GrainFilter } from './Grain';

const INK = '#1f3f9a';
const PAPER: Record<HandSample['paper'], string> = {
  slip: '#ece6d6',
  card: '#f1ece0',
  calendar: '#e4dfd2',
  ledger: '#e6dfcc',
  report: '#e9e4d8',
};

/** The three compared letterforms, drawn identically wherever they appear. */
function GlyphPath({ glyph, x, y, size: s }: { glyph: Glyph; x: number; y: number; size: number }) {
  const stroke = { stroke: INK, strokeWidth: Math.max(2, s * 0.07), fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (glyph) {
    case 'M':
      return (
        <g {...stroke}>
          <path d={`M${x} ${y} L${x + 0.15 * s} ${y - s} L${x + 0.42 * s} ${y - 0.35 * s} L${x + 0.68 * s} ${y - s} L${x + 0.85 * s} ${y}`} />
          {/* The crossing stroke */}
          <path d={`M${x - 0.04 * s} ${y - 0.52 * s} L${x + 0.9 * s} ${y - 0.48 * s}`} />
        </g>
      );
    case '0':
      // Open at the top: an arc that stops short of closing.
      return (
        <g {...stroke}>
          <path
            d={`M${x + 0.42 * s} ${y - 0.98 * s} A ${0.3 * s} ${0.49 * s} 0 1 1 ${x + 0.2 * s} ${y - 0.96 * s}`}
          />
        </g>
      );
    case '1':
      return (
        <g {...stroke}>
          <path d={`M${x + 0.05 * s} ${y - 0.72 * s} L${x + 0.4 * s} ${y - s} L${x + 0.12 * s} ${y}`} />
        </g>
      );
  }
}

/** A handwritten sample on its paper, rendered from layout data. */
export function HandwritingSample({ sample, alt }: { readonly sample: HandSample; readonly alt: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <GrainFilter id={`${id}-grain`} seed={9} />
      </defs>
      <g filter={`url(#${id}-grain)`}>
        <rect width="400" height="300" fill={PAPER[sample.paper]} />
        {sample.paper === 'ledger' && (
          <g stroke="#c9c0aa" strokeWidth="1">
            {[60, 120, 210, 270].map((y) => (
              <path key={y} d={`M0 ${y} H400`} />
            ))}
          </g>
        )}
        {sample.paper === 'calendar' && <rect x="10" y="20" width="380" height="270" fill="none" stroke="#b9b2a2" strokeWidth="2" />}
        {sample.paper === 'slip' && (
          <g stroke="#b7ae98" strokeWidth="1">
            {[116, 166, 216, 268].map((y) => (
              <path key={y} d={`M150 ${y} H380`} />
            ))}
          </g>
        )}
        {sample.printed.map((p) => (
          <text key={`${p.x}-${p.y}`} x={p.x} y={p.y} fontSize={p.size} fontFamily="'Courier New', monospace" fontWeight="700" fill="#4a4538">
            {p.text}
          </text>
        ))}
        {sample.hand.map((part, i) =>
          part.kind === 'glyph' ? (
            <GlyphPath key={i} glyph={part.glyph} x={part.x} y={part.y} size={part.size} />
          ) : (
            <text key={i} x={part.x} y={part.y} fontSize={part.size} fontFamily="'Segoe Print', 'Bradley Hand', cursive" fill={INK}>
              {part.text}
            </text>
          ),
        )}
      </g>
    </svg>
  );
}
