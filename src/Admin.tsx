import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { addCategory, getCategories, deleteCategory, updateCategory, addWord, getWords, deleteWord } from '@/lib/db';
import type { Category, Word } from '@/lib/db';

// ShadCN-inspired components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'default', ...props }) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium text-white transition';
    const variants: Record<string, string> = {
        default: 'bg-blue-500 hover:bg-blue-600',
        destructive: 'bg-red-600 hover:bg-red-700',
        secondary: 'bg-emerald-500 hover:bg-emerald-600',
    };
    return (
        <button className={`${baseStyles} ${variants[variant]} `} {...props}>
            {children}
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input: React.FC<InputProps> = ({ ...props }) => (
    <input className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
);

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
    <div className={`border rounded - lg p - 4 bg - white shadow - sm ${className || ''} `}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="font-bold text-lg mb-2">{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;

const Admin: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [words, setWords] = useState<Word[]>([]);
    const [newCategory, setNewCategory] = useState<{ title: string; picture: File | null }>({ title: '', picture: null });
    const [newWord, setNewWord] = useState<{ text: string; audio: File | null; image: File | null; categoryId: number | null }>({
        text: '',
        audio: null,
        image: null,
        categoryId: null,
    });
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadWords(selectedCategory);
    }, [selectedCategory]);

    const loadCategories = async () => {
        const cats = await getCategories();
        setCategories(cats);
    };

    const loadWords = async (categoryId: number | null) => {
        const w = await getWords(categoryId);
        setWords(w);
    };

    const handleAddCategory = async () => {
        if (newCategory.title && newCategory.picture) {
            await addCategory(newCategory.title, newCategory.picture);
            setNewCategory({ title: '', picture: null });
            loadCategories();
        }
    };

    const handleUpdateCategory = async () => {
        if (editingCategory && editingCategory.title) {
            await updateCategory(editingCategory.id!, editingCategory.title, editingCategory.picture || categories.find(c => c.id === editingCategory.id)!.picture);
            setEditingCategory(null);
            loadCategories();
        }
    };

    const handleDeleteCategory = async (id: number) => {
        await deleteCategory(id);
        setSelectedCategory(null);
        loadCategories();
    };

    const handleAddWord = async () => {
        if (newWord.text && newWord.audio && newWord.image && newWord.categoryId) {
            await addWord(newWord.text, newWord.audio, newWord.image, newWord.categoryId);
            setNewWord({ text: '', audio: null, image: null, categoryId: null });
            loadWords(selectedCategory);
        }
    };

    const handleDeleteWord = async (id: number) => {
        await deleteWord(id);
        loadWords(selectedCategory);
    };

    const handleCategoryPictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (editingCategory) {
            setEditingCategory({ ...editingCategory, picture: file! });
        } else {
            setNewCategory({ ...newCategory, picture: file });
        }
    };



    return (
        <div className="bg-gradient-to-t to-[#cad0ffa7]  from-white flex flex-col items-center justify-center p-8 min-h-screen">
            <h1 className="text-[52px] text-[#120047] font-bold font-poppins">Admin Dashboard</h1>
            {/* <CreateCategoryDialog />
            <CreateWordDialog /> */}
            <Card className="mb-4">
                <CardHeader>Manage Categories</CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Category Title"
                            value={editingCategory ? editingCategory.title : newCategory.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const title = e.target.value;
                                if (editingCategory) {
                                    setEditingCategory({ ...editingCategory, title });
                                } else {
                                    setNewCategory({ ...newCategory, title });
                                }
                            }}
                        />
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryPictureChange}
                        />
                        {editingCategory ? (
                            <Button onClick={handleUpdateCategory}>Update Category</Button>
                        ) : (
                            <Button onClick={handleAddCategory}>Add Category</Button>
                        )}
                        {editingCategory && (
                            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <Card key={category.id} className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">{category.title}</h3>
                                    <img src={URL.createObjectURL(category.picture)} alt={category.title} className="w-16 h-16 object-cover mt-2" />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setNewCategory({ title: '', picture: null });
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteCategory(category.id!)}>
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    Manage Words {selectedCategory && `in Category ${categories.find(c => c.id === selectedCategory)?.title} `}
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <select
                            className="border rounded-md px-3 py-2"
                            value={newWord.categoryId ?? ''}
                            onChange={(e) => setNewWord({ ...newWord, categoryId: Number(e.target.value) || null })}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                        <Input
                            placeholder="Word"
                            value={newWord.text}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, text: e.target.value })}
                        />
                        <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, audio: e.target.files?.[0] || null })}
                        />
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord({ ...newWord, image: e.target.files?.[0] || null })}
                        />
                        <Button onClick={handleAddWord}>Add Word</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {words.map((word) => (
                            <Card key={word.id} className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">{word.text}</h3>
                                    <audio controls src={URL.createObjectURL(word.audio)} className="mt-2" />
                                    <img src={URL.createObjectURL(word.image)} alt={word.text} className="w-16 h-16 object-cover mt-2" />
                                </div>
                                <Button variant="destructive" onClick={() => handleDeleteWord(word.id!)}>
                                    Delete
                                </Button>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Admin;
