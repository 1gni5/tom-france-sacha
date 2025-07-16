export const cacheFile = async (
    fileUrl: string,
    dbName: string = 'FileCacheDB',
    storeName: string = 'files',
    key: string = fileUrl
): Promise<string> => {
    try {
        // Open IndexedDB
        const openDB = (): Promise<IDBDatabase> => {
            return new Promise((resolve, reject) => {
                const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    db.createObjectStore(storeName, { keyPath: 'id' });
                };

                request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
                request.onerror = () => reject(new Error('Failed to open IndexedDB'));
            });
        };

        // Store file in IndexedDB
        const storeFile = (db: IDBDatabase, fileData: Blob): Promise<void> => {
            return new Promise((resolve, reject) => {
                const transaction: IDBTransaction = db.transaction([storeName], 'readwrite');
                const store: IDBObjectStore = transaction.objectStore(storeName);
                const request: IDBRequest = store.put({ id: key, data: fileData });

                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error('Failed to store file'));
            });
        };

        const db: IDBDatabase = await openDB();
        const response: Response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to fetch file');
        const fileBlob: Blob = await response.blob();
        await storeFile(db, fileBlob);
        return URL.createObjectURL(fileBlob);
    } catch (error: any) {
        console.error('Error caching file:', error);
        throw error;
    }
};

export const getCachedFile = async (
    fileUrl: string,
    dbName: string = 'FileCacheDB',
    storeName: string = 'files',
    key: string = fileUrl
): Promise<string> => {
    try {
        // Open IndexedDB
        const openDB = (): Promise<IDBDatabase> => {
            return new Promise((resolve, reject) => {
                const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    db.createObjectStore(storeName, { keyPath: 'id' });
                };

                request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
                request.onerror = () => reject(new Error('Failed to open IndexedDB'));
            });
        };

        // Retrieve file from IndexedDB
        const getFile = (db: IDBDatabase): Promise<Blob | undefined> => {
            return new Promise((resolve, reject) => {
                const transaction: IDBTransaction = db.transaction([storeName], 'readonly');
                const store: IDBObjectStore = transaction.objectStore(storeName);
                const request: IDBRequest<{ id: string; data: Blob } | undefined> = store.get(key);

                request.onsuccess = () => resolve(request.result?.data);
                request.onerror = () => reject(new Error('Failed to retrieve file'));
            });
        };

        const db: IDBDatabase = await openDB();
        const storedFile: Blob | undefined = await getFile(db);
        if (storedFile) {
            return URL.createObjectURL(storedFile);
        }
        // If not in cache, fetch and cache the file
        return await cacheFile(fileUrl, dbName, storeName, key);
    } catch (error: any) {
        console.error('Error retrieving cached file:', error);
        throw error;
    }
};