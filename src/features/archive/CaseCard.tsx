import type { CaseDefinition } from '../../domain/case';
import type { CaseStatus } from '../../domain/progress';

interface CaseCardProps {
  readonly caseFile: CaseDefinition;
  readonly status: CaseStatus;
  /** Records in this file that have changed since it was filed. */
  readonly amended: number;
  readonly onOpen: () => void;
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: 'New',
  opened: 'Opened',
  closed: 'Closed',
};

export function CaseCard({ caseFile, status, amended, onOpen }: CaseCardProps) {
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
        {amended > 0 && (
          <span className="case-card__amended">
            {amended} {amended === 1 ? 'record' : 'records'} amended since filing
          </span>
        )}
        <span className="case-card__action" aria-hidden="true">
          Open file →
        </span>
      </button>
    </li>
  );
}
