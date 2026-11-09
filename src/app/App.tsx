import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ScreenRouter, shiftContents } from './ScreenRouter';
import { seasonOf } from '../domain/case';
import { operate, type CurrentCase, type RoomActions } from '../features/room/RoomScreen';
import { footageOf, workingCase } from './workingCase';
import type { InteractableId } from '../world/layout';
import { prefersReducedMotion } from '../services/preferences/motion';
import { caseMemory, roomStore, useRoom } from '../world/roomStore';
import { canDrawWorld } from '../world/webgl';

/** The 3D reading room and its engine load after the first screen is up. */
const World = lazy(() => import('../world/World'));

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

  /** Goes through several screens at once, so Back walks back through each. */
  const navigateThrough = useCallback(
    (screens: readonly Screen[]) => {
      let next = nav;
      for (const to of screens) {
        const step = navigationReducer(next, { type: 'navigate', to });
        if (step === next) continue;
        window.history.pushState(toHistoryState(step), '');
        next = step;
      }
      if (next !== nav) show(next);
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
  const room = useRoom();
  const [drawWorld] = useState(canDrawWorld);
  useEffect(() => roomStore.setSceneUnavailable(!drawWorld), [drawWorld]);
  const save = saveGame.state.status === 'ready' ? saveGame.state.save : null;
  const { cases, anomalies, statusOf, isClosed } = shiftContents(save);
  const inRoom = screen.id === 'archive';

  // Remember the case you open, so the room's case objects follow it.
  const screenCase = 'caseId' in screen ? screen.caseId : null;
  useEffect(() => {
    if (screenCase) caseMemory.set(screenCase);
  }, [screenCase]);
  const working = workingCase(save, cases, statusOf, screenCase ?? caseMemory.get());
  const footage = working ? footageOf(working, save, isClosed) : null;
  const current: CurrentCase | null = working ? { number: working.number, title: working.title } : null;
  const roomActions: RoomActions = {
    leave: () => navigate({ id: 'menu' }),
    ...(working && {
      openCaseFiles: () => navigate({ id: 'investigation', caseId: working.id }),
      openBoard: () => navigateThrough([{ id: 'investigation', caseId: working.id }, { id: 'board', caseId: working.id }]),
      openFindings: () =>
        navigateThrough([{ id: 'investigation', caseId: working.id }, { id: 'findings', caseId: working.id }]),
      ...(footage && {
        openFootage: () =>
          navigateThrough([
            { id: 'investigation', caseId: working.id },
            { id: 'evidence', caseId: working.id, evidenceId: footage },
          ]),
      }),
    }),
  };
  const actionsRef = useRef(roomActions);
  useEffect(() => {
    actionsRef.current = roomActions;
  });
  // A stable handler for the scene; it always uses the latest actions.
  const handleUse = useCallback((id: InteractableId) => operate(id, actionsRef.current), []);
  const shellClass = !drawWorld
    ? 'app-shell'
    : inRoom
      ? 'app-shell app-shell--room'
      : screen.id === 'menu'
        ? 'app-shell app-shell--title'
        : 'app-shell app-shell--overlay';

  return (
    <>
    {drawWorld && (
      <Suspense fallback={null}>
        <World
          active={inRoom && room.panel === null}
          backdrop={!inRoom}
          reduceMotion={prefersReducedMotion()}
          folders={[cases.filter((c) => seasonOf(c) === 1).length, cases.filter((c) => seasonOf(c) === 2).length]}
          unfiled={anomalies.length}
          workingCase={working ? { number: working.number, cards: working.evidence.length, footage: footage !== null } : null}
          onUse={handleUse}
        />
      </Suspense>
    )}
    <main className={shellClass} key={screenKey(screen)}>
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
        room={{ actions: roomActions, current }}
        createEngine={createEngine}
      />
    </main>
    </>
  );
}
