// src/helpers/imageIndexedDB.js

const DB_NAME = "ImageSelectorDB";
const DB_VERSION = 1;
const STORE_NAME = "selectedImages";

/**
 * Open IndexedDB
 */
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Store selected image File objects
 *
 * Existing images are cleared because only one
 * selected folder/batch is required at a time.
 */
export const saveImagesToDB = async (images) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const clearRequest = store.clear();

    clearRequest.onerror = () => {
      reject(clearRequest.error);
    };

    clearRequest.onsuccess = () => {
      try {
        images.forEach((file) => {
          store.add({
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            file: file,
          });
        });
      } catch (error) {
        reject(error);
      }
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(transaction.error);
    };
  });
};

/**
 * Get all image File objects from IndexedDB
 */
export const getImagesFromDB = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];

      const files = records
        .map((record) => record.file)
        .filter(Boolean);

      resolve(files);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Get image count
 */
export const getImageCountFromDB = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result || 0);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Clear all stored images
 */
export const clearImagesFromDB = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};