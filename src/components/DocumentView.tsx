import { useId, type ReactNode } from 'react';
import type { DocumentBlock, DocumentContent } from '../domain/evidence';
import { splitMatches } from '../domain/textSearch';

interface HighlightProps {
  readonly text: string;
  readonly query: string;
}

/** Renders text with search matches wrapped in <mark>. */
function SearchText({ text, query }: HighlightProps) {
  const segments = splitMatches(text, query);
  if (segments.length === 1 && !segments[0]?.match) return text;
  return segments.map((segment, index) =>
    segment.match ? (
      <mark key={index} className="search-match">
        {segment.text}
      </mark>
    ) : (
      segment.text
    ),
  );
}

/** Player highlighting: which passages are marked and how to toggle them. */
export interface PassageMarking {
  readonly marked: ReadonlySet<string>;
  /** When true, each passage shows a toggle. */
  readonly editing: boolean;
  readonly onToggle: (key: string, on: boolean) => void;
}

interface PassageProps {
  readonly passageKey: string;
  readonly summary: string;
  readonly marking: PassageMarking | undefined;
}

function MarkToggle({ passageKey, summary, marking }: PassageProps) {
  if (!marking?.editing) return null;
  const on = marking.marked.has(passageKey);
  return (
    <button
      type="button"
      className="mark-toggle"
      aria-pressed={on}
      aria-label={`Highlight: ${summary}`}
      onClick={() => marking.onToggle(passageKey, !on)}
    >
      <span aria-hidden="true">{on ? '★' : '☆'}</span>
    </button>
  );
}

const markedClass = (marking: PassageMarking | undefined, key: string, base = '') =>
  [base, marking?.marked.has(key) ? 'is-marked' : ''].filter(Boolean).join(' ') || undefined;

function Block({
  block,
  index,
  query,
  marking,
}: {
  readonly block: DocumentBlock;
  readonly index: number;
  readonly query: string;
  readonly marking: PassageMarking | undefined;
}) {
  const key = `b${index}`;
  const passage = (text: string, children: ReactNode, className?: string) => (
    <div className={markedClass(marking, key, ['passage', className].filter(Boolean).join(' '))}>
      <MarkToggle passageKey={key} summary={text} marking={marking} />
      {children}
    </div>
  );

  switch (block.type) {
    case 'heading':
      return passage(
        block.text,
        <h3 className="document__subheading">
          <SearchText text={block.text} query={query} />
        </h3>,
      );
    case 'paragraph':
      return passage(
        block.text,
        <p>
          <SearchText text={block.text} query={query} />
        </p>,
      );
    case 'annotation':
      return passage(
        block.text,
        <p className="document__annotation">
          <span className="visually-hidden">Handwritten annotation: </span>
          <SearchText text={block.text} query={query} />
        </p>,
      );
    case 'fields':
      return (
        <dl className="document__fields">
          {block.fields.map((field, j) => {
            const fieldKey = `${key}.${j}`;
            return (
              <div key={field.label} className={markedClass(marking, fieldKey, 'document__field')}>
                <dt>
                  <SearchText text={field.label} query={query} />
                </dt>
                <dd>
                  <MarkToggle
                    passageKey={fieldKey}
                    summary={`${field.label}: ${field.value}`}
                    marking={marking}
                  />
                  <SearchText text={field.value} query={query} />
                </dd>
              </div>
            );
          })}
        </dl>
      );
    case 'table':
      return (
        // Scrolls horizontally inside the document on narrow screens.
        <div className="document__table-wrap" tabIndex={0} role="region" aria-label={block.caption}>
          <table className="document__table">
            <caption>
              <SearchText text={block.caption} query={query} />
            </caption>
            <thead>
              <tr>
                {marking?.editing && (
                  <th scope="col">
                    <span className="visually-hidden">Highlight</span>
                  </th>
                )}
                {block.columns.map((column) => (
                  <th key={column} scope="col">
                    <SearchText text={column} query={query} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => {
                const rowKey = `${key}.${rowIndex}`;
                return (
                  <tr key={rowIndex} className={markedClass(marking, rowKey)}>
                    {marking?.editing && (
                      <td>
                        <MarkToggle passageKey={rowKey} summary={row.join(', ')} marking={marking} />
                      </td>
                    )}
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        <SearchText text={cell} query={query} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
  }
}

interface DocumentViewProps {
  readonly document: DocumentContent;
  /** Search text to highlight; empty for none. */
  readonly query?: string;
  /** Player highlights; omit for a read-only record. */
  readonly marking?: PassageMarking;
}

/** A paper record. Content is reproduced exactly as authored. */
export function DocumentView({ document, query = '', marking }: DocumentViewProps) {
  const headingId = useId();
  return (
    <article
      className={marking?.editing ? 'document is-marking' : 'document'}
      aria-labelledby={headingId}
    >
      <header className="document__header">
        <p className="document__stamp">{document.stamp}</p>
        <h2 id={headingId} className="document__title">
          <SearchText text={document.heading} query={query} />
        </h2>
      </header>
      <div className="document__body">
        {document.blocks.map((block, index) => (
          <Block key={index} block={block} index={index} query={query} marking={marking} />
        ))}
      </div>
    </article>
  );
}
