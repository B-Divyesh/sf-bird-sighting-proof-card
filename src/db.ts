import type { SightingDraft } from './types';

const REAL_DB_NAME = 'bird-proof-card';
const DEMO_DB_NAME = 'demo:bird-proof-card';
const STORE = 'drafts';
let dbName = REAL_DB_NAME;

export const configureDatabase = (demo: boolean) => { dbName = demo ? DEMO_DB_NAME : REAL_DB_NAME; };

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const transact = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = action(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
};

export const saveDraft = (draft: SightingDraft) => transact('readwrite', store => store.put(draft));
export const getDrafts = () => transact<SightingDraft[]>('readonly', store => store.getAll());
export const deleteDraft = (id: string) => transact('readwrite', store => store.delete(id));

export const resetDemoDatabase = () => new Promise<void>((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DEMO_DB_NAME);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Close another demo tab, then reset again.'));
});
