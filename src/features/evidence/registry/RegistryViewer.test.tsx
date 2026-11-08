import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { evidenceId, type EvidenceItem, type RegistryEvidence } from '../../../domain/evidence';
import { RegistryViewer } from './RegistryViewer';

afterEach(cleanup);

const regA = evidenceId('reg-a');
const regB = evidenceId('reg-b');
const registry: RegistryEvidence = {
  id: evidenceId('registry'),
  kind: 'registry',
  title: 'Cross-reference',
  reference: 'R',
  description: 'd',
  unlock: { type: 'initial' },
  catalogue: [],
  registers: [
    { id: 'a', label: 'Register A', source: regA, entries: [{ name: 'E. Warden', post: 'Signalman', from: '1971', to: '1989' }] },
    { id: 'b', label: 'Register B', source: regB, entries: [{ name: 'E. Ward', post: 'Courier', from: '1980', to: '1981' }] },
  ],
  revealsOnSearch: { term: 'ward', discovery: 'found-ward' },
};
const available: EvidenceItem[] = [
  { id: regB, kind: 'document', title: 'Register B record', reference: 'R', description: 'd', unlock: { type: 'initial' }, document: { stamp: 's', heading: 'h', blocks: [] } },
];

function search(q: string) {
  fireEvent.change(screen.getByLabelText('Name or initial'), { target: { value: q } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
}

describe('RegistryViewer', () => {
  it('answers for every register, whole words only, and files the discovery', () => {
    const onDiscover = vi.fn(() => ['Cross-reference note']);
    const open = vi.fn();
    render(<RegistryViewer item={registry} available={available} onOpenEvidence={open} onDiscover={onDiscover} />);
    expect(screen.getByText(/Enter a surname or an initial/)).toBeTruthy();

    search('Warden');
    expect(onDiscover).not.toHaveBeenCalled();
    expect(screen.getByText('E. Warden')).toBeTruthy();
    expect(screen.getByText('Warden: 1 entry in 1 of 2 registers.')).toBeTruthy();

    search('ward');
    const a = screen.getByRole('heading', { name: 'Register A' }).closest('li');
    const b = screen.getByRole('heading', { name: 'Register B' }).closest('li');
    expect(a?.textContent).toContain('No entry.');
    expect(b?.textContent).toContain('E. Ward');
    expect(onDiscover).toHaveBeenCalledWith('found-ward');
    expect(screen.getByText('Added to the case files: Cross-reference note.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open register: Register B record' }));
    expect(open).toHaveBeenCalledWith(regB);
  });

  it('ignores an empty search', () => {
    render(<RegistryViewer item={registry} available={[]} onOpenEvidence={() => {}} onDiscover={() => []} />);
    search('   ');
    expect(screen.getByText(/Enter a surname or an initial/)).toBeTruthy();
  });
});
