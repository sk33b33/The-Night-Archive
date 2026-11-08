import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { clampPitch, move, walkDelta } from './collision';
import { PLAYER, type InteractableId } from './layout';
import { pose, roomStore } from './roomStore';

interface PlayerControllerProps {
  /** False while a screen or panel is over the room: no walking, no looking. */
  readonly active: boolean;
  readonly onUse: (id: InteractableId) => void;
}

const LOOK_SPEED = 0.0024;
const TOUCH_LOOK_SPEED = 0.006;
const STICK_RADIUS = 56;
/** Where focus is looked for, in screen space: the centre first, then just around and below it. */
const AIM_RAYS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, -0.12],
  [-0.08, -0.06],
  [0.08, -0.06],
  [0, -0.24],
];

/** The interactable a mesh (or any of its parents) belongs to. */
function interactableOf(object: THREE.Object3D | null): InteractableId | null {
  for (let o = object; o; o = o.parent) {
    const id = o.userData.interactable as InteractableId | undefined;
    if (id) return id;
  }
  return null;
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * First-person free roam.
 * - Keyboard: W A S D to walk and strafe; arrow keys walk and turn; R and F
 *   look up and down; E uses.
 * - Mouse: click the room to look with the mouse (pointer lock); click uses.
 *   Esc gives the pointer back.
 * - Touch: drag the left half to walk (a virtual stick), drag the right half
 *   to look, tap an object to use it.
 */
export function PlayerController({ active, onUse }: PlayerControllerProps) {
  const { camera, gl, scene } = useThree();
  const keys = useRef(new Set<string>());
  const stick = useRef<{ id: number; x: number; y: number; dx: number; dy: number } | null>(null);
  const lookTouch = useRef<{ id: number; x: number; y: number; startX: number; startY: number; at: number } | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const frame = useRef(0);
  const activeRef = useRef(active);
  const onUseRef = useRef(onUse);

  useEffect(() => {
    activeRef.current = active;
    onUseRef.current = onUse;
    if (!active) {
      keys.current.clear();
      stick.current = null;
      lookTouch.current = null;
      roomStore.setFocus(null);
      if (document.pointerLockElement === gl.domElement) document.exitPointerLock();
    }
  }, [active, onUse, gl]);

  useEffect(() => {
    const canvas = gl.domElement;

    const pick = (ndcX: number, ndcY: number): InteractableId | null => {
      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      raycaster.current.far = PLAYER.reach;
      const hit = raycaster.current.intersectObjects(scene.children, true)[0];
      return hit ? interactableOf(hit.object) : null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current || isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      const key = e.key.toLowerCase();
      if (key === 'e' || (key === 'enter' && e.target === canvas)) {
        const focus = roomStore.get().focus;
        if (focus) {
          e.preventDefault();
          onUseRef.current(focus);
        }
        return;
      }
      if (['w', 'a', 's', 'd', 'r', 'f', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        // Arrow keys would otherwise scroll the page.
        if (key.startsWith('arrow')) e.preventDefault();
        keys.current.add(key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const onBlur = () => keys.current.clear();

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas || !activeRef.current) return;
      pose.yaw -= e.movementX * LOOK_SPEED;
      pose.pitch = clampPitch(pose.pitch - e.movementY * LOOK_SPEED);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!activeRef.current) return;
      if (e.pointerType === 'mouse') {
        if (document.pointerLockElement === canvas) {
          const focus = roomStore.get().focus;
          if (focus) onUseRef.current(focus);
        } else {
          // Fails quietly where pointer lock is unavailable; keys still turn.
          void Promise.resolve(canvas.requestPointerLock?.()).catch(() => undefined);
        }
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const local = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (local.x < rect.width * 0.45 && !stick.current) {
        stick.current = { id: e.pointerId, x: local.x, y: local.y, dx: 0, dy: 0 };
      } else if (!lookTouch.current) {
        lookTouch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, at: performance.now() };
      }
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const s = stick.current;
      if (s && s.id === e.pointerId) {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left - s.x;
        const dy = e.clientY - rect.top - s.y;
        const length = Math.hypot(dx, dy);
        const scale = length > STICK_RADIUS ? STICK_RADIUS / length : 1;
        s.dx = (dx * scale) / STICK_RADIUS;
        s.dy = (dy * scale) / STICK_RADIUS;
      }
      const l = lookTouch.current;
      if (l && l.id === e.pointerId) {
        pose.yaw -= (e.clientX - l.x) * TOUCH_LOOK_SPEED;
        pose.pitch = clampPitch(pose.pitch - (e.clientY - l.y) * TOUCH_LOOK_SPEED);
        l.x = e.clientX;
        l.y = e.clientY;
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const s = stick.current;
      const l = lookTouch.current;
      const tapAt = (x: number, y: number) => {
        const rect = canvas.getBoundingClientRect();
        const id = pick(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
        if (id && activeRef.current) onUseRef.current(id);
      };
      if (s && s.id === e.pointerId) {
        // A tap on the left half (no real drag) still uses what was tapped.
        if (Math.hypot(s.dx, s.dy) < 0.15) tapAt(e.clientX, e.clientY);
        stick.current = null;
      }
      if (l && l.id === e.pointerId) {
        const still = Math.hypot(e.clientX - l.startX, e.clientY - l.startY) < 10;
        if (still && performance.now() - l.at < 350) tapAt(e.clientX, e.clientY);
        lookTouch.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [camera, gl, scene]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    if (activeRef.current) {
      const k = keys.current;
      let forward = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
      let strafe = (k.has('d') ? 1 : 0) - (k.has('a') ? 1 : 0);
      const turn = (k.has('arrowleft') ? 1 : 0) - (k.has('arrowright') ? 1 : 0);
      pose.yaw += turn * PLAYER.turnSpeed * dt;
      const tilt = (k.has('r') ? 1 : 0) - (k.has('f') ? 1 : 0);
      pose.pitch = clampPitch(pose.pitch + tilt * PLAYER.tiltSpeed * dt);
      const s = stick.current;
      if (s) {
        forward += -s.dy;
        strafe += s.dx;
      }
      const delta = walkDelta(forward, strafe, pose.yaw, PLAYER.walkSpeed * dt);
      const next = move(pose, delta.x, delta.z);
      pose.x = next.x;
      pose.z = next.z;
    }

    camera.position.set(pose.x, PLAYER.eyeHeight, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');

    // What is in front of you, checked a few times a second.
    frame.current = (frame.current + 1) % 4;
    if (frame.current === 0 && activeRef.current) {
      // The centre first, then a little below it: objects on a desk are
      // easy to aim at without lining up the dot exactly.
      let found: InteractableId | null = null;
      for (const [x, y] of AIM_RAYS) {
        raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
        raycaster.current.far = PLAYER.reach;
        const hit = raycaster.current.intersectObjects(scene.children, true)[0];
        found = hit ? interactableOf(hit.object) : null;
        if (found) break;
      }
      roomStore.setFocus(found);
    }
  });

  return null;
}
