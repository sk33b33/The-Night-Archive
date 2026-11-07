import { initialNavigation, isScreenId, type NavigationState } from './navigation';

/**
 * Navigation is mirrored into window.history so the Android back gesture and
 * browser back button move between screens, and a refresh keeps the player's
 * place instead of dropping them on the main menu.
 */
interface HistoryEntryState {
  readonly nightArchiveStack: readonly string[];
}

export function toHistoryState(state: NavigationState): HistoryEntryState {
  return { nightArchiveStack: [...state.stack] };
}

/** Reads a navigation stack from history.state, rejecting anything malformed. */
export function fromHistoryState(raw: unknown): NavigationState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const stack = (raw as Record<string, unknown>).nightArchiveStack;
  if (!Array.isArray(stack) || stack.length === 0) return null;
  if (stack[0] !== 'menu' || !stack.every(isScreenId)) return null;
  return { stack };
}

export function readInitialNavigation(): NavigationState {
  if (typeof window === 'undefined') return initialNavigation;
  return fromHistoryState(window.history.state) ?? initialNavigation;
}
