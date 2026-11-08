import { useMemo, useState } from 'react';
import { DocumentView, type PassageMarking } from '../../components/DocumentView';
import { documentText, type DocumentEvidence, type EvidenceId } from '../../domain/evidence';
import { countMatches } from '../../domain/textSearch';
import { CompareSelect } from './CompareSelect';
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

export function DocumentWorkspace({
  item,
  others,
  highlightsOf,
  onHighlight,
  onClearHighlights,
  compareId,
  onCompareChange,
}: DocumentWorkspaceProps) {
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
          <CompareSelect options={others} value={compareId} onChange={onCompareChange} />
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
