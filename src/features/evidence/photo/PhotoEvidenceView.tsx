import { useState } from 'react';
import type { PhotoEvidence } from '../../../domain/evidence';
import { PHOTO_ARTWORK } from './artwork';
import { PhotoViewer } from './PhotoViewer';

interface PhotoEvidenceViewProps {
  readonly item: PhotoEvidence;
  /** Records a discovery; returns titles of evidence newly filed by it. */
  readonly onDiscover: (discoveryId: string) => readonly string[];
}

export function PhotoEvidenceView({ item, onDiscover }: PhotoEvidenceViewProps) {
  const [filed, setFiled] = useState<readonly string[]>([]);
  const Artwork = PHOTO_ARTWORK[item.artwork];
  return (
    <figure className="print">
      {Artwork ? (
        <PhotoViewer
          regions={item.regions}
          onExamine={(region) => {
            if (!region.revealsDiscovery) return;
            const titles = onDiscover(region.revealsDiscovery);
            if (titles.length > 0) setFiled((prev) => [...prev, ...titles]);
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
      {filed.length > 0 && (
        <p className="notice notice--filed" role="status">
          Added to the case files: {filed.join(', ')}.
        </p>
      )}
    </figure>
  );
}
