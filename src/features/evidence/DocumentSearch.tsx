import { useId } from 'react';

interface DocumentSearchProps {
  readonly query: string;
  readonly matchCount: number;
  /** Optional breakdown, e.g. per document when comparing. */
  readonly detail?: string | undefined;
  readonly label?: string;
  readonly onChange: (query: string) => void;
}

export function DocumentSearch({
  query,
  matchCount,
  detail,
  label = 'Search this document',
  onChange,
}: DocumentSearchProps) {
  const inputId = useId();
  const statusId = useId();
  const active = query.trim().length > 0;
  return (
    <div className="doc-search" role="search">
      <label htmlFor={inputId} className="doc-search__label">
        {label}
      </label>
      <div className="doc-search__row">
        <input
          id={inputId}
          className="doc-search__input"
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={statusId}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {active && (
          <button type="button" className="doc-search__clear" onClick={() => onChange('')}>
            Clear
          </button>
        )}
      </div>
      <p id={statusId} className="doc-search__status" role="status">
        {active
          ? `${matchCount} ${matchCount === 1 ? 'match' : 'matches'}${detail ? ` (${detail})` : ''}`
          : ''}
      </p>
    </div>
  );
}
