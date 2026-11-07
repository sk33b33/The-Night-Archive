import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition } from '../../domain/case';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';
import { EvidenceCard } from './EvidenceCard';

interface InvestigationScreenProps {
  readonly caseFile: CaseDefinition;
  readonly evidence: readonly EvidenceItem[];
  readonly isExamined: (id: EvidenceId) => boolean;
  readonly onOpenEvidence: (id: EvidenceId) => void;
  readonly onOpenBriefing: () => void;
  readonly onOpenBoard: () => void;
  readonly onOpenFindings: () => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

export function InvestigationScreen({
  caseFile,
  evidence,
  isExamined,
  onOpenEvidence,
  onOpenBriefing,
  onOpenBoard,
  onOpenFindings,
  onBack,
  focusOnMount,
  notice,
}: InvestigationScreenProps) {
  const examinedCount = evidence.filter((item) => isExamined(item.id)).length;
  return (
    <ScreenLayout
      title={caseFile.title}
      eyebrow={`Case ${caseFile.number} · Case files`}
      onBack={onBack}
      focusOnMount={focusOnMount}
    >
      <div className="toolbar">
        <p className="toolbar__status">
          {examinedCount} of {evidence.length} items examined
        </p>
        <button type="button" className="link-button" onClick={onOpenBriefing}>
          Review briefing
        </button>
      </div>

      <div className="case-actions">
        <Button variant="primary" onClick={onOpenBoard}>
          Open evidence board
        </Button>
        <Button onClick={onOpenFindings}>Case findings</Button>
      </div>

      <section className="panel" aria-labelledby="inventory-heading">
        <h2 id="inventory-heading" className="panel__title">
          Evidence inventory
        </h2>
        {evidence.length === 0 ? (
          <p className="empty-state__body">No evidence has been filed with this case.</p>
        ) : (
          <ul className="evidence-list">
            {evidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                examined={isExamined(item.id)}
                onOpen={() => onOpenEvidence(item.id)}
              />
            ))}
          </ul>
        )}
      </section>
      {notice}
    </ScreenLayout>
  );
}
