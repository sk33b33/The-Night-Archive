import { useId } from 'react';

export interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
}

interface OptionGroupProps<T extends string> {
  readonly legend: string;
  readonly description?: string;
  readonly options: readonly Option<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/** A native radio group styled as large, touch-friendly choices. */
export function OptionGroup<T extends string>({
  legend,
  description,
  options,
  value,
  onChange,
}: OptionGroupProps<T>) {
  const name = useId();
  const descriptionId = `${name}-description`;
  return (
    <fieldset className="option-group" aria-describedby={description ? descriptionId : undefined}>
      <legend className="option-group__legend">{legend}</legend>
      {description && (
        <p id={descriptionId} className="option-group__description">
          {description}
        </p>
      )}
      <div className="option-group__options">
        {options.map((option) => (
          <label key={option.value} className="option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="option__text">
              <span className="option__label">{option.label}</span>
              {option.hint && <span className="option__hint">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
