import { useCallback, useEffect, useRef, useState } from 'react';
import {
  browserStore,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './preferences';

export interface PreferencesController {
  readonly preferences: Preferences;
  readonly update: (patch: Partial<Preferences>) => void;
  /** True when the last change could not be saved to this device. */
  readonly persistFailed: boolean;
}

/** Applies preferences to the document root so CSS can respond to them. */
function applyToDocument(prefs: Preferences): void {
  const root = document.documentElement;
  root.dataset.motion = prefs.motion;
  root.dataset.textSize = prefs.textSize;
}

export function usePreferences(): PreferencesController {
  const [preferences, setPreferences] = useState<Preferences>(() =>
    loadPreferences(browserStore()),
  );
  const [persistFailed, setPersistFailed] = useState(false);
  const changedByPlayer = useRef(false);

  useEffect(() => {
    applyToDocument(preferences);
    if (changedByPlayer.current) {
      setPersistFailed(!savePreferences(browserStore(), preferences));
    }
  }, [preferences]);

  const update = useCallback((patch: Partial<Preferences>) => {
    changedByPlayer.current = true;
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  return { preferences, update, persistFailed };
}
