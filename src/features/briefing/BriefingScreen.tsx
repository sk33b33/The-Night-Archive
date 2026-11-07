import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition } from '../../domain/case';

interface BriefingScreenProps {
  readonly caseFile: CaseDefinition;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

export function BriefingScreen({ caseFile, onBack, focusOnMount, notice }: BriefingScreenProps) {
  const { report, assignment } = caseFile.briefing;
  return (
    <ScreenLayout
      title={caseFile.title}
      eyebrow={`Case ${caseFile.number} · Briefing`}
      onBack={onBack}
      backLabel="Archive"
      focusOnMount={focusOnMount}
    >
      <section className="panel" aria-labelledby="assignment-heading">
        <h2 id="assignment-heading" className="panel__title">
          Assignment
        </h2>
        {assignment.map((paragraph) => (
          <p key={paragraph} className="prose">
            {paragraph}
          </p>
        ))}
      </section>

      <article className="document" aria-labelledby="report-heading">
        <header className="document__header">
          <p className="document__stamp">Official record</p>
          <h2 id="report-heading" className="document__title">
            {report.heading}
          </h2>
        </header>
        <dl className="document__fields">
          {report.fields.map((field) => (
            <div key={field.label} className="document__field">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        <div className="document__body">
          {report.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <Button
        variant="primary"
        disabledReason="The investigation workspace is not available in this build yet."
      >
        Begin investigation
      </Button>
      {notice}
    </ScreenLayout>
  );
}
