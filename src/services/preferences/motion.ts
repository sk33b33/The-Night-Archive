/**
 * Whether motion should be reduced right now: the player's setting wins;
 * "Match device" follows the system preference.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  const setting = document.documentElement.dataset.motion;
  if (setting === 'reduced') return true;
  if (setting === 'full') return false;
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}
