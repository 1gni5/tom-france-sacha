import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addWord } from "@/lib/words"
import { useForm } from "react-hook-form"
import settingsButton from "@/assets/settingsButton.png";

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
          <DialogTitle>Ajouter un mot</DialogTitle>

        </DialogHeader>
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
          <DialogFooter className="mt-4">
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
