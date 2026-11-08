import { useId } from 'react';
import { ALL_BOXES, BOXES_IN_0094, boxPlace, STORAGE } from '../../../../content/cases/case-011-storage';
import { GrainFilter } from './Grain';

interface StoragePhotoProps {
  readonly variant: 'sealing' | 'file-0094';
  readonly alt: string;
}

/**
 * Storage B, drawn from the shared layout in case-011-storage.ts. The
 * sealing photograph (1981) is flash-lit with full shelves and a date
 * imprint; the File 0094 photograph is cold, unimprinted, and shows only
 * three boxes. Everything else is the same room.
 */
export function StoragePhoto({ variant, alt }: StoragePhotoProps) {
  const id = useId().replace(/:/g, '');
  const sealing = variant === 'sealing';
  const boxes = sealing ? ALL_BOXES : BOXES_IN_0094;
  const { box, window: win } = STORAGE;
  const wall = sealing ? '#5a5244' : '#2c3236';
  const floor = sealing ? '#3e372d' : '#1d2124';
  const steel = sealing ? '#8d8a80' : '#5d666b';
  const card = sealing ? '#b88e58' : '#7d6a4f';

  return (
    <svg className="photo" viewBox="0 0 400 300" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <GrainFilter id={`${id}-grain`} seed={sealing ? 81 : 94} />
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={sealing ? 0.25 : 0.55} />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-grain)`}>
        <rect width="400" height={STORAGE.floor} fill={wall} />
        <rect y={STORAGE.floor} width="400" height={300 - STORAGE.floor} fill={floor} />
        <path d={`M0 ${STORAGE.floor} H400`} stroke="#000" strokeOpacity="0.4" strokeWidth="2" />

        {/* The east window: light through four bars. */}
        <rect x={win.x} y={win.y} width={win.width} height={win.height} fill={sealing ? '#c9c3a8' : '#55697a'} />
        <rect x={win.x} y={win.y} width={win.width} height={win.height} fill="none" stroke="#2b2722" strokeWidth="4" />
        {Array.from({ length: win.bars }, (_, i) => {
          const x = win.x + ((i + 1) * win.width) / (win.bars + 1);
          return <path key={i} d={`M${x} ${win.y} V${win.y + win.height}`} stroke="#2b2722" strokeWidth="3" />;
        })}
        <path d={`M${win.x} ${win.y + win.height / 2} H${win.x + win.width}`} stroke="#2b2722" strokeWidth="2" />

        {STORAGE.bays.map((bay) => (
          <g key={bay.id}>
            <path
              d={`M${bay.x} ${STORAGE.top} V${STORAGE.floor} M${bay.x + STORAGE.bayWidth} ${STORAGE.top} V${STORAGE.floor}`}
              stroke={steel}
              strokeWidth="4"
            />
            {STORAGE.planks.map((y) => (
              <rect key={y} x={bay.x} y={y} width={STORAGE.bayWidth} height="4" fill={steel} />
            ))}
            <rect x={bay.x + 40} y={STORAGE.top - 4} width="50" height="12" fill="#d8d3c4" stroke="#2b2722" strokeWidth="1" />
            <text
              x={bay.x + 65}
              y={STORAGE.top + 5}
              textAnchor="middle"
              fontSize="8"
              fontFamily="'Courier New', monospace"
              fontWeight="700"
              fill="#2b2722"
            >
              BAY {bay.id}
            </text>
          </g>
        ))}

        {boxes.map((n) => {
          const place = boxPlace(n);
          return (
            <g key={n}>
              <rect x={place.x} y={place.y} width={box.width} height={box.height} fill={card} stroke="#2b2216" strokeWidth="0.8" />
              <rect x={place.x + 2.5} y={place.y + 12} width={box.width - 5} height="8" fill="#ece6d6" />
              <text
                x={place.x + box.width / 2}
                y={place.y + 18}
                textAnchor="middle"
                fontSize="4.4"
                fontFamily="'Courier New', monospace"
                fontWeight="700"
                fill="#1d1f24"
              >
                {place.label}
              </text>
            </g>
          );
        })}

        <rect width="400" height="300" fill={`url(#${id}-light)`} />
        {sealing && (
          <text x="388" y="290" textAnchor="end" fontSize="11" fontFamily="'Courier New', monospace" fill="#f2a24a" opacity="0.9">
            16 10 81
          </text>
        )}
      </g>
    </svg>
  );
}
