import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import type { SaveState } from '../../services/persistence/useSaveGame';

interface SavedProgressPanelProps {
  readonly saveState: SaveState;
  readonly onErase: () => Promise<boolean>;
}

type Phase = 'idle' | 'confirming' | 'erasing' | 'erased' | 'failed';

function eraseUnavailableReason(state: SaveState): string | undefined {
  if (state.status === 'loading') return 'Checking for saved progress…';
  if (state.problem === 'newer-version') {
    return 'This save was made by a newer version of the archive. Reload the page to update first.';
  }
  if (state.problem === 'unavailable') return 'This browser is not allowing storage.';
  if (state.save === null && state.problem !== 'corrupt') return 'There is no saved progress to erase.';
  return undefined;
}

export function SavedProgressPanel({ saveState, onErase }: SavedProgressPanelProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === 'confirming') cancelRef.current?.focus();
  }, [phase]);

  const erase = async () => {
    setPhase('erasing');
    setPhase((await onErase()) ? 'erased' : 'failed');
  };

  return (
    <section className="panel" aria-labelledby="saved-progress-heading">
      <h2 id="saved-progress-heading" className="panel__title">
        Saved progress
      </h2>
      <p className="prose">
        Your shift is saved automatically on this device as you move through the archive.
      </p>

      {phase === 'confirming' || phase === 'erasing' ? (
        <div className="confirm" role="group" aria-labelledby="erase-confirm-text">
          <p id="erase-confirm-text" className="confirm__text">
            Erase all saved progress? This cannot be undone.
          </p>
          <div className="confirm__actions">
            <Button
              ref={cancelRef}
              onClick={() => setPhase('idle')}
              disabledReason={phase === 'erasing' ? 'Erasing…' : undefined}
            >
              Keep progress
            </Button>
            <Button
              variant="danger"
              onClick={() => void erase()}
              disabledReason={phase === 'erasing' ? 'Erasing…' : undefined}
            >
              Erase progress
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="danger"
          onClick={() => setPhase('confirming')}
          disabledReason={eraseUnavailableReason(saveState)}
        >
          Erase saved progress
        </Button>
      )}

      {phase === 'erased' && (
        <p className="notice" role="status">
          Saved progress erased.
        </p>
      )}
      {phase === 'failed' && (
        <p className="notice notice--warning" role="alert">
          Saved progress could not be erased. Try again, or clear this site's data in your
          browser settings.
        </p>
      )}
    </section>
  );
}
