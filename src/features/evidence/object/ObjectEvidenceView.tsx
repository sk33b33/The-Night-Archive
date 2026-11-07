import type { EvidenceId, EvidenceItem, ObjectEvidence } from '../../../domain/evidence';

interface ObjectEvidenceViewProps {
  readonly item: ObjectEvidence;
  /** Evidence the player can open; linked records not in it are listed but not openable. */
  readonly available: readonly EvidenceItem[];
  readonly onOpenEvidence: (id: EvidenceId) => void;
}

/** A property-store record: what the object is, who held it, and what it links to. */
export function ObjectEvidenceView({ item, available, onOpenEvidence }: ObjectEvidenceViewProps) {
  return (
    <>
      <section className="panel" aria-labelledby="object-details-heading">
        <h2 id="object-details-heading" className="panel__title">
          Property record
        </h2>
        <dl className="catalogue">
          {item.details.map((field) => (
            <div key={field.label} className="catalogue__row">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel" aria-labelledby="provenance-heading">
        <h2 id="provenance-heading" className="panel__title">
          Chain of custody
        </h2>
        <ol className="provenance">
          {item.provenance.map((entry, index) => (
            <li key={index} className="provenance__entry">
              <p className="provenance__date">{entry.date}</p>
              <p className="provenance__action">{entry.action}</p>
              <p className="provenance__where">
                {entry.holder} · {entry.location}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {item.linked.length > 0 && (
        <section className="panel" aria-labelledby="linked-heading">
          <h2 id="linked-heading" className="panel__title">
            Linked records
          </h2>
          <ul className="segments">
            {item.linked.map((id) => {
              const record = available.find((e) => e.id === id);
              return (
                <li key={id}>
                  {record ? (
                    <button type="button" className="segments__button" onClick={() => onOpenEvidence(id)}>
                      <span>{record.title}</span>
                      <span className="segments__time">{record.reference}</span>
                    </button>
                  ) : (
                    <p className="prose">A linked record that is not in your case files yet.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
