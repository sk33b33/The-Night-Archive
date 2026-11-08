import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClosingChoice } from '../../domain/case';
import { ClosingChoicePanel } from './ClosingChoicePanel';

afterEach(cleanup);

const choice: ClosingChoice = {
  id: 'c',
  heading: 'Close the shift',
  body: ['Context.'],
  options: [
    { value: 'a', label: 'Do A', consequence: 'A happens.' },
    { value: 'b', label: 'Do B', consequence: 'B happens.' },
  ],
};

describe('ClosingChoicePanel', () => {
  it('asks for confirmation in plain words, and going back returns focus to the options', () => {
    const onChoose = vi.fn();
    render(<ClosingChoicePanel choice={choice} chosen={undefined} onChoose={onChoose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Do B' }));
    expect(screen.getByText(/B happens\. This closes the shift and cannot be changed in this save\./)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go back' }));
    expect(onChoose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Do A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Do A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm: Do A' }));
    expect(onChoose).toHaveBeenCalledWith('a');
  });

  it('once made, only reports the choice', () => {
    render(<ClosingChoicePanel choice={choice} chosen="b" onChoose={() => {}} />);
    expect(screen.getByRole('status').textContent).toBe('Do B. The shift is closed.');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
