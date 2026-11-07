import { CONTENT_INDEX } from '../content/cases';
import { initialNavigation, parseScreen, type NavigationState, type Screen } from './navigation';

/**
 * Navigation is mirrored into window.history so the Android back gesture and
 * browser back button move between screens, and a refresh keeps the player's
 * place instead of dropping them on the main menu.
 */
interface HistoryEntryState {
  readonly nightArchiveStack: readonly Screen[];
}

export function toHistoryState(state: NavigationState): HistoryEntryState {
  return { nightArchiveStack: state.stack.map((screen) => ({ ...screen })) };
}

/** Reads a navigation stack from history.state, rejecting anything malformed. */
export function fromHistoryState(raw: unknown): NavigationState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const stored = (raw as Record<string, unknown>).nightArchiveStack;
  if (!Array.isArray(stored) || stored.length === 0) return null;
  const stack: Screen[] = [];
  for (const entry of stored) {
    const screen = parseScreen(entry, CONTENT_INDEX);
    if (!screen) return null;
    stack.push(screen);
  }
  if (stack[0]?.id !== 'menu') return null;
  return { stack };
}

export function readInitialNavigation(): NavigationState {
  if (typeof window === 'undefined') return initialNavigation;
  return fromHistoryState(window.history.state) ?? initialNavigation;
}
