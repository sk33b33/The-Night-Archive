import type { ReactNode } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition } from '../../domain/case';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';
import { EvidenceCard } from './EvidenceCard';

/** Viewers available in this build. Other kinds are listed but disabled. */
export const UNAVAILABLE_VIEWER_REASON: Partial<Record<EvidenceItem['kind'], string>> = {
  audio: 'Audio playback is not available in this build yet.',
};

interface InvestigationScreenProps {
  readonly caseFile: CaseDefinition;
  readonly evidence: readonly EvidenceItem[];
  readonly isExamined: (id: EvidenceId) => boolean;
  readonly onOpenEvidence: (id: EvidenceId) => void;
  readonly onOpenBriefing: () => void;
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
                disabledReason={UNAVAILABLE_VIEWER_REASON[item.kind]}
              />
            ))}
          </ul>
        )}
      </section>
      {notice}
    </ScreenLayout>
  );
}
