const dbName = 'fenna-diary-audio';
const storeName = 'recordings';

export async function saveRecording(id: string, blob: Blob) {
  const db = await openAudioDb();
  const transaction = db.transaction(storeName, 'readwrite');
  transaction.objectStore(storeName).put(blob, id);
  await waitForTransaction(transaction);
  db.close();
}

export async function loadRecording(id: string): Promise<Blob | null> {
  const db = await openAudioDb();
  const transaction = db.transaction(storeName, 'readonly');
  const request = transaction.objectStore(storeName).get(id);
  const result = await waitForRequest<Blob | undefined>(request);
  db.close();
  return result ?? null;
}

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
