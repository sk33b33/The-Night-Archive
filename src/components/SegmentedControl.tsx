import { useId } from 'react';

export interface SegmentOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
}

interface SegmentedControlProps<T extends string | number> {
  readonly legend: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/** A compact horizontal radio group. Native radios keep arrow-key support. */
export function SegmentedControl<T extends string | number>({
  legend,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset className="segmented">
      <legend className="segmented__legend">{legend}</legend>
      <div className="segmented__options">
        {options.map((option) => (
          <label key={option.value} className="segmented__option">
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
