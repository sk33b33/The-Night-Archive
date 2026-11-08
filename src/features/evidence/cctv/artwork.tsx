import type { ReactElement } from 'react';
import { CctvReadingRoom, type ReadingRoomScene } from './CctvReadingRoom';

export interface CctvArtworkProps {
  readonly scene: Readonly<Record<string, string | boolean>>;
  readonly time: string;
  readonly alt: string;
}

/** Keep only the scene keys the reading-room artwork understands. */
function readingRoomScene(scene: Readonly<Record<string, string | boolean>>): ReadingRoomScene {
  return {
    door: scene.door === 'ajar' ? 'ajar' : 'shut',
    lamp: scene.lamp === true,
    archivist: scene.archivist === true,
    figure: scene.figure === true,
  };
}

/** CCTV artwork by content key. */
export const CCTV_ARTWORK: Readonly<Record<string, (props: CctvArtworkProps) => ReactElement>> = {
  'reading-room-camera-2': ({ scene, time, alt }) => (
    <CctvReadingRoom scene={readingRoomScene(scene)} time={time} alt={alt} />
  ),
};
