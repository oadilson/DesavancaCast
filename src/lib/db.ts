import { Episode } from '@/types/podcast';

const DB_NAME = 'podcast-downloads';
const DB_VERSION = 1;
const STORE_NAME = 'episodes';

let db: IDBDatabase;

export interface StoredEpisode extends Episode {
  audioBlob: Blob;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('Error opening IndexedDB.');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addEpisodeToDB = async (episode: Episode, audioBlob: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const storedEpisode: StoredEpisode = { ...episode, audioBlob };
    const request = store.put(storedEpisode);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error adding episode to DB:', (event.target as IDBRequest).error);
      reject('Could not save episode.');
    };
  });
};

export const getDownloadedEpisodes = async (): Promise<StoredEpisode[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as StoredEpisode[]);
    };
    request.onerror = (event) => {
      console.error('Error getting episodes from DB:', (event.target as IDBRequest).error);
      reject('Could not retrieve episodes.');
    };
  });
};

export const getDownloadedEpisode = async (id: string): Promise<StoredEpisode | undefined> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result as StoredEpisode | undefined);
        };
        request.onerror = (event) => {
            console.error('Error getting episode from DB:', (event.target as IDBRequest).error);
            reject('Could not retrieve episode.');
        };
    });
};


export const deleteDownloadedEpisode = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error deleting episode from DB:', (event.target as IDBRequest).error);
      reject('Could not delete episode.');
    };
  });
};