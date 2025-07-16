import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addWord } from "@/lib/words"
import { useForm } from "react-hook-form"

type FormValues = {
  word: string
  audio: FileList
}

export function CreateWordDialog() {
  const { register, handleSubmit, reset } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    await addWord(data.word, data.audio[0]);
    reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un mot</DialogTitle>
          <DialogDescription>
            Ajouter un mot en rentrant sa représentation textuel et une prononciation.
            Une fois les informations saisies, cliquez sur "Ajouter".
          </DialogDescription>
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
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
