import { describe, expect, it } from 'vitest';
import { loadDraft, parseDraft, saveDraft } from './findingsDraft';

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
}

describe('findings draft', () => {
  it('round-trips per case and clears', () => {
    const store = memory();
    const draft = { answers: { q1: 'a' }, citations: { q1: [] } };
    saveDraft(store, 'case-001', draft);
    expect(loadDraft(store, 'case-001')).toEqual(draft);
    expect(loadDraft(store, 'case-002')).toBeNull();
    saveDraft(store, 'case-001', null);
    expect(loadDraft(store, 'case-001')).toBeNull();
  });

  it('rejects malformed data and keeps only valid fields', () => {
    expect(parseDraft('{oops')).toBeNull();
    expect(parseDraft('[]')).toBeNull();
    expect(parseDraft(JSON.stringify({ answers: { q1: 'a', q2: 3 }, citations: { q1: ['x', 4], q2: 'y' } }))).toEqual({
      answers: { q1: 'a' },
      citations: { q1: ['x'] },
    });
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadDraft(broken, 'case-001')).toBeNull();
    expect(() => saveDraft(broken, 'case-001', null)).not.toThrow();
  });
});
