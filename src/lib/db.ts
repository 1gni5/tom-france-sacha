import { openDB, } from 'idb';
import type { IDBPDatabase } from 'idb';

export interface Category {
    id?: number;
    title: string;
    picture: File;
    createdAt: string;
    isCompleted?: boolean;
}

export interface Word {
    id?: number;
    text: string;
    audio: File;
    image: File;
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
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    const id = await store.add({
        title,
        picture,
        createdAt: new Date().toISOString(),
        isCompleted: false,
    });
    await transaction.done;
    return id as number;
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

    await store.put({
        id,
        title,
        picture,
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
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const id = await store.add({
        text: word,
        audio,
        image,
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
