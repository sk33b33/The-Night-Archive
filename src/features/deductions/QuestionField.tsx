import { useId } from 'react';
import type { DeductionQuestion } from '../../domain/deduction';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';

interface QuestionFieldProps {
  readonly number: number;
  readonly question: DeductionQuestion;
  readonly evidence: readonly EvidenceItem[];
  readonly answer: string;
  readonly cited: readonly EvidenceId[];
  readonly onAnswer: (optionId: string) => void;
  readonly onCite: (id: EvidenceId, cited: boolean) => void;
}

export function QuestionField({
  number,
  question,
  evidence,
  answer,
  cited,
  onAnswer,
  onCite,
}: QuestionFieldProps) {
  const name = useId();
  return (
    <section className="panel question" aria-labelledby={`${name}-prompt`}>
      <h2 id={`${name}-prompt`} className="question__prompt">
        <span className="question__number">{number}.</span> {question.prompt}
      </h2>

      <fieldset className="option-group">
        <legend className="visually-hidden">Your answer</legend>
        <div className="option-group__options">
          {question.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={`${name}-answer`}
                value={option.id}
                checked={answer === option.id}
                onChange={() => onAnswer(option.id)}
              />
              <span className="option__text">
                <span className="option__label">{option.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="citations">
        <legend className="citations__legend">Supporting records</legend>
        <div className="citations__list">
          {evidence.map((item) => {
            const checked = cited.includes(item.id);
            return (
              <label key={item.id} className="citation">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onCite(item.id, event.target.checked)}
                />
                <span>{item.title}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
