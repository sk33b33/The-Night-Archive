import { useSyncExternalStore } from 'react';
import { PLAYER, type InteractableId } from './layout';

/**
 * State shared by the 3D scene and the on-screen layer (HUD). Kept outside
 * React so the scene's frame loop can read it without re-rendering, and so
 * it survives moving between screens: coming back from a case returns you
 * to the station you left from, with its panel open.
 */
export type PanelId = 'terminal' | 'drawer-1' | 'drawer-2' | 'tray';

export interface RoomState {
  /** The object in front of you that can be used, if any. */
  readonly focus: InteractableId | null;
  /** The station panel open on screen, if any. While open, you do not move. */
  readonly panel: PanelId | null;
  /** Set when the scene could not start (no WebGL); the Places list still works. */
  readonly sceneUnavailable: boolean;
}

/** Where the player stands and looks; written by the scene every frame. */
export const pose: { x: number; z: number; yaw: number; pitch: number } = { x: PLAYER.start.x, z: PLAYER.start.z, yaw: PLAYER.start.yaw, pitch: PLAYER.start.pitch };

let state: RoomState = { focus: null, panel: null, sceneUnavailable: false };
const listeners = new Set<() => void>();

function set(next: Partial<RoomState>): void {
  const merged = { ...state, ...next };
  if (merged.focus === state.focus && merged.panel === state.panel && merged.sceneUnavailable === state.sceneUnavailable) {
    return;
  }
  state = merged;
  for (const l of listeners) l();
}

export const roomStore = {
  get: (): RoomState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setFocus: (focus: InteractableId | null) => set({ focus }),
  openPanel: (panel: PanelId | null) => set({ panel }),
  setSceneUnavailable: (sceneUnavailable: boolean) => set({ sceneUnavailable }),
  /** For tests and a new game: back to the door, nothing open. */
  reset(): void {
    Object.assign(pose, { x: PLAYER.start.x, z: PLAYER.start.z, yaw: PLAYER.start.yaw, pitch: PLAYER.start.pitch });
    state = { focus: null, panel: null, sceneUnavailable: state.sceneUnavailable };
    for (const l of listeners) l();
  },
};

export function useRoom(): RoomState {
  return useSyncExternalStore(roomStore.subscribe, roomStore.get, roomStore.get);
}

/** Which panel an object opens; the door opens none (it leaves the room). */
export function panelFor(id: InteractableId): PanelId | null {
  switch (id) {
    case 'door':
      return null;
    case 'pc':
      return 'terminal';
    default:
      return id;
  }
}

// Development builds only: lets automated browser checks place the player.
// Stripped from production builds.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __nightArchiveRoom?: unknown }).__nightArchiveRoom = { pose, roomStore };
}
