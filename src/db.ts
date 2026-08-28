import type { SightingDraft } from './types';

const DB_NAME = 'bird-proof-card';
const STORE = 'drafts';

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
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
