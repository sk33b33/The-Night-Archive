import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caseId } from '../domain/case';
import { recordVisit } from '../domain/progress';
import { createMemoryRepository } from '../services/persistence/saveRepository';
import { App } from './App';
import { back, click, closedSave, resetBrowserState } from '../test/playthrough';

beforeEach(resetBrowserState);
afterEach(cleanup);

const heading = (name: string | RegExp) => screen.getByRole('heading', { level: 1, name });

describe('the reading room follows the case you are working', () => {
  it('the desk folder, corkboard, clipboard and monitor lead into that case', async () => {
    // Cases 001–005 closed; Case 006 (with CCTV) started.
    const save = recordVisit(
      closedSave('case-001', 'case-002', 'case-003', 'case-004', 'case-005'),
      { screen: 'archive' },
      new Date('2026-01-01T02:00:00Z'),
    );
    const started = recordVisit(save, { screen: 'briefing', caseId: caseId('case-006') }, new Date('2026-01-01T02:01:00Z'));
    const resumed = recordVisit(started, { screen: 'archive' }, new Date('2026-01-01T02:02:00Z'));
    render(<App repository={createMemoryRepository(resumed)} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy());
    click('Continue');
    expect(heading('Reading room')).toBeTruthy();

    // The folder on the desk opens Case 006's files.
    click(/^Case folder on your desk/);
    expect(heading('Someone Is Watching')).toBeTruthy();
    back([{ id: 'menu' }, { id: 'archive' }]);

    // The corkboard opens the board, with the case files behind it.
    click(/^Corkboard/);
    expect(heading('Evidence board')).toBeTruthy();
    back([{ id: 'menu' }, { id: 'archive' }, { id: 'investigation', caseId: 'case-006' }]);
    expect(heading('Someone Is Watching')).toBeTruthy();
    back([{ id: 'menu' }, { id: 'archive' }]);

    // The clipboard opens findings; the monitor opens the footage.
    click(/^Findings clipboard/);
    expect(heading('Case findings')).toBeTruthy();
    back([{ id: 'menu' }, { id: 'archive' }]);
    click(/^Camera 2 monitor/);
    expect(screen.getByRole('heading', { level: 1, name: /Camera 2/ })).toBeTruthy();
  });
});
