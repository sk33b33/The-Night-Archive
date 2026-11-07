import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { CaseDefinition } from '../../domain/case';
import {
  evaluateDeduction,
  hintFor,
  isComplete,
  isSolved,
  type DeductionAttempt,
  type DeductionSubmission,
} from '../../domain/deduction';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';
import { OUTCOME_TEXT } from './outcomeText';
import { QuestionField } from './QuestionField';

interface FindingsScreenProps {
  readonly caseFile: CaseDefinition;
  readonly evidence: readonly EvidenceItem[];
  readonly attempts: readonly DeductionAttempt[];
  readonly onSubmit: (attempt: DeductionAttempt) => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

const EMPTY: DeductionSubmission = { answers: {}, citations: {} };

export function FindingsScreen({
  caseFile,
  evidence,
  attempts,
  onSubmit,
  onBack,
  focusOnMount,
  notice,
}: FindingsScreenProps) {
  const { questions } = caseFile;
  // Start from the last submission so a revisit does not lose the player's work.
  const [draft, setDraft] = useState<DeductionSubmission>(() => {
    const latest = attempts[attempts.length - 1];
    return latest ? { answers: latest.answers, citations: latest.citations } : EMPTY;
  });
  const [submittedThisVisit, setSubmittedThisVisit] = useState(false);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const latest = attempts[attempts.length - 1];
  const solved = isSolved(attempts);

  useEffect(() => {
    if (submittedThisVisit) resultRef.current?.focus();
  }, [submittedThisVisit, attempts.length]);

  const setAnswer = (questionId: string, optionId: string) =>
    setDraft((d) => ({ ...d, answers: { ...d.answers, [questionId]: optionId } }));

  const setCited = (questionId: string, id: EvidenceId, on: boolean) =>
    setDraft((d) => {
      const current = d.citations[questionId] ?? [];
      const next = on ? [...current.filter((c) => c !== id), id] : current.filter((c) => c !== id);
      return { ...d, citations: { ...d.citations, [questionId]: next } };
    });

  const submit = () => {
    // Only cite items the player can currently see.
    const available = new Set<string>(evidence.map((e) => e.id));
    const citations: Record<string, EvidenceId[]> = {};
    for (const q of questions) {
      citations[q.id] = (draft.citations[q.id] ?? []).filter((id) => available.has(id));
    }
    const submission = { answers: draft.answers, citations };
    onSubmit({
      ...submission,
      submittedAt: new Date().toISOString(),
      outcome: evaluateDeduction(questions, submission).outcome,
    });
    setSubmittedThisVisit(true);
  };

  const hint = hintFor(questions, attempts);

  return (
    <ScreenLayout
      title="Case findings"
      eyebrow={`Case ${caseFile.number} · ${caseFile.title}`}
      onBack={onBack}
      backLabel="Case files"
      focusOnMount={focusOnMount}
    >
      {latest && (
        <section
          className={`panel result result--${latest.outcome}`}
          aria-labelledby="result-heading"
          role="status"
        >
          <h2 id="result-heading" ref={resultRef} tabIndex={-1} className="result__title">
            {OUTCOME_TEXT[latest.outcome].title}
          </h2>
          <p className="prose">{OUTCOME_TEXT[latest.outcome].body}</p>
          {hint && (
            <p className="result__hint">
              <span className="result__hint-label">Reviewer’s note: </span>
              {hint}
            </p>
          )}
          <p className="toolbar__status">
            {attempts.length} {attempts.length === 1 ? 'submission' : 'submissions'} recorded
          </p>
        </section>
      )}

      {solved ? (
        <section className="panel" aria-labelledby="accepted-heading">
          <h2 id="accepted-heading" className="panel__title">
            Accepted findings
          </h2>
          <ol className="accepted">
            {questions.map((q) => (
              <li key={q.id}>{q.finding}</li>
            ))}
          </ol>
          <p className="prose">This file is closed.</p>
        </section>
      ) : (
        <>
          <p className="prose">
            Answer each question and select the records that support your answer. A finding is
            accepted only when the records you cite show it.
          </p>
          {questions.map((question, index) => (
            <QuestionField
              key={question.id}
              number={index + 1}
              question={question}
              evidence={evidence}
              answer={draft.answers[question.id] ?? ''}
              cited={draft.citations[question.id] ?? []}
              onAnswer={(optionId) => setAnswer(question.id, optionId)}
              onCite={(id, on) => setCited(question.id, id, on)}
            />
          ))}
          <Button
            variant="primary"
            onClick={submit}
            disabledReason={
              isComplete(questions, draft) ? undefined : 'Answer every question before submitting.'
            }
          >
            Submit findings
          </Button>
        </>
      )}
      {notice}
    </ScreenLayout>
  );
}
