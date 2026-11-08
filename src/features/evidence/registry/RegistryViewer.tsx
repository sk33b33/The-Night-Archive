import { useId, useState, type FormEvent } from 'react';
import {
  searchDiscovery,
  searchRegisters,
  type EvidenceId,
  type EvidenceItem,
  type RegistryEvidence,
} from '../../../domain/evidence';

interface RegistryViewerProps {
  readonly item: RegistryEvidence;
  /** Evidence the player can open, to follow a result to its register. */
  readonly available: readonly EvidenceItem[];
  readonly onOpenEvidence: (id: EvidenceId) => void;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  readonly onDiscover: (discoveryId: string) => readonly string[];
}

/**
 * Searches several staff registers at once by surname or initial. Whole
 * words only, so a near match is never shown as a match. Every register
 * answers, including "No entry".
 */
export function RegistryViewer({ item, available, onOpenEvidence, onDiscover }: RegistryViewerProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState<string | null>(null);
  const [filed, setFiled] = useState<readonly string[]>([]);

  const results = query === null ? [] : searchRegisters(item, query);
  const total = results.reduce((n, r) => n + r.matches.length, 0);
  const registersWith = results.filter((r) => r.matches.length > 0).length;
  const titleOf = (evidenceId: EvidenceId) => available.find((e) => e.id === evidenceId)?.title;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setQuery(q);
    const discovery = searchDiscovery(item, q);
    if (discovery) {
      const titles = onDiscover(discovery);
      if (titles.length > 0) setFiled(titles);
    }
  };

  return (
    <section className="registry" aria-label={item.title}>
      <form className="registry__form" role="search" onSubmit={submit}>
        <label htmlFor={`${id}-q`} className="registry__label">
          Name or initial
        </label>
        <span className="registry__row">
          <input
            id={`${id}-q`}
            className="doc-search__input"
            type="search"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn btn--secondary">
            Search
          </button>
        </span>
        <span className="registry__hint">
          Searches {item.registers.length} registers at once. Whole words only: a surname or an initial.
        </span>
      </form>

      <p className="visually-hidden" role="status">
        {query === null
          ? ''
          : `${query}: ${total} ${total === 1 ? 'entry' : 'entries'} in ${registersWith} of ${results.length} registers.`}
      </p>

      {filed.length > 0 && (
        <p className="notice notice--filed" role="status">
          Added to the case files: {filed.join(', ')}.
        </p>
      )}

      {query === null ? (
        <p className="prose">Enter a surname or an initial to search every register.</p>
      ) : (
        <section aria-labelledby={`${id}-results`}>
          <h2 id={`${id}-results`} className="panel__title">
            Results for “{query}”
          </h2>
          <ul className="registry__results">
            {results.map(({ register, matches }) => {
              const title = titleOf(register.source);
              return (
                <li key={register.id} className="registry__register">
                  <h3 className="registry__register-title">{register.label}</h3>
                  {matches.length === 0 ? (
                    <p className="registry__none">No entry.</p>
                  ) : (
                    <ul className="registry__entries">
                      {matches.map((entry) => (
                        <li key={`${entry.name}-${entry.post}`}>
                          <span className="registry__name">{entry.name}</span>
                          <span>
                            {entry.post} · {entry.from} – {entry.to}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {title && (
                    <button type="button" className="link-button" onClick={() => onOpenEvidence(register.source)}>
                      Open register: {title}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
