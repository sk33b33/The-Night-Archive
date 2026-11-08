/** Facts about the player's own desk, shown from the first shift. */
export const ARCHIVE_DESK = {
  clearance: 'Level 1 · Night archivist',
  workstation: 'NA-07',
} as const;

/**
 * The Season 2 finale's closing choice and what the dashboard shows once it
 * is made (docs/cases/case-014-bible.md). Neither ending is marked as right.
 */
export const FINALE = {
  caseId: 'case-014',
  season: 2,
  choiceId: 'file-0094',
  shiftLine: {
    filed: 'Closed 06:12 · Filed: 0091, 0093, 0094',
    unfiled: 'Closed 06:12 · Not filed: 0094',
  } as Readonly<Record<string, string>>,
  ending: {
    filed: 'Season 2 is complete. In this save, intake 0094 was signed and filed.',
    unfiled: 'Season 2 is complete. In this save, intake 0094 was left unfiled.',
  } as Readonly<Record<string, string>>,
} as const;
