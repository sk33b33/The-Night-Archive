import { useId } from 'react';
import { GrainFilter } from './Grain';

/**
 * Inspection photograph of the kitchen at 14 Harrow Lane, taken in flat
 * morning light. Region coordinates in Case 002 content are fractions of
 * this 400×300 drawing: calendar (36–116, 36–132), radio (36–116, 144–192),
 * cup (220–252, 180–204).
 */
export function KitchenPhoto({ alt }: { readonly alt: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <GrainFilter id={`${id}-grain`} seed={84} />
        <linearGradient id={`${id}-window`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9cdc8" />
          <stop offset="1" stopColor="#9da49f" />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-grain)`}>
        {/* Wall and floor */}
        <rect width="400" height="300" fill="#6b665a" />
        <rect y="196" width="400" height="104" fill="#4f4a40" />
        {/* Window, morning light */}
        <rect x="270" y="28" width="104" height="96" fill={`url(#${id}-window)`} />
        <path d="M322 28 V124 M270 76 H374" stroke="#5d584e" strokeWidth="4" />
        <rect x="266" y="24" width="112" height="104" fill="none" stroke="#5d584e" strokeWidth="5" />
        {/* Wall cupboards */}
        <rect x="140" y="18" width="110" height="74" fill="#857c69" />
        <path d="M195 18 V92" stroke="#6e6656" strokeWidth="3" />
        <circle cx="188" cy="62" r="2.5" fill="#3a352d" />
        <circle cx="202" cy="62" r="2.5" fill="#3a352d" />

        {/* Calendar on the wall */}
        <rect x="40" y="38" width="72" height="92" fill="#e4dfd2" />
        <rect x="40" y="38" width="72" height="22" fill="#8a3a2e" />
        <text x="76" y="53" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="700" fill="#f1ece0">
          MARCH 1984
        </text>
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 7 }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={43 + col * 9.6}
              y={64 + row * 12.5}
              width="8.6"
              height="11.5"
              fill="none"
              stroke="#b9b2a2"
              strokeWidth="0.6"
            />
          )),
        )}
        <path d="M84 68 q4 3 8 0" stroke="#2f4f8a" strokeWidth="1.2" fill="none" />
        <rect x="74" y="34" width="4" height="6" fill="#3a352d" />

        {/* Counter with radio */}
        <rect x="0" y="176" width="140" height="20" fill="#8f8775" />
        <rect x="40" y="148" width="72" height="30" rx="4" fill="#3b3a36" />
        <rect x="48" y="155" width="34" height="16" rx="2" fill="#d9a441" opacity="0.85" />
        <path d="M52 163 H78" stroke="#5a3d10" strokeWidth="1" />
        <circle cx="96" cy="163" r="7" fill="#26251f" />
        <circle cx="96" cy="163" r="2" fill="#77736a" />

        {/* Table and cup */}
        <rect x="150" y="206" width="200" height="14" fill="#7a6a52" />
        <rect x="160" y="220" width="10" height="60" fill="#5e5140" />
        <rect x="330" y="220" width="10" height="60" fill="#5e5140" />
        <path d="M226 184 H246 L244 204 H228 Z" fill="#e8e3d6" />
        <path d="M246 188 q8 2 0 10" stroke="#e8e3d6" strokeWidth="3" fill="none" />
        <ellipse cx="236" cy="205" rx="16" ry="3" fill="#cfc8b8" />
        <ellipse cx="236" cy="185" rx="10" ry="2" fill="#4a3424" />

        <rect width="400" height="300" fill={`url(#${id}-vignette)`} />
        <rect width="400" height="300" fill="#9fb0b5" opacity="0.08" />
      </g>
    </svg>
  );
}
