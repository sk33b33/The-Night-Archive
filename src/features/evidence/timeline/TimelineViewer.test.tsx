import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { evidenceId, eventsInOrder, type EvidenceItem, type TimelineEvidence } from '../../../domain/evidence';
import { TimelineViewer } from './TimelineViewer';

afterEach(cleanup);

const logA = evidenceId('log-a');
const logB = evidenceId('log-b');
const timeline: TimelineEvidence = {
  id: evidenceId('timeline'),
  kind: 'timeline',
  title: 'The night',
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' },
  catalogue: [],
  range: { from: '02:00', to: '04:00' },
  tracks: [
    { id: 'a', label: 'Log A', source: logA },
    { id: 'b', label: 'Log B', source: logB },
    { id: 'c', label: 'Unfiled desk' },
  ],
  events: [
    { track: 'b', time: '03:40', text: 'Call.' },
    { track: 'a', time: '03:25', text: 'Door open.' },
    { track: 'c', time: '03:40', text: 'Not filed.' },
  ],
};
const doc = (id: typeof logA, title: string): EvidenceItem => ({
  id,
  kind: 'document',
  title,
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' },
  document: { stamp: 's', heading: 'h', blocks: [] },
});

const listItems = () => within(screen.getByRole('list')).getAllByRole('listitem');

describe('TimelineViewer', () => {
  it('orders events by time, then by track order', () => {
    expect(eventsInOrder(timeline).map((e) => e.text)).toEqual(['Door open.', 'Call.', 'Not filed.']);
  });

  it('lists every event in time order with its source', () => {
    const open = vi.fn();
    render(<TimelineViewer item={timeline} available={[doc(logA, 'Log A record')]} onOpenEvidence={open} />);
    const items = listItems();
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('03:25Log ADoor open.Source: Log A record'),
      expect.stringContaining('Source: a record not in your case files.'),
      expect.stringContaining('Source: no record on file.'),
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Source: Log A record' }));
    expect(open).toHaveBeenCalledWith(logA);
  });

  it('filters by source, and says so when nothing is shown', () => {
    render(<TimelineViewer item={timeline} available={[]} onOpenEvidence={() => {}} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Log A' }));
    expect(listItems()).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Log B' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Unfiled desk' }));
    expect(screen.getByText(/No sources are shown/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Log B' }));
    expect(listItems()).toHaveLength(1);
  });
});
