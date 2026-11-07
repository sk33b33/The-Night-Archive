import { useId, useMemo, useState } from 'react';
import { DocumentView, type PassageMarking } from '../../components/DocumentView';
import { documentText, type DocumentEvidence, type EvidenceId } from '../../domain/evidence';
import { countMatches } from '../../domain/textSearch';
import { DocumentSearch } from './DocumentSearch';

interface DocumentWorkspaceProps {
  readonly item: DocumentEvidence;
  /** Other documents the player can compare against. */
  readonly others: readonly DocumentEvidence[];
  readonly highlightsOf: (id: EvidenceId) => readonly string[];
  readonly onHighlight: (id: EvidenceId, passageKey: string, on: boolean) => void;
  readonly onClearHighlights: (id: EvidenceId) => void;
  /** The document shown alongside, or '' for none. */
  readonly compareId: EvidenceId | '';
  readonly onCompareChange: (id: EvidenceId | '') => void;
}

const compareKey = (id: string) => `night-archive:compare:${id}`;

/** Remembers the comparison choice for this tab, so a refresh keeps it. */
export function loadCompare(id: string, others: readonly DocumentEvidence[]): EvidenceId | '' {
  try {
    const stored = window.sessionStorage.getItem(compareKey(id));
    return others.find((o) => o.id === stored)?.id ?? '';
  } catch {
    return '';
  }
}

export function storeCompare(id: string, value: string): void {
  try {
    if (value) window.sessionStorage.setItem(compareKey(id), value);
    else window.sessionStorage.removeItem(compareKey(id));
  } catch {
    // Not kept: comparison simply resets on refresh.
  }
}

export function DocumentWorkspace({
  item,
  others,
  highlightsOf,
  onHighlight,
  onClearHighlights,
  compareId,
  onCompareChange,
}: DocumentWorkspaceProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const compared = others.find((o) => o.id === compareId);

  const texts = useMemo(() => documentText(item.document), [item]);
  const comparedTexts = useMemo(() => (compared ? documentText(compared.document) : []), [compared]);
  const matchCount = countMatches(texts, query) + countMatches(comparedTexts, query);
  const matchDetail = compared
    ? `${countMatches(texts, query)} in ${item.title} · ${countMatches(comparedTexts, query)} in ${compared.title}`
    : undefined;

  const markingFor = (doc: DocumentEvidence): PassageMarking => ({
    marked: new Set(highlightsOf(doc.id)),
    editing,
    onToggle: (key, on) => onHighlight(doc.id, key, on),
  });

  const totalMarked = highlightsOf(item.id).length + (compared ? highlightsOf(compared.id).length : 0);

  const view = (doc: DocumentEvidence) => (
    <div className="compare__column">
      {compared && <p className="compare__label">{doc.title}</p>}
      <DocumentView document={doc.document} query={query} marking={markingFor(doc)} />
    </div>
  );

  return (
    <>
      <div className="doc-tools">
        <DocumentSearch
          query={query}
          matchCount={matchCount}
          detail={matchDetail}
          label={compared ? 'Search both records' : 'Search this document'}
          onChange={setQuery}
        />
        <div className="doc-tools__row">
          <label className="switch switch--compact">
            <input
              type="checkbox"
              role="switch"
              checked={editing}
              onChange={(event) => setEditing(event.target.checked)}
            />
            <span className="switch__text">
              <span className="switch__label">Highlight passages</span>
              <span className="switch__hint">
                {editing ? 'Tap a star to mark or unmark a passage.' : `${totalMarked} marked`}
              </span>
            </span>
          </label>
          {highlightsOf(item.id).length > 0 && (
            <button type="button" className="link-button" onClick={() => onClearHighlights(item.id)}>
              Clear highlights on this record
            </button>
          )}
        </div>
        {others.length > 0 && (
          <div className="field">
            <label htmlFor={`${id}-compare`}>Compare with</label>
            <select
              id={`${id}-compare`}
              value={compareId}
              onChange={(event) => {
                onCompareChange(event.target.value as EvidenceId | '');
              }}
            >
              <option value="">No comparison</option>
              {others.map((other) => (
                <option key={other.id} value={other.id}>
                  {other.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {compared ? (
        <div className="compare">
          {view(item)}
          {view(compared)}
        </div>
      ) : (
        view(item)
      )}
    </>
  );
}
