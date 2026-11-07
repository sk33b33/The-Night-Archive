import { useId } from 'react';
import { GrainFilter } from './Grain';

/**
 * Enlargement of the papers on the desk in the File 0091 photograph: an
 * intake-ledger page. The 0091 entry sits at about x 36–152, y 189–219 of this
 * 400×300 drawing; content regions are fractions of these coordinates.
 */
export function DeskPapers({ alt }: { readonly alt: string }) {
  const id = useId().replace(/:/g, '');
  const rowY = (i: number) => 116 + i * 30;
  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <GrainFilter id={`${id}-grain`} seed={91} />
      </defs>
      <g filter={`url(#${id}-grain)`}>
        <rect width="400" height="300" fill="#3a2f24" />
        <g transform="rotate(-2 200 150)">
          <rect x="22" y="20" width="356" height="272" fill="#e6dfcc" />
          <text x="40" y="52" fontSize="15" fontFamily="'Courier New', monospace" fontWeight="700" fill="#2a2620" letterSpacing="2">
            INTAKE LEDGER
          </text>
          <text x="40" y="70" fontSize="10" fontFamily="'Courier New', monospace" fill="#5b554a">
            Records facility, Bellwether
          </text>
          {['No.', 'Date', 'Description', 'Filed by'].map((h, i) => (
            <text key={h} x={[40, 104, 168, 318][i]} y="98" fontSize="10" fontFamily="'Courier New', monospace" fontWeight="700" fill="#5b554a">
              {h}
            </text>
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M36 ${rowY(i) + 8} H366`} stroke="#b7ae98" strokeWidth="1" />
          ))}
          <path d="M98 86 V290 M162 86 V290 M312 86 V290" stroke="#c9c0aa" strokeWidth="1" />
          <g fill="#3a3a52" fontFamily="'Segoe Print', 'Bradley Hand', cursive" fontSize="11">
            <text x="42" y={rowY(1)}>0089</text>
            <text x="106" y={rowY(1)}>12/10</text>
            <text x="170" y={rowY(1)}>Lost property returns</text>
            <text x="322" y={rowY(1)}>R.K.</text>
            <text x="42" y={rowY(2)}>0090</text>
            <text x="106" y={rowY(2)}>13/10</text>
            <text x="170" y={rowY(2)}>Council minutes, Sept</text>
            <text x="322" y={rowY(2)}>R.K.</text>
          </g>
          {/* The 0091 entry: number only, fresh blue ink, nothing else written. */}
          <text x="42" y={rowY(3)} fill="#1f3f9a" fontFamily="'Segoe Print', 'Bradley Hand', cursive" fontSize="13" fontWeight="700">
            0091
          </text>
        </g>
        <rect width="400" height="300" fill="#c49a5c" opacity="0.06" />
      </g>
    </svg>
  );
}
