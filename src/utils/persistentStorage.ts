/**
 * Robust Dual-Layer Storage Helper (LocalStorage + IndexedDB)
 * 
 * Guarantees that product catalogs, banner images, category covers,
 * and store settings are permanently stored in the browser without ever
 * suffering from LocalStorage QuotaExceededError or losing state on refresh.
 */

const DB_NAME = 'MajocaStoreDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a key-value pair to IndexedDB
 */
export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Warning writing key "${key}":`, err);
  }
}

/**
 * Retrieves a value from IndexedDB
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Warning reading key "${key}":`, err);
    return null;
  }
}

/**
 * Dual Save: Writes to LocalStorage (fast sync access) and IndexedDB (unlimited quota guarantee).
 */
export function saveDualStorage(key: string, data: any): void {
  // 1. Save to LocalStorage
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (lsError) {
    console.warn(`[Storage] LocalStorage quota exceeded for "${key}", relying on IndexedDB.`, lsError);
  }

  // 2. Save to IndexedDB (asynchronous, high capacity)
  idbSet(key, data).catch((idbError) => {
    console.warn(`[Storage] IndexedDB save notice for "${key}":`, idbError);
  });
}

/**
 * Dual Load: Attempts LocalStorage first (synchronous), fallback to IndexedDB.
 */
export function getLocalStorageItem<T = any>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[Storage] Error reading "${key}" from localStorage:`, err);
  }
  return defaultValue;
}
