import { useId } from 'react';
import type { EvidenceId } from '../../domain/evidence';

interface CompareSelectProps {
  readonly options: readonly { readonly id: EvidenceId; readonly title: string }[];
  readonly value: EvidenceId | '';
  readonly onChange: (id: EvidenceId | '') => void;
}

/** "Compare with" picker shared by the document, photo, and audio viewers. */
export function CompareSelect({ options, value, onChange }: CompareSelectProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>Compare with</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as EvidenceId | '')}>
        <option value="">No comparison</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
}
