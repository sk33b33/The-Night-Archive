import { useEffect, useRef } from 'react';
import { Button } from '../../components/Button';

interface MainMenuProps {
  readonly onBeginShift: () => void;
  readonly onOpenSettings: () => void;
  readonly focusOnMount: boolean;
}

export function MainMenu({ onBeginShift, onOpenSettings, focusOnMount }: MainMenuProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus();
  }, [focusOnMount]);

  return (
    <div className="main-menu">
      <div className="main-menu__brand">
        <p className="eyebrow">Records Facility · Night Shift</p>
        <h1
          className="main-menu__title"
          tabIndex={-1}
          ref={titleRef}
        >
          The Night Archive
        </h1>
        <p className="main-menu__tagline">
          Every file has a story. Some stories refuse to stay buried.
        </p>
      </div>

      <nav className="main-menu__actions" aria-label="Main menu">
        <Button variant="primary" onClick={onBeginShift}>
          Begin shift
        </Button>
        <Button disabledReason="No saved shift on this device yet. Saving arrives with the first case.">
          Continue
        </Button>
        <Button onClick={onOpenSettings}>Settings</Button>
      </nav>
    </div>
  );
}
