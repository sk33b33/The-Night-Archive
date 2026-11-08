import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CASE_001_REEL, VOICE_ISOLATION } from '../../../content/cases/case-001-audio';
import { CASE_007_TONIGHT } from '../../../content/cases/case-007-audio';
import { evidenceId, type AudioEvidence } from '../../../domain/evidence';
import { AudioCompare } from './AudioCompare';

afterEach(cleanup);

const base = { kind: 'audio' as const, reference: 'R', description: 'd', unlock: { type: 'initial' as const }, catalogue: [], fixedFilters: [] };
const tonight: AudioEvidence = { ...base, id: evidenceId('t'), title: 'Tonight', timeline: CASE_007_TONIGHT, filters: [VOICE_ISOLATION] };
const reel: AudioEvidence = { ...base, id: evidenceId('r'), title: '1981 reel', timeline: CASE_001_REEL, filters: [VOICE_ISOLATION] };

describe('AudioCompare', () => {
  it('jumps both recordings to a matched segment and records the discovery', () => {
    const onDiscover = vi.fn(() => ['Audio comparison note']);
    render(<AudioCompare left={tonight} right={reel} onDiscover={onDiscover} createEngine={() => null} />);
    fireEvent.click(screen.getByRole('button', { name: /^Announcement/ }));
    expect(onDiscover).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /^Voices/ }));
    expect(onDiscover).toHaveBeenCalledWith('c007-recordings-match');
    expect(screen.getByText('Added to the case files: Audio comparison note.')).toBeTruthy();
    // Both caption boxes show the voices segment.
    expect(screen.getAllByText('Don’t open the east door.')).toHaveLength(2);
  });

  it('plays one recording at a time; switching sides changes what plays', () => {
    const starts: string[] = [];
    const engine = (label: string) => ({
      start: () => starts.push(label),
      stop: () => {},
      dispose: () => {},
    });
    render(
      <AudioCompare
        left={tonight}
        right={reel}
        onDiscover={() => []}
        createEngine={(item) => engine(item.title)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Play Tonight' }));
    expect(starts).toEqual(['Tonight']);
    fireEvent.click(screen.getByRole('radio', { name: '1981 reel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play 1981 reel' }));
    expect(starts).toEqual(['Tonight', '1981 reel']);
  });

  it('the filter applies to the recording being listened to', () => {
    render(<AudioCompare left={tonight} right={reel} onDiscover={() => []} createEngine={() => null} />);
    fireEvent.click(screen.getByRole('button', { name: /^Voices/ }));
    expect(screen.queryByText('Mara, don’t file this.')).toBeNull();
    fireEvent.click(screen.getByRole('switch', { name: /Voice isolation/ }));
    expect(screen.getAllByText('Mara, don’t file this.')).toHaveLength(1);
  });
});
