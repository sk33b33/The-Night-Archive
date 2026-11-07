/**
 * Screen navigation model. Pure and framework-free so it can be tested
 * without React. The history is a stack; the main menu is always the root.
 */
export const SCREEN_IDS = ['menu', 'archive', 'settings'] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export interface NavigationState {
  readonly stack: readonly ScreenId[];
}

export type NavigationAction =
  | { readonly type: 'navigate'; readonly to: ScreenId }
  | { readonly type: 'back' }
  | { readonly type: 'home' };

export const initialNavigation: NavigationState = { stack: ['menu'] };

export function currentScreen(state: NavigationState): ScreenId {
  return state.stack[state.stack.length - 1] ?? 'menu';
}

export function canGoBack(state: NavigationState): boolean {
  return state.stack.length > 1;
}

export function isScreenId(value: unknown): value is ScreenId {
  return typeof value === 'string' && (SCREEN_IDS as readonly string[]).includes(value);
}

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case 'navigate': {
      if (currentScreen(state) === action.to) return state;
      if (action.to === 'menu') return initialNavigation;
      // Revisiting a screen already in the stack unwinds to it instead of
      // growing the history indefinitely.
      const existing = state.stack.indexOf(action.to);
      if (existing >= 0) return { stack: state.stack.slice(0, existing + 1) };
      return { stack: [...state.stack, action.to] };
    }
    case 'back':
      return canGoBack(state) ? { stack: state.stack.slice(0, -1) } : state;
    case 'home':
      return initialNavigation;
  }
}
