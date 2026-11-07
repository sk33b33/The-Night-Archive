import { ScreenLayout } from '../../components/ScreenLayout';

interface ArchiveScreenProps {
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
}

export function ArchiveScreen({ onBack, focusOnMount }: ArchiveScreenProps) {
  return (
    <ScreenLayout
      title="Archive dashboard"
      eyebrow="Night shift"
      onBack={onBack}
      backLabel="Main menu"
      focusOnMount={focusOnMount}
    >
      <dl className="status-strip">
        <div className="status-strip__item">
          <dt>Clearance</dt>
          <dd>Level 1 · Night archivist</dd>
        </div>
        <div className="status-strip__item">
          <dt>Assigned files</dt>
          <dd>0</dd>
        </div>
      </dl>

      <section className="panel" aria-labelledby="case-files-heading">
        <h2 id="case-files-heading" className="panel__title">
          Case files
        </h2>
        <div className="empty-state" role="status">
          <p className="empty-state__lead">Your desk is clear.</p>
          <p className="empty-state__body">
            No files have been assigned to this shift yet. Case files will appear here in a
            future update.
          </p>
        </div>
      </section>
    </ScreenLayout>
  );
}
