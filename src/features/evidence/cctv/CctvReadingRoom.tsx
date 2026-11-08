import { useId } from 'react';
import { Envelope } from '../photo/artwork/Envelope';
import { READING_ROOM_CLOCK, WallClock } from '../photo/artwork/WallClock';

export interface ReadingRoomScene {
  /** Night-entrance door on the far wall. */
  readonly door?: 'shut' | 'ajar';
  readonly lamp?: boolean;
  /** The night archivist, seated at position 7, back to camera. */
  readonly archivist?: boolean;
  /** A standing figure at position 7's Unfiled tray, back to camera. */
  readonly figure?: boolean;
  /** A sealed envelope on the desk where the papers usually lie. */
  readonly envelope?: boolean;
  /** The night porter, standing at the left of the desk, back to camera. */
  readonly porter?: boolean;
  /** Someone seated at position 7, back to camera: not identified. */
  readonly seatedFigure?: boolean;
  /** The day archivist, standing at the left of the desk. */
  readonly dayArchivist?: boolean;
}

interface CctvReadingRoomProps {
  readonly scene: ReadingRoomScene;
  readonly time: string;
  readonly alt: string;
}

/**
 * Camera 2's view of the reading room, drawn on the same 400×300 layout as
 * the File 0091 photograph (window, shelf, door, desk, terminal) so the two
 * can be compared region by region. Monochrome, with scanlines and a
 * timestamp overlay. Static: nothing animates.
 */
export function CctvReadingRoom({ scene, time, alt }: CctvReadingRoomProps) {
  const id = useId().replace(/:/g, '');
  const ajar = scene.door === 'ajar';
  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`${id}-mono`}>
          <feColorMatrix
            type="matrix"
            values="0.3 0.55 0.15 0 0  0.35 0.6 0.18 0 0.02  0.28 0.5 0.14 0 0  0 0 0 1 0"
          />
        </filter>
        <pattern id={`${id}-scan`} width="4" height="3" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#000" opacity="0.35" />
        </pattern>
      </defs>
      <g filter={`url(#${id}-mono)`}>
        <rect width="400" height="300" fill="#2a241e" />
        <rect width="400" height="168" fill="#3a332b" />
        {/* Window */}
        <rect x="26" y="22" width="110" height="96" fill="#15171a" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x="26" y={24 + i * 10.5} width="110" height="4" fill="#4a4238" opacity="0.8" />
        ))}
        <rect x="24" y="20" width="114" height="100" fill="none" stroke="#4d4339" strokeWidth="3" />
        {/* Shelf */}
        <rect x="292" y="40" width="96" height="6" fill="#4b4036" />
        <rect x="296" y="12" width="40" height="28" fill="#8d7756" />
        <rect x="340" y="16" width="44" height="24" fill="#7f6a4c" />
        {/* Night-entrance door */}
        {ajar ? (
          <>
            <rect x="252" y="58" width="36" height="110" fill="#050505" />
            <path d="M252 58 L272 66 L272 162 L252 168 Z" fill="#4a4036" />
          </>
        ) : (
          <rect x="252" y="58" width="36" height="110" fill="#3b332b" />
        )}
        <rect x="252" y="58" width="36" height="110" fill="none" stroke="#4d4339" strokeWidth="2" />
        {scene.lamp && <rect width="400" height="300" fill="#f3d79a" opacity="0.08" />}
        {/* Wall clock: its hands follow the frame's timestamp. */}
        <WallClock {...READING_ROOM_CLOCK} time={time} />
        {/* Desk, terminal, keyboard */}
        <rect y="168" width="400" height="132" fill="#4a3a2b" />
        <rect x="128" y="66" width="128" height="104" rx="8" fill="#b9ad94" />
        <rect x="140" y="76" width="104" height="76" rx="6" fill="#26332f" />
        <path d="M128 214 L262 214 L272 238 L118 238 Z" fill="#b3a78e" />
        {/* Unfiled tray, right of the keyboard */}
        <path d="M282 196 L326 196 L330 210 L278 210 Z" fill="#6f6556" />
        <path d="M284 198 L324 198" stroke="#8e8472" strokeWidth="1.5" />
        {/* Desk lamp */}
        <rect x="300" y="186" width="34" height="5" rx="2" fill="#262420" />
        <path d="M316 188 L308 138 L330 116" stroke="#262420" strokeWidth="4" fill="none" />
        {scene.envelope && <Envelope />}
        {scene.porter && (
          // Lighter figure at the left of the desk, leaning to the envelope.
          <g fill="#5d564c">
            <ellipse cx="86" cy="118" rx="16" ry="20" />
            <path d="M56 300 L62 156 Q86 136 110 156 L116 300 Z" />
            <path d="M104 170 L96 204 L102 206 L112 172 Z" />
          </g>
        )}
        {scene.dayArchivist && (
          <g fill="#8a8274">
            <ellipse cx="86" cy="116" rx="16" ry="20" />
            <path d="M56 300 L62 154 Q86 134 110 154 L116 300 Z" />
          </g>
        )}
        {scene.seatedFigure && (
          // Seated at position 7, back to camera; darker than the archivist.
          <g fill="#1d1b18">
            <ellipse cx="196" cy="182" rx="22" ry="26" />
            <path d="M152 300 L162 222 Q196 196 230 222 L240 300 Z" />
          </g>
        )}
        {scene.archivist && (
          // Seated, back to camera.
          <g fill="#7d7466">
            <ellipse cx="196" cy="182" rx="22" ry="26" />
            <path d="M152 300 L162 222 Q196 196 230 222 L240 300 Z" />
          </g>
        )}
        {scene.figure && (
          // Standing at the tray, back to camera, face never in frame.
          <g fill="#151412">
            <ellipse cx="300" cy="104" rx="17" ry="21" />
            <path d="M268 300 L274 140 Q300 120 326 140 L334 300 Z" />
            <path d="M318 168 L314 198 L320 200 L326 170 Z" />
            <rect x="306" y="194" width="16" height="4" fill="#e8e3d6" />
          </g>
        )}
      </g>
      <rect width="400" height="300" fill={`url(#${id}-scan)`} />
      <g fontFamily="'Courier New', monospace" fontSize="12" fontWeight="700" fill="#d8e8d0">
        <text x="12" y="20">CAM 2</text>
        <text x="388" y="20" textAnchor="end">
          {time}
        </text>
      </g>
      <circle cx="14" cy="286" r="4" fill="#e04a3a" />
      <text x="24" y="290" fontFamily="'Courier New', monospace" fontSize="11" fill="#d8e8d0">
        REC
      </text>
    </svg>
  );
}
