import { useId, useState } from 'react';
import {
  encodeOrder,
  isOrdering,
  orderOf,
  type ChoiceQuestion,
  type DeductionQuestion,
  type OrderingQuestion,
} from '../../domain/deduction';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';

interface QuestionFieldProps {
  readonly number: number;
  readonly question: DeductionQuestion;
  readonly evidence: readonly EvidenceItem[];
  readonly answer: string;
  readonly cited: readonly EvidenceId[];
  readonly onAnswer: (answer: string) => void;
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
      {isOrdering(question) ? (
        <OrderingField question={question} answer={answer} onAnswer={onAnswer} />
      ) : (
        <ChoiceField name={name} question={question} answer={answer} onAnswer={onAnswer} />
      )}
      <Citations evidence={evidence} cited={cited} onCite={onCite} />
    </section>
  );
}

function ChoiceField({
  name,
  question,
  answer,
  onAnswer,
}: {
  readonly name: string;
  readonly question: ChoiceQuestion;
  readonly answer: string;
  readonly onAnswer: (answer: string) => void;
}) {
  return (
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
  );
}

/**
 * Put events in order with Move up / Move down buttons: works the same with
 * touch, mouse, keyboard, and screen readers. Each move is announced.
 */
function OrderingField({
  question,
  answer,
  onAnswer,
}: {
  readonly question: OrderingQuestion;
  readonly answer: string;
  readonly onAnswer: (answer: string) => void;
}) {
  const order = orderOf(question, answer || undefined);
  const [announcement, setAnnouncement] = useState('');
  const textOf = (id: string) => question.items.find((i) => i.id === id)?.text ?? id;

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.splice(target, 0, item);
    onAnswer(encodeOrder(next));
    setAnnouncement(`Moved to position ${target + 1} of ${order.length}: ${textOf(item)}`);
  };

  return (
    <div className="ordering">
      <p className="prose">Earliest at the top.</p>
      <ol className="ordering__list">
        {order.map((id, index) => (
          <li key={id} className="ordering__item">
            <span className="ordering__position" aria-hidden="true">
              {index + 1}
            </span>
            <span className="ordering__text">{textOf(id)}</span>
            <span className="ordering__buttons">
              <button
                type="button"
                className="icon-button icon-button--dark"
                aria-label={`Move up: ${textOf(id)}`}
                // aria-disabled keeps focus on the button when an item reaches the top.
                aria-disabled={index === 0 || undefined}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-button icon-button--dark"
                aria-label={`Move down: ${textOf(id)}`}
                aria-disabled={index === order.length - 1 || undefined}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

function Citations({
  evidence,
  cited,
  onCite,
}: {
  readonly evidence: readonly EvidenceItem[];
  readonly cited: readonly EvidenceId[];
  readonly onCite: (id: EvidenceId, cited: boolean) => void;
}) {
  return (
    <fieldset className="citations">
      <legend className="citations__legend">Supporting records</legend>
      <div className="citations__list">
        {evidence.map((item) => (
          <label key={item.id} className="citation">
            <input
              type="checkbox"
              checked={cited.includes(item.id)}
              onChange={(event) => onCite(item.id, event.target.checked)}
            />
            <span>{item.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
