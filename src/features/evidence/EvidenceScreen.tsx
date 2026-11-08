import { useId, useState, type ReactNode } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import type {
  AudioEvidence,
  DocumentEvidence,
  EvidenceId,
  EvidenceItem,
  PhotoEvidence,
} from '../../domain/evidence';
import type { RecordField } from '../../domain/case';
import { AudioCompare } from './audio/AudioCompare';
import { AudioPlayer } from './audio/AudioPlayer';
import { CctvViewer } from './cctv/CctvViewer';
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
  const otherPhotos = available.filter((e): e is PhotoEvidence => e.kind === 'photo' && e.id !== item.id);
  const otherAudio = available.filter((e): e is AudioEvidence => e.kind === 'audio' && e.id !== item.id);
  const comparable = item.kind === 'photo' ? otherPhotos : item.kind === 'audio' ? otherAudio : others;
  // Comparing needs the full width; a single record keeps the reading column.
  const [compareId, setCompareId] = useState(() => loadCompare(item.id, comparable));
  const comparing = item.kind !== 'object' && item.kind !== 'cctv' && comparable.some((o) => o.id === compareId);
  const comparedAudio = otherAudio.find((o) => o.id === compareId);
  const changeCompare = (next: EvidenceId | '') => {
    setCompareId(next);
    storeCompare(item.id, next);
  };
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
          onCompareChange={changeCompare}
          highlightsOf={highlightsOf}
          onHighlight={onHighlight}
          onClearHighlights={onClearHighlights}
        />
      )}
      {item.kind === 'audio' && otherAudio.length > 0 && (
        <CompareSelect
          options={otherAudio}
          value={compareId}
          onChange={changeCompare}
        />
      )}
      {item.kind === 'audio' &&
        (comparedAudio ? (
          <AudioCompare left={item} right={comparedAudio} onDiscover={onDiscover} createEngine={createEngine} />
        ) : (
          <AudioPlayer item={item} onDiscover={onDiscover} createEngine={createEngine} />
        ))}
      {item.kind === 'photo' && (
        <PhotoEvidenceView
          item={item}
          others={otherPhotos}
          compareId={compareId}
          onCompareChange={changeCompare}
          onDiscover={onDiscover}
        />
      )}
      {item.kind === 'cctv' && <CctvViewer item={item} />}
      {item.kind === 'object' && (
        <ObjectEvidenceView item={item} available={available} onOpenEvidence={onOpenEvidence} />
      )}
      {(item.kind === 'audio' || item.kind === 'photo' || item.kind === 'cctv') && (
        <Catalogue fields={item.catalogue} />
      )}
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

function CompareSelect({
  options,
  value,
  onChange,
}: {
  readonly options: readonly { readonly id: EvidenceId; readonly title: string }[];
  readonly value: EvidenceId | '';
  readonly onChange: (id: EvidenceId | '') => void;
}) {
  const id = useId();
  return (
    <div className="field doc-tools">
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
