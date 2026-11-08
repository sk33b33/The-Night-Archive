import { seasonOf, type CaseDefinition, type CaseId } from '../../domain/case';
import { ARCHIVE_DESK } from '../../content/archive';
import type { Anomaly } from '../../domain/anomaly';
import type { CaseStatus } from '../../domain/progress';
import { CaseCard } from './CaseCard';

/** What the archive knows about this shift; shared by the terminal, drawers and tray. */
export interface ArchiveView {
  readonly cases: readonly CaseDefinition[];
  readonly statusOf: (id: CaseId) => CaseStatus;
  readonly amendedCount: (id: CaseId) => number;
  readonly onOpenCase: (id: CaseId) => void;
  readonly anomalies: readonly Anomaly[];
  readonly onOpenAnomaly: (id: string) => void;
  /** The shift's closing line, once the finale's choice is made. */
  readonly shiftLine?: string | undefined;
  /** A season-complete note, once the finale closes. */
  readonly seasonComplete?: string | undefined;
}

export function seasonsOf(cases: readonly CaseDefinition[]): (readonly [number, CaseDefinition[]])[] {
  return [...new Set(cases.map(seasonOf))]
    .sort((a, b) => a - b)
    .map((season) => [season, cases.filter((c) => seasonOf(c) === season)] as const);
}

/** Case folders for a list of cases, as cards. */
export function CaseFolders({ view, cases }: { readonly view: ArchiveView; readonly cases: readonly CaseDefinition[] }) {
  return (
    <ul className="case-list">
      {cases.map((caseFile) => (
        <CaseCard
          key={caseFile.id}
          caseFile={caseFile}
          status={view.statusOf(caseFile.id)}
          amended={view.amendedCount(caseFile.id)}
          onOpen={() => view.onOpenCase(caseFile.id)}
        />
      ))}
    </ul>
  );
}

/** Unregistered files, as cards. */
export function UnfiledList({ view }: { readonly view: ArchiveView }) {
  if (view.anomalies.length === 0) {
    return <p className="prose">The tray is empty.</p>;
  }
  return (
    <ul className="case-list">
      {view.anomalies.map((anomaly) => (
        <li key={anomaly.id}>
          <button type="button" className="case-card case-card--anomaly" onClick={() => view.onOpenAnomaly(anomaly.id)}>
            <span className="case-card__meta">
              <span className="case-card__number">No intake record</span>
              <span className="chip chip--anomaly">Unregistered</span>
            </span>
            <span className="case-card__title">{anomaly.title}</span>
            <span className="case-card__action" aria-hidden="true">
              Open file →
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * The archive terminal on the NA-07 computer: the shift's status and every
 * assigned case file, grouped by season, plus anything unfiled.
 */
export function ArchiveTerminal({ view }: { readonly view: ArchiveView }) {
  const seasons = seasonsOf(view.cases);
  return (
    <div className="archive-terminal">
      <dl className="status-strip">
        <div className="status-strip__item">
          <dt>Clearance</dt>
          <dd>{ARCHIVE_DESK.clearance}</dd>
        </div>
        <div className="status-strip__item">
          <dt>Workstation</dt>
          <dd>{ARCHIVE_DESK.workstation}</dd>
        </div>
        <div className="status-strip__item">
          <dt>Assigned files</dt>
          <dd>{view.cases.length}</dd>
        </div>
        {view.shiftLine && (
          <div className="status-strip__item">
            <dt>Shift</dt>
            <dd>{view.shiftLine}</dd>
          </div>
        )}
      </dl>

      {view.seasonComplete && (
        <p className="notice notice--season" role="note">
          {view.seasonComplete}
        </p>
      )}

      <section aria-labelledby="case-files-heading">
        <h3 id="case-files-heading" className="panel__title">
          Case files
        </h3>
        {view.cases.length === 0 ? (
          <div className="empty-state" role="status">
            <p className="empty-state__lead">Your desk is clear.</p>
            <p className="empty-state__body">No files have been assigned to this shift.</p>
          </div>
        ) : (
          seasons.map(([season, inSeason]) => (
            <div key={season} className="season">
              {seasons.length > 1 && <h4 className="season__title">Season {season}</h4>}
              <CaseFolders view={view} cases={inSeason} />
            </div>
          ))
        )}
      </section>

      {view.anomalies.length > 0 && (
        <section aria-labelledby="unfiled-heading">
          <h3 id="unfiled-heading" className="panel__title">
            Unfiled
          </h3>
          <UnfiledList view={view} />
        </section>
      )}
    </div>
  );
}
