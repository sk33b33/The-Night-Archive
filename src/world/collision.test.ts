import { describe, expect, it } from 'vitest';
import { circleHitsBox, clampPitch, move, walkDelta } from './collision';
import { OBSTACLES, PLAYER, ROOM } from './layout';

describe('walking', () => {
  it('the start position is clear of walls and furniture', () => {
    const start = { x: PLAYER.start.x, z: PLAYER.start.z };
    expect(move(start, 0, 0)).toEqual(start);
    for (const box of OBSTACLES) expect(circleHitsBox(start, PLAYER.radius, box)).toBe(false);
  });

  it('stops at the walls', () => {
    const p = move({ x: 0, z: 0 }, 50, 0, PLAYER.radius, []);
    expect(p.x).toBeLessThanOrEqual(ROOM.maxX - PLAYER.radius);
    expect(p.x).toBeGreaterThan(ROOM.maxX - PLAYER.radius - 0.2);
  });

  it('slides along furniture instead of stopping dead', () => {
    const wall = { minX: -1, maxX: 1, minZ: -1, maxZ: -0.5 };
    // Walking diagonally into the box's front face keeps the sideways part.
    const p = move({ x: 0, z: 0 }, 0.5, -1, 0.3, [wall]);
    expect(p.x).toBeCloseTo(0.5);
    expect(p.z).toBeGreaterThanOrEqual(-0.5 + 0.3 - 1e-9);
  });

  it('cannot pass through thin furniture in one fast frame', () => {
    const thin = { minX: -1, maxX: 1, minZ: -0.55, maxZ: -0.5 };
    const p = move({ x: 0, z: 0 }, 0, -3, 0.3, [thin]);
    expect(p.z).toBeGreaterThan(-0.5);
  });

  it('yaw 0 walks towards the back wall; strafing goes right', () => {
    const f = walkDelta(1, 0, 0, 1);
    expect(f.x).toBeCloseTo(0);
    expect(f.z).toBeCloseTo(-1);
    const r = walkDelta(0, 1, 0, 1);
    expect(r.x).toBeCloseTo(1);
    expect(r.z).toBeCloseTo(0);
    // Diagonal input is not faster than straight input.
    const d = walkDelta(1, 1, 0, 1);
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1);
  });

  it('keeps the view from flipping over', () => {
    expect(clampPitch(10)).toBeLessThan(Math.PI / 2);
    expect(clampPitch(-10)).toBeGreaterThan(-Math.PI / 2);
    expect(clampPitch(0.3)).toBe(0.3);
  });
});
