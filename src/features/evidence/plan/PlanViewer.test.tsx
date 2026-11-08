import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { evidenceId, type EvidenceItem, type PlanEvidence } from '../../../domain/evidence';
import { PlanViewer } from './PlanViewer';

afterEach(cleanup);

const source = evidenceId('log');
const plan: PlanEvidence = {
  id: evidenceId('plan'),
  kind: 'plan',
  title: 'Plan',
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' },
  catalogue: [],
  rooms: [
    { id: 'a', label: 'Room A', points: '0,0 100,0 100,100 0,100' },
    { id: 'b', label: 'Room B', points: '110,0 200,0 200,100 110,100' },
  ],
  steps: [
    { time: '05:50', entries: [{ room: 'a', text: 'Badge in.', source }] },
    { time: '06:00', entries: [{ room: 'b', text: 'Camera: someone.', source }], extraRooms: [{ id: 's', label: 'Sealed room', points: '0,110 50,110 50,150 0,150', sealed: true }] },
  ],
};
const available: EvidenceItem[] = [
  { id: source, kind: 'document', title: 'The log', reference: 'R', description: 'd', unlock: { type: 'initial' }, document: { stamp: 's', heading: 'h', blocks: [] } },
];

describe('PlanViewer', () => {
  it('lists every room with its record count at the chosen time', () => {
    render(<PlanViewer item={plan} available={available} onOpenEvidence={() => {}} />);
    expect(screen.getByRole('button', { name: /Room A.*1 record/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Room B.*No record/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: '06:00' }));
    expect(screen.getByRole('button', { name: /Room A.*No record/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Room B.*1 record/ })).toBeTruthy();
  });

  it('shows extra rooms only at their step, marked sealed', () => {
    render(<PlanViewer item={plan} available={available} onOpenEvidence={() => {}} />);
    expect(screen.queryByRole('button', { name: /Sealed room/ })).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: '06:00' }));
    expect(screen.getByRole('button', { name: /Sealed room \(sealed\)/ })).toBeTruthy();
  });

  it('shows what each record says about a room, and opens its source', () => {
    const open = vi.fn();
    render(<PlanViewer item={plan} available={available} onOpenEvidence={open} />);
    fireEvent.click(screen.getByRole('button', { name: /Room A/ }));
    expect(screen.getByText('Badge in.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Source: The log' }));
    expect(open).toHaveBeenCalledWith(source);
    fireEvent.click(screen.getByRole('button', { name: /Room B/ }));
    expect(screen.getByText(/No record speaks about this room at 05:50/)).toBeTruthy();
  });
});
