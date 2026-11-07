import { useEffect, useRef, type ReactNode } from 'react';

interface ScreenLayoutProps {
  readonly title: string;
  readonly eyebrow?: string;
  readonly onBack?: () => void;
  readonly backLabel?: string;
  /** Move focus to the heading when the screen appears (after navigation). */
  readonly focusOnMount: boolean;
  readonly children: ReactNode;
}

export function ScreenLayout({
  title,
  eyebrow,
  onBack,
  backLabel = 'Back',
  focusOnMount,
  children,
}: ScreenLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <div className="screen">
      <header className="screen__header">
        {onBack && (
          <button type="button" className="back-button" onClick={onBack}>
            <span aria-hidden="true">←</span> {backLabel}
          </button>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 ref={headingRef} tabIndex={-1} className="screen__title">
          {title}
        </h1>
      </header>
      <div className="screen__body">{children}</div>
    </div>
  );
}
