import { useCallback, useEffect, useState } from 'react';
import { ArchiveScreen } from '../features/archive/ArchiveScreen';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { usePreferences } from '../services/preferences/usePreferences';
import { fromHistoryState, readInitialNavigation, toHistoryState } from './historySync';
import {
  canGoBack,
  currentScreen,
  initialNavigation,
  navigationReducer,
  type NavigationState,
  type ScreenId,
} from './navigation';

export function App() {
  const [nav, setNav] = useState<NavigationState>(readInitialNavigation);
  // Only move focus after the player navigates, not on first load.
  const [hasNavigated, setHasNavigated] = useState(false);
  const { preferences, update, persistFailed } = usePreferences();

  useEffect(() => {
    window.history.replaceState(toHistoryState(nav), '');
    const onPopState = (event: PopStateEvent) => {
      setNav(fromHistoryState(event.state) ?? initialNavigation);
      setHasNavigated(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // Runs once: seeds the current history entry with the restored stack.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback(
    (to: ScreenId) => {
      const next = navigationReducer(nav, { type: 'navigate', to });
      if (next === nav) return;
      window.history.pushState(toHistoryState(next), '');
      setNav(next);
      setHasNavigated(true);
    },
    [nav],
  );

  const back = useCallback(() => {
    if (!canGoBack(nav)) return;
    // Defer to the browser so in-app and system back stay in step; the
    // popstate listener applies the previous stack.
    if (fromHistoryState(window.history.state)) {
      window.history.back();
    } else {
      setNav(navigationReducer(nav, { type: 'back' }));
      setHasNavigated(true);
    }
  }, [nav]);

  const screen = currentScreen(nav);

  return (
    <main className="app-shell" key={screen}>
      {screen === 'menu' && (
        <MainMenu
          focusOnMount={hasNavigated}
          onBeginShift={() => navigate('archive')}
          onOpenSettings={() => navigate('settings')}
        />
      )}
      {screen === 'archive' && <ArchiveScreen focusOnMount={hasNavigated} onBack={back} />}
      {screen === 'settings' && (
        <SettingsScreen
          focusOnMount={hasNavigated}
          preferences={preferences}
          onChange={update}
          persistFailed={persistFailed}
          onBack={back}
        />
      )}
    </main>
  );
}
