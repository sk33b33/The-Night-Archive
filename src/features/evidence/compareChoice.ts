import type { EvidenceId } from '../../domain/evidence';

/**
 * Remembers which item an evidence screen is being compared with, for this
 * tab only (sessionStorage), so a refresh keeps the comparison open.
 */
const key = (id: string) => `night-archive:compare:${id}`;

export function loadCompare(id: string, options: readonly { readonly id: EvidenceId }[]): EvidenceId | '' {
  try {
    const stored = window.sessionStorage.getItem(key(id));
    return options.find((o) => o.id === stored)?.id ?? '';
  } catch {
    return '';
  }
}

export function storeCompare(id: string, value: string): void {
  try {
    if (value) window.sessionStorage.setItem(key(id), value);
    else window.sessionStorage.removeItem(key(id));
  } catch {
    // Not kept: the comparison simply resets on refresh.
  }
}
