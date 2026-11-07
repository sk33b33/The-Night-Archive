import { useId, useState } from 'react';
import type { EvidenceId, PhotoEvidence } from '../../../domain/evidence';
import { PHOTO_ARTWORK } from './artwork';
import { PhotoCompare } from './PhotoCompare';
import { PhotoViewer } from './PhotoViewer';

interface PhotoEvidenceViewProps {
  readonly item: PhotoEvidence;
  /** Other photographs the player can compare against. */
  readonly others: readonly PhotoEvidence[];
  readonly compareId: EvidenceId | '';
  readonly onCompareChange: (id: EvidenceId | '') => void;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  readonly onDiscover: (discoveryId: string) => readonly string[];
}

export function PhotoEvidenceView({ item, others, compareId, onCompareChange, onDiscover }: PhotoEvidenceViewProps) {
  const id = useId();
  const [filed, setFiled] = useState<readonly string[]>([]);
  const compared = others.find((o) => o.id === compareId);
  const Artwork = PHOTO_ARTWORK[item.artwork];

  const discover = (discoveryId: string) => {
    const titles = onDiscover(discoveryId);
    if (titles.length > 0) setFiled((prev) => [...prev, ...titles]);
  };

  return (
    <>
      {others.length > 0 && (
        <div className="field doc-tools">
          <label htmlFor={`${id}-compare`}>Compare with</label>
          <select
            id={`${id}-compare`}
            value={compareId}
            onChange={(event) => onCompareChange(event.target.value as EvidenceId | '')}
          >
            <option value="">No comparison</option>
            {others.map((other) => (
              <option key={other.id} value={other.id}>
                {other.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {compared ? (
        <PhotoCompare left={item} right={compared} onMatch={discover} />
      ) : (
        <figure className="print">
          {Artwork ? (
            <PhotoViewer
              regions={item.regions}
              onExamine={(region) => {
                if (region.revealsDiscovery) discover(region.revealsDiscovery);
              }}
            >
              <Artwork alt={item.alt} />
            </PhotoViewer>
          ) : (
            <p className="notice notice--warning" role="alert">
              This photograph could not be displayed.
            </p>
          )}
          <figcaption className="print__caption">{item.caption}</figcaption>
        </figure>
      )}

      {filed.length > 0 && (
        <p className="notice notice--filed" role="status">
          Added to the case files: {filed.join(', ')}.
        </p>
      )}
    </>
  );
}
