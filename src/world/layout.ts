/**
 * The reading room as data, in metres. +x is to the right as you enter,
 * -z is towards the back wall and your desk (NA-07), y is up. Pure: the
 * scene draws from these numbers, and collision and tests read them too.
 */

export interface Box2 {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export const ROOM = {
  minX: -4,
  maxX: 4,
  minZ: -3,
  maxZ: 3,
  height: 3,
} as const;

export const PLAYER = {
  radius: 0.28,
  eyeHeight: 1.6,
  /** Metres per second. */
  walkSpeed: 1.9,
  /** Radians per second, for keyboard turning. */
  turnSpeed: 1.9,
  /** How far away an object can be used from, measured from the eye. */
  reach: 2.3,
  /** Looking slightly down, at desk height across the room. */
  start: { x: 0.6, z: 2.1, yaw: 0, pitch: -0.22 },
  /** Radians per second, for keyboard looking up and down. */
  tiltSpeed: 1.2,
} as const;

/** Kenney Furniture Kit models are about half real scale. */
export const KIT_SCALE = 2;

export type InteractableId = 'pc' | 'drawer-1' | 'drawer-2' | 'tray' | 'door';

export interface Interactable {
  readonly id: InteractableId;
  /** What it is, as read in the Places list and the prompt. */
  readonly name: string;
  /** What using it does. */
  readonly action: string;
}

export const INTERACTABLES: readonly Interactable[] = [
  { id: 'pc', name: 'Desk computer, NA-07', action: 'Open the archive terminal' },
  { id: 'drawer-1', name: 'Filing cabinet, Season 1 drawer', action: 'Open the drawer' },
  { id: 'drawer-2', name: 'Filing cabinet, Season 2 drawer', action: 'Open the drawer' },
  { id: 'tray', name: 'Unfiled tray', action: 'Look through the tray' },
  { id: 'door', name: 'Reading room door', action: 'Leave the reading room' },
];

export function interactable(id: InteractableId): Interactable {
  const found = INTERACTABLES.find((i) => i.id === id);
  if (!found) throw new Error(`Unknown interactable ${id}`);
  return found;
}

/** Desk tops are at this height (Kenney desk 0.384 × scale). */
export const DESK_TOP = 0.384 * KIT_SCALE;

export const DESKS = [
  { label: 'NA-06', x: -2.6, z: -2.55, own: false },
  { label: 'NA-07', x: 0, z: -2.55, own: true },
  { label: 'NA-08', x: 2.6, z: -2.55, own: false },
] as const;

export const CABINET = {
  /** Centre of the cabinet's front face. */
  x: ROOM.minX + 0.62,
  z: 0.2,
  width: 0.5,
  depth: 0.62,
  height: 1.34,
  drawers: 4,
  /** How far an open drawer slides out (along +x). */
  slide: 0.42,
} as const;

export const DOOR = { x: -1.9, width: 1.0, height: 2.1 } as const;

export const TRAY = { x: 0.52, z: -2.42 } as const;

/** Where a desk's chair stands: tucked in, or pushed aside at your own desk. */
export function chairSpot(desk: { readonly x: number; readonly z: number; readonly own: boolean }) {
  return desk.own ? { x: desk.x + 0.95, z: desk.z + 0.75, yaw: Math.PI - 0.7 } : { x: desk.x, z: desk.z + 0.62, yaw: Math.PI };
}

function chairBox(desk: { readonly x: number; readonly z: number; readonly own: boolean }): Box2 {
  const c = chairSpot(desk);
  return { minX: c.x - 0.3, maxX: c.x + 0.3, minZ: c.z - 0.28, maxZ: c.z + 0.28 };
}

/** Solid furniture the player cannot walk through. */
export const OBSTACLES: readonly Box2[] = [
  // Desks, against the back wall (Kenney desk: 1.45 m wide, 0.78 m deep).
  ...DESKS.map((d) => ({ minX: d.x - 0.74, maxX: d.x + 0.74, minZ: ROOM.minZ, maxZ: d.z + 0.42 })),
  // Desk chairs (yours is pushed back to the right, so the desk is clear).
  ...DESKS.map((d) => chairBox(d)),
  // Filing cabinet on the left wall.
  { minX: ROOM.minX, maxX: CABINET.x, minZ: CABINET.z - CABINET.width / 2, maxZ: CABINET.z + CABINET.width / 2 },
  // Bookcases on the right wall.
  { minX: ROOM.maxX - 0.5, maxX: ROOM.maxX, minZ: -1.6, maxZ: 1.4 },
  // Monitor table, front right.
  { minX: 2.6, maxX: 3.6, minZ: 1.9, maxZ: 2.8 },
  // Plant, back left corner.
  { minX: -3.85, maxX: -3.35, minZ: -2.9, maxZ: -2.4 },
  // Coat stand by the door.
  { minX: -3.65, maxX: -3.15, minZ: 2.35, maxZ: 2.85 },
];
