import { useId } from 'react';
import { ARCHIVE_DESK } from '../../content/archive';

interface WorkstationPhotoProps {
  /** Camera date imprint; omit for a print without one. */
  readonly dateStamp?: string;
  /**
   * night: the File 0091 photograph (lamp lit, papers, dark window).
   * installation: the Estates photograph of 2 Feb 1998 (daylight, no lamp,
   * no papers, position tag on the desk edge).
   */
  readonly variant?: 'night' | 'installation';
  readonly alt: string;
}

/**
 * A faded night photograph of the player's workstation, drawn as SVG.
 * Static: no animation, so nothing to reduce for reduced-motion users.
 */
export function WorkstationPhoto({ dateStamp, alt, variant = 'night' }: WorkstationPhotoProps) {
  const night = variant === 'night';
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className="photo"
      viewBox="0 0 400 300"
      role="img"
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="91" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feComponentTransfer in="mono" result="faint">
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="faint" mode="multiply" />
        </filter>
        <radialGradient id={`${id}-lamp`} cx="0.72" cy="0.52" r="0.5">
          <stop offset="0" stopColor="#f3d79a" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#c99b54" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1a1612" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f5a52" />
          <stop offset="1" stopColor="#1f2d2a" />
        </linearGradient>
      </defs>

      <g filter={`url(#${id}-grain)`}>
        {/* Room */}
        <rect width="400" height="300" fill="#2a241e" />
        <rect y="0" width="400" height="168" fill="#332c25" />
        {/* Window blinds: dark outside at night, daylight at installation */}
        <rect x="26" y="22" width="110" height="96" fill={night ? '#14161a' : '#b9bdb8'} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x="26" y={24 + i * 10.5} width="110" height="4" fill="#4a4238" opacity="0.8" />
        ))}
        <rect x="24" y="20" width="114" height="100" fill="none" stroke="#4d4339" strokeWidth="3" />

        {/* Night-entrance door on the far wall (shut) */}
        <rect x="252" y="58" width="36" height="110" fill="#3b332b" />
        <rect x="252" y="58" width="36" height="110" fill="none" stroke="#4d4339" strokeWidth="2" />
        <circle cx="281" cy="116" r="1.6" fill="#6b604f" />

        {/* Archive boxes on a shelf */}
        <rect x="292" y="40" width="96" height="6" fill="#4b4036" />
        <rect x="296" y="12" width="40" height="28" fill="#8d7756" />
        <rect x="340" y="16" width="44" height="24" fill="#7f6a4c" />
        <rect x="304" y="22" width="22" height="6" fill="#d8ccb2" opacity="0.7" />
        <rect x="350" y="24" width="22" height="6" fill="#d8ccb2" opacity="0.7" />

        {/* Lamp glow (night only) */}
        {night && <rect width="400" height="300" fill={`url(#${id}-lamp)`} />}
        {!night && <rect width="400" height="300" fill="#d8dcd6" opacity="0.12" />}

        {/* Desk */}
        <rect x="0" y="168" width="400" height="132" fill="#4a3a2b" />
        <rect x="0" y="168" width="400" height="6" fill="#5c4835" />

        {/* Terminal */}
        <rect x="128" y="66" width="128" height="104" rx="8" fill="#b9ad94" />
        <rect x="140" y="76" width="104" height="76" rx="6" fill={`url(#${id}-screen)`} />
        <rect x="150" y="88" width="56" height="3" fill="#7fb8a8" opacity="0.6" />
        <rect x="150" y="96" width="74" height="3" fill="#7fb8a8" opacity="0.45" />
        <rect x="150" y="104" width="40" height="3" fill="#7fb8a8" opacity="0.45" />
        <rect x="150" y="112" width="8" height="5" fill="#9fd8c8" opacity="0.8" />
        {/* Maker's badge, lower right of the casing */}
        <rect x="214" y="157" width="34" height="7" rx="1" fill="#8e8572" />
        <text x="231" y="162.5" textAnchor="middle" fontSize="4.6" fontFamily="sans-serif" fontWeight="700" fill="#e6dfcc" letterSpacing="0.3">
          HALDEN 486
        </text>
        <rect x="146" y="156" width="40" height="9" rx="1" fill="#e8e2d2" />
        <text x="166" y="163" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#2a2620">
          {ARCHIVE_DESK.workstation}
        </text>
        <rect x="176" y="170" width="32" height="8" fill="#a2967e" />
        <rect x="150" y="176" width="84" height="6" rx="2" fill="#968a72" />

        {/* Keyboard */}
        <path d="M128 214 L262 214 L272 238 L118 238 Z" fill="#b3a78e" />
        {Array.from({ length: 3 }, (_, row) => (
          <rect
            key={row}
            x={130 - row * 3}
            y={218 + row * 6}
            width={130 + row * 6}
            height="3"
            fill="#8c8069"
          />
        ))}

        {night ? (
          <>
            {/* Desk lamp */}
            <rect x="300" y="196" width="40" height="6" rx="2" fill="#262420" />
            <path d="M318 198 L308 140 L334 114" stroke="#262420" strokeWidth="4" fill="none" />
            <path d="M322 104 L356 118 L344 134 Z" fill="#2f3a36" />

            {/* Papers */}
            <path d="M40 200 L104 194 L110 236 L44 242 Z" fill="#d9d1bd" />
            <path d="M52 206 L96 202" stroke="#8c8370" strokeWidth="1.5" />
            <path d="M54 214 L98 210" stroke="#8c8370" strokeWidth="1.5" />
            <path d="M55 222 L86 219" stroke="#8c8370" strokeWidth="1.5" />
          </>
        ) : (
          <>
            {/* Position tag taped to the desk edge */}
            <rect x="40" y="170" width="26" height="12" fill="#f1ece0" />
            <text x="53" y="179" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="700" fill="#2a2620">
              7
            </text>
          </>
        )}

        <rect width="400" height="300" fill={`url(#${id}-vignette)`} />
        {/* Faded print (the File 0091 photograph only) */}
        {night && <rect width="400" height="300" fill="#c49a5c" opacity="0.08" />}
      </g>

      {/* Camera date imprint */}
      {dateStamp && (
      <text
        x="384"
        y="286"
        textAnchor="end"
        fontSize="13"
        fontFamily="'Courier New', monospace"
        fontWeight="700"
        fill="#ff9a3c"
        opacity="0.92"
        letterSpacing="1"
      >
        {dateStamp}
      </text>
      )}
    </svg>
  );
}
