import { useState, type ReactNode } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { DocumentEvidence, EvidenceId, EvidenceItem } from '../../domain/evidence';
import type { RecordField } from '../../domain/case';
import { AudioPlayer } from './audio/AudioPlayer';
import { ObjectEvidenceView } from './object/ObjectEvidenceView';
import { PhotoEvidenceView } from './photo/PhotoEvidenceView';
import type { EngineFactory } from './audio/useReelPlayer';
import { DocumentWorkspace, loadCompare, storeCompare } from './DocumentWorkspace';

interface EvidenceScreenProps {
  readonly item: EvidenceItem;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  /** Documents available in the case, for comparison. */
  readonly documents: readonly DocumentEvidence[];
  /** All evidence available in the case, for linked records. */
  readonly available: readonly EvidenceItem[];
  readonly onOpenEvidence: (id: EvidenceId) => void;
  readonly highlightsOf: (id: EvidenceId) => readonly string[];
  readonly onHighlight: (id: EvidenceId, passageKey: string, on: boolean) => void;
  readonly onClearHighlights: (id: EvidenceId) => void;
  readonly onDiscover: (discoveryId: string) => readonly string[];
  /** Injected in tests; defaults to Web Audio. */
  readonly createEngine?: EngineFactory | undefined;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

export function EvidenceScreen({
  item,
  documents,
  available,
  onOpenEvidence,
  highlightsOf,
  onHighlight,
  onClearHighlights,
  onDiscover,
  createEngine,
  onBack,
  focusOnMount,
  notice,
}: EvidenceScreenProps) {
  const others = documents.filter((d) => d.id !== item.id);
  // Comparing needs the full width; a single record keeps the reading column.
  const [compareId, setCompareId] = useState(() => loadCompare(item.id, others));
  const comparing = item.kind === 'document' && others.some((o) => o.id === compareId);
  return (
    <ScreenLayout
      title={item.title}
      eyebrow={item.reference}
      onBack={onBack}
      backLabel="Case files"
      focusOnMount={focusOnMount}
      wide={comparing}
    >
      {item.kind === 'document' && (
        <DocumentWorkspace
          item={item}
          others={others}
          compareId={compareId}
          onCompareChange={(next) => {
            setCompareId(next);
            storeCompare(item.id, next);
          }}
          highlightsOf={highlightsOf}
          onHighlight={onHighlight}
          onClearHighlights={onClearHighlights}
        />
      )}
      {item.kind === 'audio' && (
        <AudioPlayer item={item} onDiscover={onDiscover} createEngine={createEngine} />
      )}
      {item.kind === 'photo' && <PhotoEvidenceView item={item} onDiscover={onDiscover} />}
      {item.kind === 'object' && (
        <ObjectEvidenceView item={item} available={available} onOpenEvidence={onOpenEvidence} />
      )}
      {(item.kind === 'audio' || item.kind === 'photo') && <Catalogue fields={item.catalogue} />}
      {notice}
    </ScreenLayout>
  );
}

function Catalogue({ fields }: { readonly fields: readonly RecordField[] }) {
  return (
    <section className="panel" aria-labelledby="catalogue-heading">
      <h2 id="catalogue-heading" className="panel__title">
        Catalogue entry
      </h2>
      <dl className="catalogue">
        {fields.map((field) => (
          <div key={field.label} className="catalogue__row">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
