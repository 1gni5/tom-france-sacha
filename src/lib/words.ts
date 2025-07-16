import { openDB } from "idb";

async function getWordsDatabase() {
    return openDB('pwa-files', 1, {
        upgrade(db) {
            db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        },
    });
}

export async function addWord(word: string, audio: File, image: File) {
    const db = await getWordsDatabase();
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');

    const fileData = {
        text: word,
        audio,
        image,
        createdAt: new Date().toISOString(),
    };

    const id = await store.add(fileData);
    await transaction.done;

    return id as number;
}

export async function getWords() {
    const db = await getWordsDatabase();
    const transaction = db.transaction('files', 'readonly');
    const store = transaction.objectStore('files');

    const words = await store.getAll();
    await transaction.done;

    return words;
}

export async function deleteWord(id: number) {
    const db = await getWordsDatabase();
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');

    await store.delete(id);
    await transaction.done;
}