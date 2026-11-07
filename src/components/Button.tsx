import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
  /**
   * When set, the button is disabled and this text is shown beneath it and
   * announced to assistive technology. Every disabled control must explain why.
   */
  readonly disabledReason?: string;
}

/**
 * Disabled buttons use aria-disabled rather than the native attribute so they
 * remain focusable and their explanation can still be reached by keyboard and
 * screen-reader users.
 */
export function Button({
  variant = 'secondary',
  disabledReason,
  onClick,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const reasonId = useId();
  const disabled = disabledReason !== undefined;
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');

  const button = (
    <button
      {...rest}
      type={type}
      className={classes}
      aria-disabled={disabled || undefined}
      aria-describedby={disabled ? reasonId : rest['aria-describedby']}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );

  if (!disabled) return button;
  return (
    <div className="btn-with-reason">
      {button}
      <p id={reasonId} className="btn-reason">
        {disabledReason}
      </p>
    </div>
  );
}
