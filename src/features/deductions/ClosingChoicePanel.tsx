import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import type { ClosingChoice } from '../../domain/case';

interface ClosingChoicePanelProps {
  readonly choice: ClosingChoice;
  /** The value already chosen in this save, if any. */
  readonly chosen: string | undefined;
  readonly onChoose: (value: string) => void;
}

/**
 * A one-time closing choice. Choosing an option asks for confirmation in
 * plain words; nothing is saved until it is confirmed. Once made, the
 * panel only reports what was chosen. No timer, and no option is marked
 * as right.
 */
export function ClosingChoicePanel({ choice, chosen, onChoose }: ClosingChoicePanelProps) {
  const id = useId();
  const [pending, setPending] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  /** Set when "Go back" is used, so focus returns to the options. */
  const returningRef = useRef(false);

  useEffect(() => {
    if (pending) {
      backRef.current?.focus();
    } else if (returningRef.current) {
      returningRef.current = false;
      optionsRef.current?.querySelector('button')?.focus();
    }
  }, [pending]);

  const made = choice.options.find((o) => o.value === chosen);
  const option = choice.options.find((o) => o.value === pending);

  return (
    <section className="panel closing-choice" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="panel__title">
        {choice.heading}
      </h2>
      {made ? (
        <p className="closing-choice__made" role="status">
          {made.label}. The shift is closed.
        </p>
      ) : (
        <>
          {choice.body.map((p) => (
            <p key={p} className="prose">
              {p}
            </p>
          ))}
          {option ? (
            <div className="confirm" role="group" aria-labelledby={`${id}-confirm`}>
              <p id={`${id}-confirm`} className="confirm__text">
                {option.consequence} This closes the shift and cannot be changed in this save.
              </p>
              <div className="confirm__actions">
                <Button
                  ref={backRef}
                  onClick={() => {
                    returningRef.current = true;
                    setPending(null);
                  }}
                >
                  Go back
                </Button>
                <Button variant="primary" onClick={() => onChoose(option.value)}>
                  Confirm: {option.label}
                </Button>
              </div>
            </div>
          ) : (
            <div className="closing-choice__options" ref={optionsRef}>
              {choice.options.map((o) => (
                <Button key={o.value} onClick={() => setPending(o.value)}>
                  {o.label}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
