import { ScreenLayout } from '../../components/ScreenLayout';
import type { Anomaly } from '../../domain/anomaly';
import { PhotoViewer } from '../evidence/photo/PhotoViewer';
import { WorkstationPhoto } from './WorkstationPhoto';

interface AnomalyScreenProps {
  readonly anomaly: Anomaly;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
}

/** Presents an anomaly exactly as filed. It offers no interpretation. */
export function AnomalyScreen({ anomaly, onBack, focusOnMount }: AnomalyScreenProps) {
  const { photograph, register } = anomaly;
  return (
    <ScreenLayout
      title={anomaly.title}
      eyebrow="Unregistered item"
      onBack={onBack}
      backLabel="Archive"
      focusOnMount={focusOnMount}
    >
      <section className="panel" aria-label="File details">
        <dl className="catalogue">
          {anomaly.fields.map((field) => (
            <div key={field.label} className="catalogue__row">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <figure className="print">
        <PhotoViewer regions={photograph.regions}>
          <WorkstationPhoto dateStamp={photograph.dateStamp} alt={photograph.alt} />
        </PhotoViewer>
        <figcaption className="print__caption">{photograph.caption}</figcaption>
      </figure>

      <article className="document" aria-labelledby="register-heading">
        <header className="document__header">
          <p className="document__stamp">Asset register</p>
          <h2 id="register-heading" className="document__title">
            {register.heading}
          </h2>
        </header>
        <dl className="document__fields">
          {register.fields.map((field) => (
            <div key={field.label} className="document__field">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <p className="anomaly-note">{anomaly.note}</p>
    </ScreenLayout>
  );
}
