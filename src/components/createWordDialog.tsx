import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addWord } from "@/lib/words"
import { useForm } from "react-hook-form"
import settingsButton from "@/assets/settingsButton.png"
import { UploadZipDialog } from "./UploadZipDialog"

type FormValues = {
  word: string
  audio: FileList
  image: FileList
}

export function CreateWordDialog() {
  const { register, handleSubmit, reset } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    await addWord(data.word, data.audio[0], data.image[0]);
    reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button>Open Dialog</Button> */}
        <button className="p-4 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600">
          <img src={settingsButton} alt="Settings Icon" className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gestion des mots</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Import ZIP Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Import par ZIP</h3>
            <p className="text-sm text-gray-600 mb-3">
              Importez plusieurs niveaux avec leurs mots depuis un fichier ZIP
            </p>
            <UploadZipDialog />
          </div>

          {/* Manual Word Addition Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Ajouter un mot manuellement</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="text-1">Mot</Label>
                  <Input id="text-1" {...register("word", { required: true })} />
                </div>
                <div className="grid gap-4">
                  <Label htmlFor="audio-1">Audio</Label>
                  <Input id="audio-1" type="file" {...register("audio", { required: true })} />
                </div>
                <div className="grid gap-4">
                  <Label htmlFor="image-1">Image</Label>
                  <Input id="image-1" type="file" {...register("image", { required: true })} />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
