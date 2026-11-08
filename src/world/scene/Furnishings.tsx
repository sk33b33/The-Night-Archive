import { useMemo } from 'react';
import { chairSpot, DESK_TOP, DESKS, ROOM, TRAY } from '../layout';
import { labelTexture } from './labels';
import { Prop } from './Prop';

/**
 * Kenney kit furniture, placed along the walls. Yaw 0 leaves a model as
 * authored; desks face the room (+z) with Math.PI where needed.
 */
export function Furnishings({ unfiled }: { readonly unfiled: number }) {
  return (
    <group>
      {DESKS.map((d) => (
        <Workstation key={d.label} x={d.x} z={d.z} label={d.label} own={d.own} unfiled={unfiled} />
      ))}

      {/* Right wall: bookcases of archive boxes */}
      <Prop model="bookcaseClosedWide" position={[ROOM.maxX - 0.26, 0, 0.6]} yaw={-Math.PI / 2} />
      <Prop model="bookcaseOpen" position={[ROOM.maxX - 0.26, 0, -1.05]} yaw={-Math.PI / 2} />
      <Prop model="books" position={[ROOM.maxX - 0.3, 1.0, -1.05]} yaw={-Math.PI / 2} />
      <Prop model="books" position={[ROOM.maxX - 0.3, 0.55, -1.25]} yaw={-Math.PI / 2} />

      {/* Front right: the camera 2 monitor on a table */}
      <Prop model="table" position={[3.1, 0, 2.35]} yaw={Math.PI} />
      <Prop model="televisionVintage" position={[3.25, 0.654, 2.45]} yaw={Math.PI} />
      <Prop model="radio" position={[2.75, 0.654, 2.45]} yaw={Math.PI} />

      {/* Corners and the door side */}
      <Prop model="pottedPlant" position={[-3.6, 0, -2.65]} />
      <Prop model="coatRackStanding" position={[-3.4, 0, 2.6]} />
      <Prop model="cardboardBoxClosed" position={[3.55, 0, -2.6]} />
      <Prop model="cardboardBoxOpen" position={[3.45, 0, -2.05]} yaw={0.4} />
      <Prop model="cardboardBoxClosed" position={[3.55, 0.56, -2.6]} yaw={0.2} />
      <Prop model="trashcan" position={[0.95, 0, -2.75]} />
      {/* A worn runner down the middle of the room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.2]} receiveShadow>
        <planeGeometry args={[1.6, 3.6]} />
        <meshStandardMaterial color="#262c38" roughness={1} />
      </mesh>

      {/* Ceiling lamps */}
      <Prop model="lampSquareCeiling" position={[0, ROOM.height - 0.46, -1.2]} />
      <Prop model="lampSquareCeiling" position={[0, ROOM.height - 0.46, 1.6]} />
    </group>
  );
}

function Workstation({
  x,
  z,
  label,
  own,
  unfiled,
}: {
  readonly x: number;
  readonly z: number;
  readonly label: string;
  readonly own: boolean;
  readonly unfiled: number;
}) {
  const tag = useMemo(() => labelTexture([label], { width: 192, height: 64 }), [label]);
  const screen = useMemo(
    () =>
      own
        ? labelTexture(['NA-07', 'ARCHIVE TERMINAL', '> READY_'], {
            width: 512,
            height: 320,
            background: '#06201e',
            color: '#6fd3ca',
            font: '700 52px "Courier New", ui-monospace, monospace',
          })
        : null,
    [own],
  );
  const top = DESK_TOP;
  return (
    <group position={[x, 0, z]}>
      <Prop model="desk" position={[0, 0, 0]} yaw={Math.PI} />
      <Chair x={x} z={z} own={own} />
      <Prop
        model="computerScreen"
        position={[0, top, -0.14]}
        yaw={Math.PI}
        {...(own ? { interactable: 'pc' as const } : {})}
      />
      <Prop model="computerKeyboard" position={[0, top, 0.16]} yaw={Math.PI} />
      <Prop model="computerMouse" position={[0.36, top, 0.16]} yaw={Math.PI} />
      {/* Desk tag on the front edge */}
      <mesh position={[0, top - 0.06, 0.395]}>
        <planeGeometry args={[0.18, 0.06]} />
        <meshStandardMaterial map={tag} />
      </mesh>
      {own && screen && (
        <>
          {/* The terminal's glowing screen, laid over the kit monitor's screen panel
              (0.76 × 0.46 m, centred 0.34 m above the desk, 3 cm in front of the stand) */}
          <mesh position={[0, top + 0.343, -0.14 + 0.038]} userData={{ interactable: 'pc' }}>
            <planeGeometry args={[0.74, 0.44]} />
            <meshStandardMaterial map={screen} emissive="#4fb8b0" emissiveMap={screen} emissiveIntensity={0.9} />
          </mesh>
          <HitArea size={[0.86, 0.6, 0.3]} position={[0, top + 0.34, -0.12]} id="pc" />
          <Prop model="lampSquareTable" position={[-0.58, top, -0.22]} yaw={Math.PI} />
          <UnfiledTray count={unfiled} />
        </>
      )}
    </group>
  );
}

/**
 * An invisible box that can be aimed at: small objects get a target a
 * little larger than they look.
 */
export function HitArea({
  size,
  position,
  id,
}: {
  readonly size: [number, number, number];
  readonly position: [number, number, number];
  readonly id: 'tray' | 'pc' | 'drawer-1' | 'drawer-2';
}) {
  return (
    <mesh position={position} userData={{ interactable: id }}>
      <boxGeometry args={size} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

/** The desk's chair, placed in room coordinates (it may stand aside from the desk). */
function Chair({ x, z, own }: { readonly x: number; readonly z: number; readonly own: boolean }) {
  const spot = chairSpot({ x, z, own });
  return <Prop model="chairDesk" position={[spot.x - x, 0, spot.z - z]} yaw={spot.yaw} />;
}

/** A wire intake tray on the NA-07 desk, with a sheet for each unfiled item. */
function UnfiledTray({ count }: { readonly count: number }) {
  const label = useMemo(() => labelTexture(['UNFILED'], { width: 192, height: 48 }), []);
  const x = TRAY.x;
  const z = TRAY.z - DESKS[1].z;
  const top = DESK_TOP;
  const tray = { interactable: 'tray' as const };
  return (
    <group position={[x, top, z]}>
      <mesh position={[0, 0.005, 0]} userData={tray}>
        <boxGeometry args={[0.36, 0.01, 0.28]} />
        <meshStandardMaterial color="#5b6372" metalness={0.6} roughness={0.4} />
      </mesh>
      {[
        [0, 0.035, 0.14, 0.36, 0.06, 0.01],
        [0, 0.035, -0.14, 0.36, 0.06, 0.01],
        [0.18, 0.035, 0, 0.01, 0.06, 0.28],
        [-0.18, 0.035, 0, 0.01, 0.06, 0.28],
      ].map(([px, py, pz, w, h, d], i) => (
        <mesh key={i} position={[px ?? 0, py ?? 0, pz ?? 0]} userData={tray}>
          <boxGeometry args={[w ?? 0, h ?? 0, d ?? 0]} />
          <meshStandardMaterial color="#5b6372" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0.01 * i, 0.014 + i * 0.004, 0.005 * i]} rotation={[-Math.PI / 2, 0, 0.05 * i]} userData={tray}>
          <planeGeometry args={[0.3, 0.22]} />
          <meshStandardMaterial color="#e3dccb" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 0.146]}>
        <planeGeometry args={[0.16, 0.04]} />
        <meshStandardMaterial map={label} />
      </mesh>
      <HitArea size={[0.46, 0.22, 0.38]} position={[0, 0.08, 0]} id="tray" />
    </group>
  );
}
