import { useRegisterSW } from 'virtual:pwa-register/react';

export interface ServiceWorkerStatus {
  readonly needRefresh: boolean;
  readonly offlineReady: boolean;
  readonly update: () => void;
  readonly dismiss: () => void;
}

/** Real service-worker registration (vite-plugin-pwa). */
export function useServiceWorker(): ServiceWorkerStatus {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();
  return {
    needRefresh,
    offlineReady,
    update: () => void updateServiceWorker(true),
    dismiss: () => {
      setNeedRefresh(false);
      setOfflineReady(false);
    },
  };
}

interface UpdatePromptProps {
  /** Injected in tests; defaults to the real registration. */
  readonly useStatus?: () => ServiceWorkerStatus;
}

/**
 * Tells the player when the archive can work offline, and asks before
 * switching to a new version. Saves are written as play happens, so
 * reloading to update does not lose progress.
 */
export function UpdatePrompt({ useStatus = useServiceWorker }: UpdatePromptProps) {
  const { needRefresh, offlineReady, update, dismiss } = useStatus();
  if (!needRefresh && !offlineReady) return null;
  return (
    <div className="update-banner" role="status">
      <p className="update-banner__text">
        {needRefresh
          ? 'A new version of the archive is available. Your progress is saved.'
          : 'The archive is ready to work offline.'}
      </p>
      <div className="update-banner__actions">
        {needRefresh && (
          <button type="button" className="btn btn--primary" onClick={update}>
            Update now
          </button>
        )}
        <button type="button" className="btn btn--quiet" onClick={dismiss}>
          {needRefresh ? 'Later' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
}
