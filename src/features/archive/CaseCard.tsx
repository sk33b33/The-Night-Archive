import type { CaseDefinition } from '../../domain/case';
import type { CaseStatus } from '../../domain/progress';

interface CaseCardProps {
  readonly caseFile: CaseDefinition;
  readonly status: CaseStatus;
  readonly onOpen: () => void;
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: 'New',
  opened: 'Opened',
};

export function CaseCard({ caseFile, status, onOpen }: CaseCardProps) {
  return (
    <li>
      <button type="button" className="case-card" onClick={onOpen}>
        <span className="case-card__meta">
          <span className="case-card__number">Case {caseFile.number}</span>
          <span className={`chip chip--${status}`}>{STATUS_LABEL[status]}</span>
        </span>
        <span className="case-card__title">{caseFile.title}</span>
        <span className="case-card__location">{caseFile.location}</span>
        <span className="case-card__summary">{caseFile.briefing.summary}</span>
        <span className="case-card__action" aria-hidden="true">
          Open file →
        </span>
      </button>
    </li>
  );
}
