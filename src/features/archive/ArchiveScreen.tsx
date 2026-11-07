import type { ReactNode } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition, CaseId } from '../../domain/case';
import type { CaseStatus } from '../../domain/progress';
import { CaseCard } from './CaseCard';

interface ArchiveScreenProps {
  readonly cases: readonly CaseDefinition[];
  readonly statusOf: (id: CaseId) => CaseStatus;
  readonly onOpenCase: (id: CaseId) => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  /** Save-status notice, if any. */
  readonly notice?: ReactNode;
}

export function ArchiveScreen({
  cases,
  statusOf,
  onOpenCase,
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
          <dd>Level 1 · Night archivist</dd>
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
                onOpen={() => onOpenCase(caseFile.id)}
              />
            ))}
          </ul>
        )}
      </section>
      {notice}
    </ScreenLayout>
  );
}
