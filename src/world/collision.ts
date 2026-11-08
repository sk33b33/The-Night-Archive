import { OBSTACLES, PLAYER, ROOM, type Box2 } from './layout';

/**
 * Walking rules. Pure: the player is a circle on the floor plane that
 * stays inside the room and out of furniture, sliding along whatever it
 * touches instead of stopping dead.
 */

export interface Position {
  readonly x: number;
  readonly z: number;
}

export function circleHitsBox(p: Position, radius: number, box: Box2): boolean {
  const cx = Math.max(box.minX, Math.min(p.x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(p.z, box.maxZ));
  const dx = p.x - cx;
  const dz = p.z - cz;
  return dx * dx + dz * dz < radius * radius;
}

function blocked(p: Position, radius: number, obstacles: readonly Box2[]): boolean {
  if (p.x - radius < ROOM.minX || p.x + radius > ROOM.maxX) return true;
  if (p.z - radius < ROOM.minZ || p.z + radius > ROOM.maxZ) return true;
  return obstacles.some((box) => circleHitsBox(p, radius, box));
}

/**
 * Moves by (dx, dz), one axis at a time, so a blocked axis slides along
 * the other. Steps are split so a fast frame cannot pass through thin
 * furniture.
 */
export function move(
  from: Position,
  dx: number,
  dz: number,
  radius: number = PLAYER.radius,
  obstacles: readonly Box2[] = OBSTACLES,
): Position {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / (radius / 2)));
  let p = from;
  for (let i = 0; i < steps; i++) {
    const nx = { x: p.x + dx / steps, z: p.z };
    if (!blocked(nx, radius, obstacles)) p = nx;
    const nz = { x: p.x, z: p.z + dz / steps };
    if (!blocked(nz, radius, obstacles)) p = nz;
  }
  return p;
}

/**
 * The walking vector for this frame from movement input (forward and
 * strafe in -1..1) and the view's yaw. Yaw 0 looks towards -z.
 */
export function walkDelta(forward: number, strafe: number, yaw: number, distance: number): Position {
  const length = Math.hypot(forward, strafe);
  if (length === 0) return { x: 0, z: 0 };
  const f = forward / Math.max(1, length);
  const s = strafe / Math.max(1, length);
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  // Forward is (-sin, -cos); right is (cos, -sin).
  return {
    x: (-sin * f + cos * s) * distance,
    z: (-cos * f - sin * s) * distance,
  };
}

/** Keeps vertical look within a comfortable range. */
export function clampPitch(pitch: number): number {
  const limit = Math.PI / 2 - 0.15;
  return Math.max(-limit, Math.min(limit, pitch));
}
