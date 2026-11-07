import { describe, expect, it } from 'vitest';
import { ARCHIVE_DESK } from '../content/archive';
import { ANOMALIES, FILE_0091 } from '../content/anomalies/file-0091';
import { visibleAnomalies } from './anomaly';
import { caseId } from './case';

describe('File 0091', () => {
  it('appears only once Case 001 is closed', () => {
    expect(visibleAnomalies(ANOMALIES, () => false)).toEqual([]);
    expect(visibleAnomalies(ANOMALIES, (id) => id === caseId('case-001'))).toEqual([FILE_0091]);
  });

  it('matches canon: photograph dated 14 October 1981, workstation installed 1998', () => {
    expect(FILE_0091.photograph.dateStamp).toBe('14 OCT 1981');
    expect(FILE_0091.photograph.alt).toContain('14 October 1981');
    const installed = FILE_0091.register.fields.find((f) => f.label === 'Installed');
    expect(installed?.value).toBe('1998');
  });

  it('shows the player’s own workstation', () => {
    expect(FILE_0091.photograph.alt).toContain(ARCHIVE_DESK.workstation);
    expect(FILE_0091.register.fields.some((f) => f.value.includes(ARCHIVE_DESK.workstation))).toBe(true);
  });

  it('offers no explanation', () => {
    const text = JSON.stringify(FILE_0091).toLowerCase();
    for (const word of ['because', 'explain', 'predict', 'impossible', 'time travel', 'future']) {
      expect(text).not.toContain(word);
    }
  });
});
