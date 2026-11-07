import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { DocumentView } from '../../components/DocumentView';
import { ScreenLayout } from '../../components/ScreenLayout';
import { briefingReport, type CaseDefinition } from '../../domain/case';

interface BriefingScreenProps {
  readonly caseFile: CaseDefinition;
  readonly onBeginInvestigation: () => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

export function BriefingScreen({
  caseFile,
  onBeginInvestigation,
  onBack,
  focusOnMount,
  notice,
}: BriefingScreenProps) {
  return (
    <ScreenLayout
      title={caseFile.title}
      eyebrow={`Case ${caseFile.number} · Briefing`}
      onBack={onBack}
      focusOnMount={focusOnMount}
    >
      <section className="panel" aria-labelledby="assignment-heading">
        <h2 id="assignment-heading" className="panel__title">
          Assignment
        </h2>
        {caseFile.briefing.assignment.map((paragraph) => (
          <p key={paragraph} className="prose">
            {paragraph}
          </p>
        ))}
      </section>

      <DocumentView document={briefingReport(caseFile).document} />

      <Button variant="primary" onClick={onBeginInvestigation}>
        Open case files
      </Button>
      {notice}
    </ScreenLayout>
  );
}
