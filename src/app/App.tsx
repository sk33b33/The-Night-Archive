import { useCallback, useEffect, useMemo, useState } from 'react';
import { saveWarning } from '../services/persistence/saveMessages';
import { browserRepository, type SaveRepository } from '../services/persistence/saveRepository';
import { useSaveGame } from '../services/persistence/useSaveGame';
import { usePreferences } from '../services/preferences/usePreferences';
import { fromHistoryState, readInitialNavigation, toHistoryState } from './historySync';
import {
  canGoBack,
  currentScreen,
  initialNavigation,
  navigationReducer,
  screenKey,
  stackForResume,
  toResumePoint,
  type NavigationState,
  type Screen,
} from './navigation';
import type { EngineFactory } from '../features/evidence/audio/useReelPlayer';
import { ScreenRouter } from './ScreenRouter';

interface AppProps {
  /** Injected in tests; defaults to IndexedDB in the browser. */
  readonly repository?: SaveRepository | null;
  /** Injected in tests; defaults to Web Audio. */
  readonly createEngine?: EngineFactory;
}

/** Owns navigation and wires history, saves, and preferences to the screens. */
export function App({ repository, createEngine }: AppProps) {
  const repo = useMemo(
    () => (repository === undefined ? browserRepository() : repository),
    [repository],
  );
  const [nav, setNav] = useState<NavigationState>(readInitialNavigation);
  // Only move focus after the player navigates, not on first load.
  const [hasNavigated, setHasNavigated] = useState(false);
  const preferences = usePreferences();
  const saveGame = useSaveGame(repo);
  const { visit } = saveGame;

  const show = useCallback(
    (next: NavigationState) => {
      setNav(next);
      setHasNavigated(true);
      const point = toResumePoint(currentScreen(next));
      // Visiting a resumable screen starts a save if there is none.
      if (point) visit(point);
    },
    [visit],
  );

  useEffect(() => {
    window.history.replaceState(toHistoryState(nav), '');
    const onPopState = (event: PopStateEvent) => {
      show(fromHistoryState(event.state) ?? initialNavigation);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // Seeds the current history entry once; later entries are pushed on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const navigate = useCallback(
    (to: Screen) => {
      const next = navigationReducer(nav, { type: 'navigate', to });
      if (next === nav) return;
      window.history.pushState(toHistoryState(next), '');
      show(next);
    },
    [nav, show],
  );

  const back = useCallback(() => {
    if (!canGoBack(nav)) return;
    // Defer to the browser so in-app and system back stay in step; the
    // popstate listener applies the previous stack.
    if (fromHistoryState(window.history.state)) {
      window.history.back();
    } else {
      show(navigationReducer(nav, { type: 'back' }));
    }
  }, [nav, show]);

  const continueShift = () => {
    const state = saveGame.state;
    if (state.status !== 'ready' || !state.save) return;
    // Rebuild the screens leading to the resume point so Back still works.
    const target = stackForResume(state.save.resume);
    for (let depth = 2; depth <= target.stack.length; depth++) {
      window.history.pushState(toHistoryState({ stack: target.stack.slice(0, depth) }), '');
    }
    show(target);
  };

  const warningText = saveWarning(saveGame.state);
  const screen = currentScreen(nav);

  return (
    <main
      className={screen.id === 'board' ? 'app-shell app-shell--wide' : 'app-shell'}
      key={screenKey(screen)}
    >
      <ScreenRouter
        screen={screen}
        focusOnMount={hasNavigated}
        saveGame={saveGame}
        preferences={preferences}
        notice={
          warningText ? (
            <p className="notice notice--warning" role="status">
              {warningText}
            </p>
          ) : undefined
        }
        navigate={navigate}
        back={back}
        onContinue={continueShift}
        createEngine={createEngine}
      />
    </main>
  );
}
