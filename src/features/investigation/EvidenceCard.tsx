import { KIND_LABEL } from '../../components/evidenceKind';
import type { EvidenceItem } from '../../domain/evidence';

interface EvidenceCardProps {
  readonly item: EvidenceItem;
  readonly examined: boolean;
  readonly onOpen: () => void;
}

export function EvidenceCard({ item, examined, onOpen }: EvidenceCardProps) {
  return (
    <li>
      <button type="button" className="evidence-card" onClick={onOpen}>
        <span className="evidence-card__meta">
          <span className={`kind kind--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
          <span className="evidence-card__reference">{item.reference}</span>
        </span>
        <span className="evidence-card__title">{item.title}</span>
        <span className="evidence-card__description">{item.description}</span>
        <span className={examined ? 'evidence-card__state' : 'evidence-card__state is-new'}>
          {examined ? 'Examined' : 'Not yet examined'}
        </span>
      </button>
    </li>
  );
}
