import { useId } from 'react';
import type { DocumentBlock, DocumentContent } from '../domain/evidence';
import { splitMatches } from '../domain/textSearch';

interface HighlightProps {
  readonly text: string;
  readonly query: string;
}

/** Renders text with search matches wrapped in <mark>. */
function Highlight({ text, query }: HighlightProps) {
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

function Block({ block, query }: { readonly block: DocumentBlock; readonly query: string }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="document__subheading">
          <Highlight text={block.text} query={query} />
        </h3>
      );
    case 'paragraph':
      return (
        <p>
          <Highlight text={block.text} query={query} />
        </p>
      );
    case 'annotation':
      return (
        <p className="document__annotation">
          <span className="visually-hidden">Handwritten annotation: </span>
          <Highlight text={block.text} query={query} />
        </p>
      );
    case 'fields':
      return (
        <dl className="document__fields">
          {block.fields.map((field) => (
            <div key={field.label} className="document__field">
              <dt>
                <Highlight text={field.label} query={query} />
              </dt>
              <dd>
                <Highlight text={field.value} query={query} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'table':
      return (
        // Scrolls horizontally inside the document on narrow screens.
        <div className="document__table-wrap" tabIndex={0} role="region" aria-label={block.caption}>
          <table className="document__table">
            <caption>
              <Highlight text={block.caption} query={query} />
            </caption>
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column} scope="col">
                    <Highlight text={column} query={query} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <Highlight text={cell} query={query} />
                    </td>
                  ))}
                </tr>
              ))}
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
}

/** A paper record. Content is reproduced exactly as authored. */
export function DocumentView({ document, query = '' }: DocumentViewProps) {
  const headingId = useId();
  return (
    <article className="document" aria-labelledby={headingId}>
      <header className="document__header">
        <p className="document__stamp">{document.stamp}</p>
        <h2 id={headingId} className="document__title">
          <Highlight text={document.heading} query={query} />
        </h2>
      </header>
      <div className="document__body">
        {document.blocks.map((block, index) => (
          <Block key={index} block={block} query={query} />
        ))}
      </div>
    </article>
  );
}
