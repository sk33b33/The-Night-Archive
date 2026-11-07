import { useMemo, useState, type ReactNode } from 'react';
import { DocumentView } from '../../components/DocumentView';
import { ScreenLayout } from '../../components/ScreenLayout';
import { documentText, type DocumentContent, type EvidenceItem } from '../../domain/evidence';
import { countMatches } from '../../domain/textSearch';
import { UNAVAILABLE_VIEWER_REASON } from '../investigation/InvestigationScreen';
import { DocumentSearch } from './DocumentSearch';

interface EvidenceScreenProps {
  readonly item: EvidenceItem;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

export function EvidenceScreen({ item, onBack, focusOnMount, notice }: EvidenceScreenProps) {
  return (
    <ScreenLayout
      title={item.title}
      eyebrow={item.reference}
      onBack={onBack}
      backLabel="Case files"
      focusOnMount={focusOnMount}
    >
      {item.kind === 'document' ? (
        <DocumentEvidenceView document={item.document} />
      ) : (
        <section className="panel" aria-labelledby="catalogue-heading">
          <h2 id="catalogue-heading" className="panel__title">
            Catalogue entry
          </h2>
          <dl className="catalogue">
            {item.catalogue.map((field) => (
              <div key={field.label} className="catalogue__row">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <p className="notice">{UNAVAILABLE_VIEWER_REASON.audio}</p>
        </section>
      )}
      {notice}
    </ScreenLayout>
  );
}

function DocumentEvidenceView({ document }: { readonly document: DocumentContent }) {
  const [query, setQuery] = useState('');
  const texts = useMemo(() => documentText(document), [document]);
  return (
    <>
      <DocumentSearch query={query} matchCount={countMatches(texts, query)} onChange={setQuery} />
      <DocumentView document={document} query={query} />
    </>
  );
}
