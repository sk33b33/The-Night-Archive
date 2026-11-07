import type { CaseId } from '../domain/case';
import type { ResumePoint } from '../domain/save';

/**
 * Screen navigation model. Pure and framework-free so it can be tested
 * without React. The history is a stack; the main menu is always the root.
 */
export type Screen =
  | { readonly id: 'menu' }
  | { readonly id: 'archive' }
  | { readonly id: 'settings' }
  | { readonly id: 'briefing'; readonly caseId: CaseId };

export type ScreenId = Screen['id'];

export interface NavigationState {
  readonly stack: readonly Screen[];
}

export type NavigationAction =
  | { readonly type: 'navigate'; readonly to: Screen }
  | { readonly type: 'back' }
  | { readonly type: 'home' };

export const MENU: Screen = { id: 'menu' };
export const initialNavigation: NavigationState = { stack: [MENU] };

export function sameScreen(a: Screen, b: Screen): boolean {
  if (a.id !== b.id) return false;
  return a.id !== 'briefing' || (b.id === 'briefing' && a.caseId === b.caseId);
}

export function currentScreen(state: NavigationState): Screen {
  return state.stack[state.stack.length - 1] ?? MENU;
}

export function canGoBack(state: NavigationState): boolean {
  return state.stack.length > 1;
}

/** Validates an untrusted value (e.g. from history.state) as a Screen. */
export function parseScreen(value: unknown, isKnownCase: (id: string) => boolean): Screen | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  switch (record.id) {
    case 'menu':
    case 'archive':
    case 'settings':
      return { id: record.id };
    case 'briefing':
      return typeof record.caseId === 'string' && isKnownCase(record.caseId)
        ? { id: 'briefing', caseId: record.caseId as CaseId }
        : null;
    default:
      return null;
  }
}

/** The screen a player is on, if it is one Continue can return to. */
export function toResumePoint(screen: Screen): ResumePoint | null {
  if (screen.id === 'archive') return { screen: 'archive' };
  if (screen.id === 'briefing') return { screen: 'briefing', caseId: screen.caseId };
  return null;
}

/** The navigation stack Continue rebuilds for a saved resume point. */
export function stackForResume(point: ResumePoint): NavigationState {
  const archive: Screen = { id: 'archive' };
  return point.screen === 'briefing'
    ? { stack: [MENU, archive, { id: 'briefing', caseId: point.caseId }] }
    : { stack: [MENU, archive] };
}

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case 'navigate': {
      const { to } = action;
      if (sameScreen(currentScreen(state), to)) return state;
      if (to.id === 'menu') return initialNavigation;
      // Revisiting a screen already in the stack unwinds to it instead of
      // growing the history indefinitely.
      const existing = state.stack.findIndex((s) => sameScreen(s, to));
      if (existing >= 0) return { stack: state.stack.slice(0, existing + 1) };
      return { stack: [...state.stack, to] };
    }
    case 'back':
      return canGoBack(state) ? { stack: state.stack.slice(0, -1) } : state;
    case 'home':
      return initialNavigation;
  }
}
