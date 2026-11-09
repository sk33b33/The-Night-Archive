import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { CLIPBOARD, CORKBOARD, DESK_TOP, DESKS, FOLDER, MONITOR, ROOM } from '../layout';
import { labelTexture } from './labels';

/** The case you are working, as the scene draws it. */
export interface WorkingCaseView {
  readonly number: string;
  /** Records in the case: one index card each on the corkboard. */
  readonly cards: number;
  /** Whether the case has CCTV footage for the monitor to show. */
  readonly footage: boolean;
}

const MANILA = '#b8975c';
const PAPER = '#e3dccb';

/**
 * The working case in the room: its folder open on your desk, its corkboard
 * and findings clipboard on the left wall, and camera 2 on the monitor.
 * With no case open the desk is clear, and the board and clipboard are bare.
 */
export function CaseObjects({
  current,
  reduceMotion,
}: {
  readonly current: WorkingCaseView | null;
  readonly reduceMotion: boolean;
}) {
  return (
    <group>
      {current && <OpenFolder number={current.number} />}
      <Corkboard number={current?.number ?? null} cards={current?.cards ?? 0} />
      <Clipboard number={current?.number ?? null} />
      <MonitorScreen live={current?.footage ?? false} reduceMotion={reduceMotion} />
    </group>
  );
}

function OpenFolder({ number }: { readonly number: string }) {
  const desk = DESKS[1];
  const label = useMemo(() => labelTexture([`CASE ${number}`], { width: 256, height: 64, background: '#efe8d4' }), [number]);
  const page = useMemo(
    () => labelTexture(['INCIDENT FILE', `No. ${number}`, '— — — — — —', '— — — —'], { width: 256, height: 320, background: PAPER, color: '#3a3a40' }),
    [number],
  );
  const use = { interactable: 'folder' as const };
  return (
    <group position={[desk.x + FOLDER.x, DESK_TOP + 0.004, desk.z + FOLDER.z]} rotation={[0, 0.18, 0]}>
      {/* Both covers, opened flat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.09, 0, 0]} userData={use} receiveShadow>
        <planeGeometry args={[0.18, 0.26]} />
        <meshStandardMaterial color={MANILA} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.09, 0, 0]} userData={use} receiveShadow>
        <planeGeometry args={[0.18, 0.26]} />
        <meshStandardMaterial color={MANILA} roughness={0.95} />
      </mesh>
      {/* The top sheet, and the label on the left cover */}
      <mesh rotation={[-Math.PI / 2, 0, -0.03]} position={[0.09, 0.003, 0]} userData={use}>
        <planeGeometry args={[0.165, 0.235]} />
        <meshStandardMaterial map={page} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.09, 0.003, -0.08]} userData={use}>
        <planeGeometry args={[0.14, 0.035]} />
        <meshStandardMaterial map={label} />
      </mesh>
      {/* A larger target than the folder itself */}
      <mesh position={[0, 0.05, 0]} userData={use}>
        <boxGeometry args={[0.42, 0.12, 0.32]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/** A deterministic scatter, so the cards sit in the same places every visit. */
function cardSpot(i: number): { y: number; z: number; tilt: number } {
  const col = i % 5;
  const row = Math.floor(i / 5) % 3;
  const jitter = Math.sin(i * 12.9898) * 0.5;
  return {
    z: -CORKBOARD.width / 2 + 0.16 + col * 0.27 + jitter * 0.04,
    y: CORKBOARD.height / 2 - 0.16 - row * 0.27 + jitter * 0.03,
    tilt: jitter * 0.12,
  };
}

function Corkboard({ number, cards }: { readonly number: string | null; readonly cards: number }) {
  const x = ROOM.minX + 0.03;
  const title = useMemo(
    () => labelTexture([number ? `CASE ${number}` : 'NO CASE OPEN'], { width: 320, height: 64, background: '#efe8d4' }),
    [number],
  );
  const shown = Math.min(cards, 15);
  const spots = Array.from({ length: shown }, (_, i) => cardSpot(i));
  const use = { interactable: 'board' as const };
  return (
    <group position={[x, CORKBOARD.y, CORKBOARD.z]} rotation={[0, Math.PI / 2, 0]}>
      {/* Frame and cork */}
      <mesh position={[0, 0, -0.012]} userData={use}>
        <boxGeometry args={[CORKBOARD.width + 0.08, CORKBOARD.height + 0.08, 0.03]} />
        <meshStandardMaterial color="#3b2f25" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.004]} userData={use}>
        <planeGeometry args={[CORKBOARD.width, CORKBOARD.height]} />
        <meshStandardMaterial color="#6e5236" roughness={1} />
      </mesh>
      <mesh position={[0, CORKBOARD.height / 2 + 0.1, 0.006]} userData={use}>
        <planeGeometry args={[0.36, 0.07]} />
        <meshStandardMaterial map={title} />
      </mesh>
      {spots.map((s, i) => (
        <group key={i} position={[s.z, s.y, 0.008 + i * 0.0004]} rotation={[0, 0, s.tilt]}>
          <mesh userData={use}>
            <planeGeometry args={[0.18, 0.12]} />
            <meshStandardMaterial color={i % 4 === 0 ? '#d8cfb8' : PAPER} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.045, 0.004]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#b33a2e' : '#c9a227'} />
          </mesh>
        </group>
      ))}
      {/* Red string between neighbouring cards */}
      {spots.slice(1).map((s, i) => {
        const a = spots[i];
        if (!a || i % 2 === 1) return null;
        const dz = s.z - a.z;
        const dy = s.y - a.y;
        const length = Math.hypot(dz, dy);
        return (
          <mesh
            key={`s${i}`}
            position={[(a.z + s.z) / 2, (a.y + s.y) / 2 + 0.045, 0.014]}
            rotation={[0, 0, Math.atan2(dy, dz)]}
          >
            <boxGeometry args={[length, 0.004, 0.002]} />
            <meshStandardMaterial color="#9d2a22" />
          </mesh>
        );
      })}
    </group>
  );
}

function Clipboard({ number }: { readonly number: string | null }) {
  const x = ROOM.minX + 0.03;
  const sheet = useMemo(
    () =>
      labelTexture(['FINDINGS', number ? `CASE ${number}` : '—', '1. ______', '2. ______', '3. ______'], {
        width: 256,
        height: 340,
        background: PAPER,
        color: '#2a2a30',
      }),
    [number],
  );
  const use = { interactable: 'findings' as const };
  return (
    <group position={[x, CLIPBOARD.y, CLIPBOARD.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0]} userData={use}>
        <boxGeometry args={[0.25, 0.34, 0.012]} />
        <meshStandardMaterial color="#5a4630" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.01, 0.008]} userData={use}>
        <planeGeometry args={[0.22, 0.29]} />
        <meshStandardMaterial map={sheet} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.16, 0.012]} userData={use}>
        <boxGeometry args={[0.1, 0.035, 0.015]} />
        <meshStandardMaterial color="#a7adb8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.05]} userData={use}>
        <boxGeometry args={[0.36, 0.46, 0.1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/**
 * The vintage TV's screen (0.70 × 0.42 m, centred 0.26 m above the table,
 * 0.25 m in front of the set's middle). Shows camera 2 when the case has
 * footage, with a slow roll unless motion is reduced; otherwise no signal.
 */
function MonitorScreen({ live, reduceMotion }: { readonly live: boolean; readonly reduceMotion: boolean }) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const texture = useMemo(
    () =>
      live
        ? labelTexture(['CAM 2', 'READING ROOM', '● REC'], {
            width: 512,
            height: 300,
            background: '#1d2622',
            color: '#c7d6c9',
            font: '700 40px "Courier New", ui-monospace, monospace',
          })
        : labelTexture(['CAM 2', 'NO FOOTAGE FILED'], {
            width: 512,
            height: 300,
            background: '#0d1012',
            color: '#59646b',
            font: '700 40px "Courier New", ui-monospace, monospace',
          }),
    [live],
  );
  useFrame(({ clock }) => {
    if (!material.current || reduceMotion || !live) return;
    material.current.emissiveIntensity = 0.55 + Math.sin(clock.elapsedTime * 9) * 0.04 + Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });
  return (
    <mesh position={[MONITOR.x, MONITOR.top + 0.263, MONITOR.z - 0.255]} rotation={[0, Math.PI, 0]} userData={{ interactable: 'monitor' }}>
      <planeGeometry args={[0.68, 0.4]} />
      <meshStandardMaterial
        ref={material}
        map={texture}
        emissive={live ? '#9fb8a4' : '#20262a'}
        emissiveMap={texture}
        emissiveIntensity={live ? 0.55 : 0.4}
      />
    </mesh>
  );
}
