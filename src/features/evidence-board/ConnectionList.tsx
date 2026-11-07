import { describeLink, linkKey, type BoardLink, type LinkEvaluation } from '../../domain/board';
import type { EvidenceId } from '../../domain/evidence';

interface ConnectionListProps {
  readonly links: readonly BoardLink[];
  readonly evaluate: (link: BoardLink) => LinkEvaluation;
  readonly titleOf: (id: EvidenceId) => string;
  readonly onRemove: (key: string) => void;
}

export function ConnectionList({ links, evaluate, titleOf, onRemove }: ConnectionListProps) {
  const supported = links.filter((l) => evaluate(l).status === 'supported').length;
  return (
    <section className="panel" aria-labelledby="connections-heading">
      <h2 id="connections-heading" className="panel__title">
        Connections
      </h2>
      {links.length === 0 ? (
        <p className="prose">
          No connections yet. Connect two items to record how they relate. Connections the records do
          not establish are kept as hypotheses.
        </p>
      ) : (
        <>
          <p className="toolbar__status">
            {supported} supported · {links.length - supported}{' '}
            {links.length - supported === 1 ? 'hypothesis' : 'hypotheses'}
          </p>
          <ul className="connections">
            {links.map((link) => {
              const result = evaluate(link);
              const key = linkKey(link);
              const sentence = describeLink(link, titleOf);
              return (
                <li key={key} className={`connection is-${result.status}`}>
                  <div className="connection__head">
                    <span className={`badge badge--${result.status}`}>
                      {result.status === 'supported' ? 'Supported' : 'Hypothesis'}
                    </span>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onRemove(key)}
                      aria-label={`Remove connection: ${sentence}`}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="connection__sentence">{sentence}</p>
                  <p className="connection__reason">
                    {result.status === 'supported'
                      ? result.reason
                      : 'The records do not establish this. It stays on the board as a hypothesis.'}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
