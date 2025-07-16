import { openDB, } from 'idb';
import type { IDBPDatabase } from 'idb';

export interface Category {
    id?: number;
    title: string;
    picture: string; // base64 string instead of File
    pictureType: string; // MIME type
    createdAt: string;
    isCompleted?: boolean;
}

export interface Word {
    id?: number;
    text: string;
    audio: string; // base64 string instead of File
    audioType: string; // MIME type
    image: string; // base64 string instead of File
    imageType: string; // MIME type
    categoryId: number | null;
    createdAt: string;
}

async function getDatabase(): Promise<IDBPDatabase> {
    return openDB('words', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('files')) {
                const fileStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
                fileStore.createIndex('categoryId', 'categoryId');
            }
        },
    });
}

export async function addCategory(title: string, picture: File): Promise<number> {
    const db = await getDatabase();

    // Convert File to base64 outside of transaction
    const pictureBase64 = await fileToBase64(picture);

    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');

    const id = await store.add({
        title,
        picture: pictureBase64,
        pictureType: picture.type,
        createdAt: new Date().toISOString(),
        isCompleted: false,
    });
    await transaction.done;
    return id as number;
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

export async function getCategories(): Promise<Category[]> {
    const db = await getDatabase();
    const transaction = db.transaction('categories', 'readonly');
    const store = transaction.objectStore('categories');
    const categories = await store.getAll();
    await transaction.done;
    return categories;
}

export async function deleteCategory(id: number): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction(['categories', 'files'], 'readwrite');
    const categoryStore = transaction.objectStore('categories');
    const fileStore = transaction.objectStore('files');
    const files = await fileStore.index('categoryId').getAll(id);
    for (const file of files) {
        await fileStore.delete(file.id);
    }
    await categoryStore.delete(id);
    await transaction.done;
}

export async function updateCategory(id: number, title: string, picture: File): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');

    // Get existing category to preserve isCompleted flag
    const existingCategory = await store.get(id);

    // Convert File to base64
    const pictureBase64 = await fileToBase64(picture);

    await store.put({
        id,
        title,
        picture: pictureBase64,
        pictureType: picture.type,
        createdAt: new Date().toISOString(),
        isCompleted: existingCategory?.isCompleted || false
    });
    await transaction.done;
}

export async function markCategoryCompleted(id: number, completed: boolean = true): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');

    // Get existing category
    const existingCategory = await store.get(id);
    if (existingCategory) {
        await store.put({
            ...existingCategory,
            isCompleted: completed
        });
    }
    await transaction.done;
}

export async function addWord(word: string, audio: File, image: File, categoryId: number | null): Promise<number> {
    const db = await getDatabase();

    // Convert Files to base64 outside of transaction
    const audioBase64 = await fileToBase64(audio);
    const imageBase64 = await fileToBase64(image);

    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');

    const id = await store.add({
        text: word,
        audio: audioBase64,
        audioType: audio.type,
        image: imageBase64,
        imageType: image.type,
        categoryId,
        createdAt: new Date().toISOString(),
    });
    await transaction.done;
    return id as number;
}

export async function getWords(categoryId: number | null = null): Promise<Word[]> {
    const db = await getDatabase();
    const transaction = db.transaction('files', 'readonly');
    const store = transaction.objectStore('files');
    const words = categoryId
        ? await store.index('categoryId').getAll(categoryId)
        : await store.getAll();
    await transaction.done;
    return words;
}

export async function deleteWord(id: number): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    await store.delete(id);
    await transaction.done;
}

// Bulk operations for better performance during ZIP imports
export async function addCategoryWithWords(
    title: string,
    picture: File,
    words: Array<{ text: string; audio: File; image: File }>
): Promise<number> {
    const db = await getDatabase();

    // Convert all files to base64 first (outside of transactions)
    const pictureBase64 = await fileToBase64(picture);
    const wordsData = await Promise.all(
        words.map(async (word) => ({
            text: word.text,
            audio: await fileToBase64(word.audio),
            audioType: word.audio.type,
            image: await fileToBase64(word.image),
            imageType: word.image.type,
        }))
    );

    // Add category first
    const categoryTransaction = db.transaction('categories', 'readwrite');
    const categoryStore = categoryTransaction.objectStore('categories');

    const categoryId = await categoryStore.add({
        title,
        picture: pictureBase64,
        pictureType: picture.type,
        createdAt: new Date().toISOString(),
        isCompleted: false,
    });
    await categoryTransaction.done;

    // Add words in batches to avoid transaction timeouts
    const batchSize = 5;
    for (let i = 0; i < wordsData.length; i += batchSize) {
        const batch = wordsData.slice(i, i + batchSize);
        const wordsTransaction = db.transaction('files', 'readwrite');
        const wordsStore = wordsTransaction.objectStore('files');

        for (const wordData of batch) {
            await wordsStore.add({
                ...wordData,
                categoryId: categoryId as number,
                createdAt: new Date().toISOString(),
            });
        }
        await wordsTransaction.done;
    }

    return categoryId as number;
}
