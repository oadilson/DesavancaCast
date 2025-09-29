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

// Helper function to ensure the retrieved object is a proper Blob
const ensureBlobInstance = (obj: any): Blob | undefined => {
  if (obj instanceof Blob) {
    return obj;
  }
  // If it's an object that looks like a Blob (has type and size), try to reconstruct it.
  // This is a common workaround for IndexedDB deserialization quirks.
  if (typeof obj === 'object' && obj !== null && 'type' in obj && 'size' in obj) {
    try {
      // Create a new Blob from the object. This works if the object's internal data
      // is still accessible or if it's a Blob-like object that can be wrapped.
      // Note: This might not work in all edge cases if the internal data is truly lost.
      return new Blob([obj], { type: obj.type });
    } catch (e) {
      console.warn('Failed to reconstruct Blob from stored object:', e);
      return undefined;
    }
  }
  return undefined;
};

export const getDownloadedEpisodes = async (): Promise<StoredEpisode[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as StoredEpisode[];
      const formattedResults = results.map(item => {
        const audioBlob = ensureBlobInstance(item.audioBlob);
        if (audioBlob) {
          return { ...item, audioBlob };
        }
        console.warn('Skipping episode due to invalid audioBlob:', item.id);
        return null; // Filter out items with invalid blobs
      }).filter((item): item is StoredEpisode => item !== null); // Filter out nulls
      resolve(formattedResults);
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
            const result = request.result as StoredEpisode | undefined;
            if (result && result.audioBlob) {
                const audioBlob = ensureBlobInstance(result.audioBlob);
                if (audioBlob) {
                    resolve({ ...result, audioBlob });
                    return;
                }
                console.warn('Retrieved episode has invalid audioBlob:', result.id);
            }
            resolve(undefined); // Resolve with undefined if episode or blob is invalid
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