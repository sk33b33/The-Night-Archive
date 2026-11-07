import { useId, type FormEvent } from 'react';
import { RELATIONS, type RelationType } from '../../domain/board';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';

export interface ConnectionDraft {
  readonly from: EvidenceId | '';
  readonly relation: RelationType;
  readonly to: EvidenceId | '';
}

interface ConnectionFormProps {
  readonly evidence: readonly EvidenceItem[];
  readonly draft: ConnectionDraft;
  readonly onDraftChange: (draft: ConnectionDraft) => void;
  readonly onSubmit: () => void;
  /** Result of the last attempt, announced to assistive technology. */
  readonly message: { readonly tone: 'info' | 'warning'; readonly text: string } | null;
}

const RELATION_ENTRIES = Object.entries(RELATIONS) as [RelationType, (typeof RELATIONS)[RelationType]][];

/** The accessible way to create a connection; the board pre-fills it. */
export function ConnectionForm({ evidence, draft, onDraftChange, onSubmit, message }: ConnectionFormProps) {
  const id = useId();
  const ready = draft.from !== '' && draft.to !== '';
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) onSubmit();
  };
  const select = (field: 'from' | 'to', label: string) => (
    <div className="field">
      <label htmlFor={`${id}-${field}`}>{label}</label>
      <select
        id={`${id}-${field}`}
        value={draft[field]}
        onChange={(event) => onDraftChange({ ...draft, [field]: event.target.value as EvidenceId | '' })}
      >
        <option value="">Choose an item…</option>
        {evidence.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form className="panel connection-form" onSubmit={submit} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="panel__title">
        New connection
      </h2>
      {select('from', 'First item')}
      <div className="field">
        <label htmlFor={`${id}-relation`}>Relationship</label>
        <select
          id={`${id}-relation`}
          value={draft.relation}
          onChange={(event) => onDraftChange({ ...draft, relation: event.target.value as RelationType })}
        >
          {RELATION_ENTRIES.map(([value, relation]) => (
            <option key={value} value={value}>
              {relation.label}
            </option>
          ))}
        </select>
      </div>
      {select('to', 'Second item')}
      <button
        type="submit"
        className="btn btn--primary"
        aria-disabled={!ready || undefined}
        aria-describedby={ready ? undefined : `${id}-hint`}
      >
        Add connection
      </button>
      {!ready && (
        <p id={`${id}-hint`} className="btn-reason">
          Choose two items to connect.
        </p>
      )}
      <p
        className={message?.tone === 'warning' ? 'notice notice--warning' : 'notice'}
        role="status"
        hidden={!message}
      >
        {message?.text}
      </p>
    </form>
  );
}
