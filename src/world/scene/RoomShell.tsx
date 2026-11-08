import { useMemo } from 'react';
import { DOOR, ROOM } from '../layout';
import { clockTexture, labelTexture } from './labels';

const WALL = '#1f2834';
const WAINSCOT = '#141a22';
const FLOOR = '#1a1d22';
const CEILING = '#10141a';
const T = 0.1;

/** Floor, ceiling, four walls with a wainscot, the door, and the wall clock. */
export function RoomShell() {
  const { minX, maxX, minZ, maxZ, height } = ROOM;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const clock = useMemo(() => clockTexture(3, 40), []);
  const sign = useMemo(
    () => labelTexture(['READING ROOM', 'POSITIONS 1–12'], { width: 512, height: 128, background: '#23303e', color: '#cfd8e3' }),
    [],
  );
  const doorSign = useMemo(
    () => labelTexture(['EXIT'], { width: 256, height: 96, background: '#2a1714', color: '#e5826f' }),
    [],
  );
  const leftOfDoor = DOOR.x - DOOR.width / 2 - minX;
  const rightOfDoor = maxX - (DOOR.x + DOOR.width / 2);

  return (
    <group>
      {/* Floor and ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={FLOOR} roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={CEILING} roughness={1} />
      </mesh>

      {/* Back, left and right walls, each with a darker wainscot */}
      <Wall position={[0, height / 2, minZ - T / 2]} size={[width, height, T]} />
      <Wall position={[minX - T / 2, height / 2, 0]} size={[T, height, depth]} />
      <Wall position={[maxX + T / 2, height / 2, 0]} size={[T, height, depth]} />
      <mesh position={[0, 0.5, minZ + 0.01]} receiveShadow>
        <boxGeometry args={[width, 1, 0.02]} />
        <meshStandardMaterial color={WAINSCOT} />
      </mesh>
      <mesh position={[minX + 0.01, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.02, 1, depth]} />
        <meshStandardMaterial color={WAINSCOT} />
      </mesh>
      <mesh position={[maxX - 0.01, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.02, 1, depth]} />
        <meshStandardMaterial color={WAINSCOT} />
      </mesh>

      {/* Front wall, in three pieces around the door */}
      <Wall position={[minX + leftOfDoor / 2, height / 2, maxZ + T / 2]} size={[leftOfDoor, height, T]} />
      <Wall position={[maxX - rightOfDoor / 2, height / 2, maxZ + T / 2]} size={[rightOfDoor, height, T]} />
      <Wall
        position={[DOOR.x, DOOR.height + (height - DOOR.height) / 2, maxZ + T / 2]}
        size={[DOOR.width, height - DOOR.height, T]}
      />

      {/* The door: usable, it leaves the reading room */}
      <group position={[DOOR.x, 0, maxZ - 0.02]}>
        <mesh position={[0, DOOR.height / 2, 0]} userData={{ interactable: 'door' }} castShadow>
          <boxGeometry args={[DOOR.width - 0.04, DOOR.height - 0.02, 0.05]} />
          <meshStandardMaterial color="#2c2620" roughness={0.7} />
        </mesh>
        <mesh position={[DOOR.width / 2 - 0.14, 1.02, -0.05]} userData={{ interactable: 'door' }}>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#9a9384" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, DOOR.height + 0.18, -0.04]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.42, 0.16]} />
          <meshStandardMaterial map={doorSign} emissive="#e5826f" emissiveIntensity={0.35} emissiveMap={doorSign} />
        </mesh>
      </group>

      {/* Wall clock above the desks, and the room sign */}
      <mesh position={[0, 2.25, minZ + 0.03]}>
        <circleGeometry args={[0.24, 48]} />
        <meshStandardMaterial map={clock} roughness={0.6} />
      </mesh>
      <mesh position={[maxX - 0.03, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshStandardMaterial map={sign} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Wall({
  position,
  size,
}: {
  readonly position: [number, number, number];
  readonly size: [number, number, number];
}) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={WALL} roughness={0.95} />
    </mesh>
  );
}
