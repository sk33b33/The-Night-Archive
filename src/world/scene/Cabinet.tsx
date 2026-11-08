import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { CABINET, ROOM, type InteractableId } from '../layout';
import { roomStore } from '../roomStore';
import { labelTexture } from './labels';

interface CabinetProps {
  /** Case folders in each season's drawer, in drawer order. */
  readonly folders: readonly [number, number];
  readonly reduceMotion: boolean;
}

const STEEL = '#3a4250';
const FOLDER = '#b7975f';

/**
 * A four-drawer steel filing cabinet on the left wall, facing into the
 * room. The top two drawers hold Season 1 and Season 2; each slides out
 * while its panel is open, showing a folder for every case assigned.
 */
export function Cabinet({ folders, reduceMotion }: CabinetProps) {
  const depth = CABINET.depth;
  const backX = ROOM.minX;
  const drawerHeight = (CABINET.height - 0.06) / CABINET.drawers;

  return (
    <group position={[backX + depth / 2, 0, CABINET.z]}>
      <mesh position={[0, CABINET.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[depth, CABINET.height, CABINET.width]} />
        <meshStandardMaterial color={STEEL} metalness={0.45} roughness={0.55} />
      </mesh>
      {Array.from({ length: CABINET.drawers }, (_, i) => {
        // Top drawer first.
        const y = CABINET.height - 0.03 - drawerHeight * (i + 0.5);
        const season = i < 2 ? ((i + 1) as 1 | 2) : null;
        return (
          <Drawer
            key={i}
            y={y}
            height={drawerHeight - 0.025}
            season={season}
            folders={season ? (folders[season - 1] ?? 0) : 0}
            reduceMotion={reduceMotion}
          />
        );
      })}
    </group>
  );
}

function Drawer({
  y,
  height,
  season,
  folders,
  reduceMotion,
}: {
  readonly y: number;
  readonly height: number;
  readonly season: 1 | 2 | null;
  readonly folders: number;
  readonly reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const id: InteractableId | undefined = season ? `drawer-${season}` : undefined;
  const label = useMemo(
    () =>
      labelTexture(season ? [`SEASON ${season}`, season === 1 ? '001 – 007' : '008 – 014'] : ['—'], {
        width: 256,
        height: 112,
      }),
    [season],
  );
  const front = CABINET.depth / 2;
  const width = CABINET.width - 0.04;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const open = id !== undefined && roomStore.get().panel === id;
    const target = open ? CABINET.slide : 0;
    g.position.x = reduceMotion ? target : g.position.x + (target - g.position.x) * Math.min(1, dt * 8);
  });

  const userData = id ? { interactable: id } : {};
  return (
    <group ref={group}>
      {/* The drawer box: open at the top, so the folders show when it slides out */}
      <mesh position={[front - 0.29, y - height / 2 + 0.01, 0]} userData={userData}>
        <boxGeometry args={[0.56, 0.02, width - 0.02]} />
        <meshStandardMaterial color="#2a303a" />
      </mesh>
      {/* Front panel */}
      <mesh position={[front + 0.012, y, 0]} castShadow userData={userData}>
        <boxGeometry args={[0.024, height, width]} />
        <meshStandardMaterial color="#465062" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Label holder and handle */}
      <mesh position={[front + 0.026, y + height * 0.22, 0]} rotation={[0, Math.PI / 2, 0]} userData={userData}>
        <planeGeometry args={[0.16, 0.07]} />
        <meshStandardMaterial map={label} roughness={0.7} />
      </mesh>
      <mesh position={[front + 0.045, y - height * 0.12, 0]} userData={userData}>
        <boxGeometry args={[0.03, 0.025, 0.18]} />
        <meshStandardMaterial color="#a7adb8" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Folders, standing on edge, front to back */}
      {Array.from({ length: folders }, (_, k) => (
        <group key={k} position={[front - 0.06 - k * (0.5 / Math.max(folders, 7)), y - height / 2 + 0.13, 0]}>
          <mesh userData={userData}>
            <boxGeometry args={[0.012, 0.22, width - 0.08]} />
            <meshStandardMaterial color={FOLDER} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.125, (k % 3) * 0.1 - 0.1]} userData={userData}>
            <boxGeometry args={[0.012, 0.035, 0.08]} />
            <meshStandardMaterial color={k % 2 ? '#c9ae78' : '#a88a52'} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
