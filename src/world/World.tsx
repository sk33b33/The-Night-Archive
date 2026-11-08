import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { DESK_TOP, DESKS, ROOM, type InteractableId } from './layout';
import { PlayerController } from './PlayerController';
import { Cabinet } from './scene/Cabinet';
import { Furnishings } from './scene/Furnishings';
import { preloadKit } from './scene/Prop';
import { RoomShell } from './scene/RoomShell';

preloadKit();

export interface WorldProps {
  /** True when the reading room has the player's attention (no screen or panel over it). */
  readonly active: boolean;
  /** True when the room is a backdrop (the title screen), drawn dimmed and still. */
  readonly backdrop: boolean;
  readonly reduceMotion: boolean;
  readonly folders: readonly [number, number];
  readonly unfiled: number;
  readonly onUse: (id: InteractableId) => void;
}

/**
 * The reading room in 3D. It stays mounted behind every screen so the
 * scene is built once; screens and panels are drawn over it.
 */
export default function World({ active, backdrop, reduceMotion, folders, unfiled, onUse }: WorldProps) {
  const own = DESKS[1];
  return (
    <div className={backdrop ? 'world world--backdrop' : 'world'} aria-hidden="true">
      <Canvas
        shadows="percentage"
        dpr={[1, 1.5]}
        // Stop drawing when nothing moves: an overlay is open and the drawers are still.
        frameloop={active || !backdrop ? 'always' : 'demand'}
        camera={{ fov: 70, near: 0.05, far: 30, position: [0, 1.6, 2] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        // Focus the canvas so E and Enter reach it after a click.
        tabIndex={-1}
      >
        <color attach="background" args={['#05070b']} />
        <fog attach="fog" args={['#05070b', 5, 13]} />
        <hemisphereLight args={['#7a8db0', '#141820', 0.8]} />
        <ambientLight intensity={0.28} color="#9fb2d6" />
        {/* Light over the filing cabinet and the door side of the room */}
        <pointLight position={[-2.8, ROOM.height - 0.4, 0.4]} intensity={3} distance={6} decay={1.6} color="#a9bbdc" />
        {/* Cool fluorescent light from the ceiling lamps */}
        <pointLight position={[0, ROOM.height - 0.55, -1.2]} intensity={5} distance={9} decay={1.6} color="#b7c8e6" />
        <pointLight position={[0, ROOM.height - 0.55, 1.6]} intensity={4} distance={9} decay={1.6} color="#b7c8e6" />
        {/* The warm desk lamp at NA-07, the only light that casts shadows */}
        <spotLight
          position={[own.x - 0.5, DESK_TOP + 0.75, own.z + 0.05]}
          angle={0.85}
          penumbra={0.6}
          intensity={9}
          distance={5}
          decay={1.5}
          color="#ffcf8a"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0006}
          target-position={[own.x + 0.1, DESK_TOP, own.z + 0.2]}
        />
        <RoomShell />
        <Cabinet folders={folders} reduceMotion={reduceMotion} />
        <Suspense fallback={null}>
          <Furnishings unfiled={unfiled} />
        </Suspense>
        <PlayerController active={active} onUse={onUse} />
      </Canvas>
    </div>
  );
}
