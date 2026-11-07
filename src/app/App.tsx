import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CASES, findCase } from '../content/cases';
import { caseStatus } from '../domain/progress';
import { ArchiveScreen } from '../features/archive/ArchiveScreen';
import { BriefingScreen } from '../features/briefing/BriefingScreen';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
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
  stackForResume,
  toResumePoint,
  type NavigationState,
  type Screen,
} from './navigation';

interface AppProps {
  /** Injected in tests; defaults to IndexedDB in the browser. */
  readonly repository?: SaveRepository | null;
}

export function App({ repository }: AppProps) {
  const repo = useMemo(
    () => (repository === undefined ? browserRepository() : repository),
    [repository],
  );
  const [nav, setNav] = useState<NavigationState>(readInitialNavigation);
  // Only move focus after the player navigates, not on first load.
  const [hasNavigated, setHasNavigated] = useState(false);
  const { preferences, update, persistFailed } = usePreferences();
  const saveGame = useSaveGame(repo);
  const { visit } = saveGame;

  const show = useCallback(
    (next: NavigationState) => {
      setNav(next);
      setHasNavigated(true);
      const point = toResumePoint(currentScreen(next));
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

  const pushStack = useCallback(
    (next: NavigationState) => {
      if (next === nav) return;
      window.history.pushState(toHistoryState(next), '');
      show(next);
    },
    [nav, show],
  );

  const navigate = useCallback(
    (to: Screen) => pushStack(navigationReducer(nav, { type: 'navigate', to })),
    [nav, pushStack],
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

  // Visiting the archive starts a save if there is none (see useSaveGame.visit).
  const openArchive = () => navigate({ id: 'archive' });

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
  const notice = warningText ? (
    <p className="notice notice--warning" role="status">
      {warningText}
    </p>
  ) : undefined;
  const save = saveGame.state.status === 'ready' ? saveGame.state.save : null;
  const screen = currentScreen(nav);
  const key = screen.id === 'briefing' ? `briefing:${screen.caseId}` : screen.id;

  return (
    <main className="app-shell" key={key}>
      {screen.id === 'menu' && (
        <MainMenu
          focusOnMount={hasNavigated}
          saveState={saveGame.state}
          onContinue={continueShift}
          onOpenArchive={openArchive}
          onOpenSettings={() => navigate({ id: 'settings' })}
        />
      )}
      {screen.id === 'archive' && (
        <ArchiveScreen
          cases={CASES}
          statusOf={(id) => caseStatus(save, id)}
          onOpenCase={(caseId) => navigate({ id: 'briefing', caseId })}
          focusOnMount={hasNavigated}
          onBack={back}
          notice={notice}
        />
      )}
      {screen.id === 'briefing' && (
        <BriefingRoute caseId={screen.caseId} onBack={back} focusOnMount={hasNavigated} notice={notice} />
      )}
      {screen.id === 'settings' && (
        <SettingsScreen
          focusOnMount={hasNavigated}
          preferences={preferences}
          onChange={update}
          persistFailed={persistFailed}
          saveState={saveGame.state}
          onEraseProgress={saveGame.erase}
          onBack={back}
        />
      )}
    </main>
  );
}

interface BriefingRouteProps {
  readonly caseId: string;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice: ReactNode;
}

function BriefingRoute({ caseId, onBack, focusOnMount, notice }: BriefingRouteProps) {
  const caseFile = findCase(caseId);
  if (!caseFile) {
    return (
      <div className="empty-state" role="alert">
        <p className="empty-state__lead">File not found.</p>
        <p className="empty-state__body">This case file is not in the archive.</p>
        <button type="button" className="back-button" onClick={onBack}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>
    );
  }
  return (
    <BriefingScreen caseFile={caseFile} onBack={onBack} focusOnMount={focusOnMount} notice={notice} />
  );
}
