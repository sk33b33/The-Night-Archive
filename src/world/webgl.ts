/**
 * Whether this device can draw the 3D reading room. Checked without loading
 * the engine. Where it cannot (very old devices, the test runner), the room
 * is not drawn and every object is reached from the Places list instead.
 */
export function canDrawWorld(): boolean {
  if (typeof window === 'undefined' || typeof window.WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
