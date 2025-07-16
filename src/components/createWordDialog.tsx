import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Category, getCategories, addWord } from "@/lib/db";
import { useState, useEffect } from "react";


interface FormData {
    name: string;
    image: FileList;
    audio: FileList;
    category: string;
}

export function CreateWordDialog() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Define form schema with zod
    const schema = z.object({
        name: z.string().min(1, "Le mot est requis"),
        image: z
            .instanceof(FileList)
            .refine((files) => files?.length > 0, "Une image est requise"),
        audio: z
            .instanceof(FileList)
            .refine((files) => files?.length > 0, "Un fichier audio est requis"),
        category: z.string().min(1, "La catégorie est requise"),
    });

    // Initialize useForm with schema and default values
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            image: undefined,
            audio: undefined,
            category: "",
        },
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                setFetchError("Erreur lors du chargement des catégories");
            }
        };
        fetchCategories();
    }, []);

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        try {
            console.log("Form submitted:", data);
            await addWord(data.name, data.image[0], data.audio[0], categories.find(cat => cat.id === parseInt(data.category))?.id || null);
            form.reset(); // Reset form on successful submission
        } catch (error) {
            console.error("Erreur lors de l'ajout du mot:", error);
            form.setError("root", { message: "Erreur lors de l'ajout du mot" });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Créer un mot</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un mot</DialogTitle>
                    <DialogDescription>
                        Chaque mot représente un élément de jeu pour Sacha.
                    </DialogDescription>
                </DialogHeader>
                {fetchError && <p className="text-red-500">{fetchError}</p>}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot</FormLabel>
                                    <FormControl>
                                        <Input id="name-1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="image-1"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="audio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Audio</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="audio-1"
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catégorie</FormLabel>
                                    <FormControl>
                                        <select
                                            id="category-1"
                                            {...field}
                                            className="w-full border rounded-md p-2"
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => form.reset()}
                                >
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button type="submit">Créer</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}