import type { CaseId } from '../domain/case';
import type { EvidenceId } from '../domain/evidence';
import type { ContentIndex, ResumePoint } from '../domain/save';

/**
 * Screen navigation model. Pure and framework-free so it can be tested
 * without React. The history is a stack; the main menu is always the root.
 */
export type Screen =
  | { readonly id: 'menu' }
  | { readonly id: 'archive' }
  | { readonly id: 'settings' }
  | { readonly id: 'briefing'; readonly caseId: CaseId }
  | { readonly id: 'investigation'; readonly caseId: CaseId }
  | { readonly id: 'board'; readonly caseId: CaseId }
  | { readonly id: 'evidence'; readonly caseId: CaseId; readonly evidenceId: EvidenceId };

export type ScreenId = Screen['id'];

export interface NavigationState {
  readonly stack: readonly Screen[];
}

export type NavigationAction =
  | { readonly type: 'navigate'; readonly to: Screen }
  | { readonly type: 'back' }
  | { readonly type: 'home' };

export const MENU: Screen = { id: 'menu' };
const ARCHIVE: Screen = { id: 'archive' };
export const initialNavigation: NavigationState = { stack: [MENU] };

/** A stable string key per screen, also used as the React key. */
export function screenKey(screen: Screen): string {
  switch (screen.id) {
    case 'briefing':
    case 'investigation':
    case 'board':
      return `${screen.id}:${screen.caseId}`;
    case 'evidence':
      return `evidence:${screen.caseId}:${screen.evidenceId}`;
    default:
      return screen.id;
  }
}

export function sameScreen(a: Screen, b: Screen): boolean {
  return screenKey(a) === screenKey(b);
}

export function currentScreen(state: NavigationState): Screen {
  return state.stack[state.stack.length - 1] ?? MENU;
}

export function canGoBack(state: NavigationState): boolean {
  return state.stack.length > 1;
}

/** Validates an untrusted value (e.g. from history.state) as a Screen. */
export function parseScreen(value: unknown, content: ContentIndex): Screen | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  switch (record.id) {
    case 'menu':
    case 'archive':
    case 'settings':
      return { id: record.id };
    case 'briefing':
    case 'investigation':
    case 'board':
    case 'evidence': {
      const caseIdValue = record.caseId;
      if (typeof caseIdValue !== 'string' || !content.isKnownCase(caseIdValue)) return null;
      const id = caseIdValue as CaseId;
      if (record.id !== 'evidence') return { id: record.id, caseId: id };
      const evidenceIdValue = record.evidenceId;
      if (typeof evidenceIdValue !== 'string' || !content.isKnownEvidence(id, evidenceIdValue)) {
        return null;
      }
      return { id: 'evidence', caseId: id, evidenceId: evidenceIdValue as EvidenceId };
    }
    default:
      return null;
  }
}

/** The screen a player is on, if it is one Continue can return to. */
export function toResumePoint(screen: Screen): ResumePoint | null {
  switch (screen.id) {
    case 'archive':
      return { screen: 'archive' };
    case 'briefing':
    case 'investigation':
    case 'board':
      return { screen: screen.id, caseId: screen.caseId };
    case 'evidence':
      return { screen: 'evidence', caseId: screen.caseId, evidenceId: screen.evidenceId };
    default:
      return null;
  }
}

/**
 * The navigation stack Continue rebuilds for a saved resume point, so Back
 * walks up through the case: evidence → workspace → archive → menu.
 */
export function stackForResume(point: ResumePoint): NavigationState {
  switch (point.screen) {
    case 'archive':
      return { stack: [MENU, ARCHIVE] };
    case 'briefing':
      return { stack: [MENU, ARCHIVE, { id: 'briefing', caseId: point.caseId }] };
    case 'investigation':
      return { stack: [MENU, ARCHIVE, { id: 'investigation', caseId: point.caseId }] };
    case 'board':
      return {
        stack: [
          MENU,
          ARCHIVE,
          { id: 'investigation', caseId: point.caseId },
          { id: 'board', caseId: point.caseId },
        ],
      };
    case 'evidence':
      return {
        stack: [
          MENU,
          ARCHIVE,
          { id: 'investigation', caseId: point.caseId },
          { id: 'evidence', caseId: point.caseId, evidenceId: point.evidenceId },
        ],
      };
  }
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
