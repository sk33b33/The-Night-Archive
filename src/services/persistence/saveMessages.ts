import type { SaveState } from './useSaveGame';

/** Player-facing explanations for save-related states. */

export function continueUnavailableReason(state: SaveState): string {
  if (state.status === 'loading') return 'Checking for a saved shift…';
  switch (state.problem) {
    case 'corrupt':
      return 'Your saved shift could not be read. Beginning a new shift will replace it.';
    case 'newer-version':
      return 'Your saved shift was made by a newer version of the archive. Reload the page to update.';
    case 'unavailable':
      return 'This browser is not allowing storage, so shifts cannot be saved.';
    case null:
      return 'No saved shift on this device yet.';
  }
}

/** A warning to show during play when progress is not being saved, or null. */
export function saveWarning(state: SaveState): string | null {
  if (state.status !== 'ready') return null;
  if (state.problem === 'newer-version') {
    return 'Progress is not being saved: a newer version of the archive saved on this device. Reload the page to update.';
  }
  if (state.problem === 'unavailable') {
    return 'Progress is not being saved: this browser is not allowing storage.';
  }
  if (state.writeFailed) {
    return 'Your latest progress could not be saved. It will be kept while this page stays open.';
  }
  return null;
}
