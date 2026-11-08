import { useId } from 'react';
import type { EvidenceItem, EvidenceKind } from '../../domain/evidence';

export const KIND_LABEL: Record<EvidenceKind, string> = {
  document: 'Document',
  audio: 'Audio',
  photo: 'Photograph',
  object: 'Object',
  cctv: 'CCTV',
};

interface EvidenceCardProps {
  readonly item: EvidenceItem;
  readonly examined: boolean;
  readonly onOpen: () => void;
  /** When set, the card is disabled and this explanation is shown. */
  readonly disabledReason?: string | undefined;
}

export function EvidenceCard({ item, examined, onOpen, disabledReason }: EvidenceCardProps) {
  const reasonId = useId();
  const disabled = disabledReason !== undefined;
  return (
    <li>
      <button
        type="button"
        className="evidence-card"
        aria-disabled={disabled || undefined}
        aria-describedby={disabled ? reasonId : undefined}
        onClick={disabled ? undefined : onOpen}
      >
        <span className="evidence-card__meta">
          <span className={`kind kind--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
          <span className="evidence-card__reference">{item.reference}</span>
        </span>
        <span className="evidence-card__title">{item.title}</span>
        <span className="evidence-card__description">{item.description}</span>
        {!disabled && (
          <span className={examined ? 'evidence-card__state' : 'evidence-card__state is-new'}>
            {examined ? 'Examined' : 'Not yet examined'}
          </span>
        )}
      </button>
      {disabled && (
        <p id={reasonId} className="evidence-card__reason">
          {disabledReason}
        </p>
      )}
    </li>
  );
}
