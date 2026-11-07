import { useEffect, useRef } from 'react';
import { Button } from '../../components/Button';
import type { SaveState } from '../../services/persistence/useSaveGame';
import { continueUnavailableReason } from '../../services/persistence/saveMessages';

interface MainMenuProps {
  readonly saveState: SaveState;
  readonly onContinue: () => void;
  readonly onOpenArchive: () => void;
  readonly onOpenSettings: () => void;
  readonly focusOnMount: boolean;
}

export function MainMenu({
  saveState,
  onContinue,
  onOpenArchive,
  onOpenSettings,
  focusOnMount,
}: MainMenuProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus();
  }, [focusOnMount]);

  const loading = saveState.status === 'loading';
  const hasSave = saveState.status === 'ready' && saveState.save !== null;
  // Starting a shift before the stored save has loaded could overwrite it.
  const loadingReason = loading ? 'Opening the archive…' : undefined;

  return (
    <div className="main-menu">
      <div className="main-menu__brand">
        <p className="eyebrow">Records Facility · Night Shift</p>
        <h1 className="main-menu__title" tabIndex={-1} ref={titleRef}>
          The Night Archive
        </h1>
        <p className="main-menu__tagline">
          Every file has a story. Some stories refuse to stay buried.
        </p>
      </div>

      <nav className="main-menu__actions" aria-label="Main menu" aria-busy={loading}>
        {hasSave ? (
          <>
            <Button variant="primary" onClick={onContinue}>
              Continue
            </Button>
            <Button onClick={onOpenArchive}>Archive dashboard</Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={onOpenArchive} disabledReason={loadingReason}>
              Begin shift
            </Button>
            {!loading && (
              <Button disabledReason={continueUnavailableReason(saveState)}>Continue</Button>
            )}
          </>
        )}
        <Button onClick={onOpenSettings}>Settings</Button>
      </nav>
    </div>
  );
}
