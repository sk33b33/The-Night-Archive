import type { ReactNode } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition, CaseId } from '../../domain/case';
import { ARCHIVE_DESK } from '../../content/archive';
import type { Anomaly } from '../../domain/anomaly';
import type { CaseStatus } from '../../domain/progress';
import { CaseCard } from './CaseCard';

interface ArchiveScreenProps {
  readonly cases: readonly CaseDefinition[];
  readonly statusOf: (id: CaseId) => CaseStatus;
  readonly amendedCount: (id: CaseId) => number;
  readonly onOpenCase: (id: CaseId) => void;
  readonly anomalies: readonly Anomaly[];
  readonly onOpenAnomaly: (id: string) => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  /** Save-status notice, if any. */
  readonly notice?: ReactNode;
}

export function ArchiveScreen({
  cases,
  statusOf,
  amendedCount,
  onOpenCase,
  anomalies,
  onOpenAnomaly,
  onBack,
  focusOnMount,
  notice,
}: ArchiveScreenProps) {
  return (
    <ScreenLayout
      title="Archive dashboard"
      eyebrow="Night shift"
      onBack={onBack}
      backLabel="Main menu"
      focusOnMount={focusOnMount}
    >
      <dl className="status-strip">
        <div className="status-strip__item">
          <dt>Clearance</dt>
          <dd>{ARCHIVE_DESK.clearance}</dd>
        </div>
        <div className="status-strip__item">
          <dt>Workstation</dt>
          <dd>{ARCHIVE_DESK.workstation}</dd>
        </div>
        <div className="status-strip__item">
          <dt>Assigned files</dt>
          <dd>{cases.length}</dd>
        </div>
      </dl>

      <section className="panel" aria-labelledby="case-files-heading">
        <h2 id="case-files-heading" className="panel__title">
          Case files
        </h2>
        {cases.length === 0 ? (
          <div className="empty-state" role="status">
            <p className="empty-state__lead">Your desk is clear.</p>
            <p className="empty-state__body">No files have been assigned to this shift.</p>
          </div>
        ) : (
          <ul className="case-list">
            {cases.map((caseFile) => (
              <CaseCard
                key={caseFile.id}
                caseFile={caseFile}
                status={statusOf(caseFile.id)}
                amended={amendedCount(caseFile.id)}
                onOpen={() => onOpenCase(caseFile.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {anomalies.length > 0 && (
        <section className="panel panel--unfiled" aria-labelledby="unfiled-heading">
          <h2 id="unfiled-heading" className="panel__title">
            Unfiled
          </h2>
          <ul className="case-list">
            {anomalies.map((anomaly) => (
              <li key={anomaly.id}>
                <button
                  type="button"
                  className="case-card case-card--anomaly"
                  onClick={() => onOpenAnomaly(anomaly.id)}
                >
                  <span className="case-card__meta">
                    <span className="case-card__number">No intake record</span>
                    <span className="chip chip--anomaly">Unregistered</span>
                  </span>
                  <span className="case-card__title">{anomaly.title}</span>
                  <span className="case-card__action" aria-hidden="true">
                    Open file →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {notice}
    </ScreenLayout>
  );
}
