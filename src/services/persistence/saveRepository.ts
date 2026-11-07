import type { SaveGame } from '../../domain/save';

/**
 * Storage for the single save slot. Reads return raw data: validation and
 * migration happen in the domain layer, so storage stays format-agnostic.
 */
export interface SaveRepository {
  load(): Promise<unknown>;
  save(data: SaveGame): Promise<void>;
  clear(): Promise<void>;
}

const DB_NAME = 'night-archive';
const DB_VERSION = 1;
const STORE = 'saves';
const SLOT_KEY = 'slot-1';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function openDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open save database.'));
    request.onblocked = () => reject(new Error('Save database is blocked by another tab.'));
  });
}

export function createIndexedDbRepository(factory: IDBFactory): SaveRepository {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => {
    dbPromise ??= openDatabase(factory).catch((error: unknown) => {
      dbPromise = null; // allow a later retry
      throw error;
    });
    return dbPromise;
  };

  async function run<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const database = await db();
    const tx = database.transaction(STORE, mode);
    const result = requestToPromise(action(tx.objectStore(STORE)));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Save transaction failed.'));
      tx.onabort = () => reject(tx.error ?? new Error('Save transaction aborted.'));
    });
    return result;
  }

  return {
    load: () => run('readonly', (store) => store.get(SLOT_KEY)),
    save: async (data) => {
      await run('readwrite', (store) => store.put(data, SLOT_KEY));
    },
    clear: async () => {
      await run('readwrite', (store) => store.delete(SLOT_KEY));
    },
  };
}

export function createMemoryRepository(initial?: unknown): SaveRepository & {
  readonly stored: () => unknown;
} {
  let data: unknown = initial;
  return {
    stored: () => data,
    load: () => Promise.resolve(structuredClone(data)),
    save: (next) => {
      data = structuredClone(next);
      return Promise.resolve();
    },
    clear: () => {
      data = undefined;
      return Promise.resolve();
    },
  };
}

/** The browser's repository, or null where IndexedDB is unavailable. */
export function browserRepository(): SaveRepository | null {
  try {
    return typeof indexedDB === 'undefined' ? null : createIndexedDbRepository(indexedDB);
  } catch {
    return null;
  }
}
