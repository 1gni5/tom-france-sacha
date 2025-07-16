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
import { addCategory, addWord } from "@/lib/db"
import { useState, useRef } from "react"
import JSZip from "jszip"

export function UploadZipDialog() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processZipFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress("Extraction du fichier ZIP...")

    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)

      // Get all directories (levels)
      const directories = new Set<string>()

      Object.keys(zipContent.files).forEach(fileName => {
        const pathParts = fileName.split('/')
        if (pathParts.length > 1 && pathParts[0] !== '') {
          directories.add(pathParts[0])
        }
      })

      let processedLevels = 0
      const totalLevels = directories.size

      for (const dirName of directories) {
        setUploadProgress(`Traitement du niveau : ${dirName} (${processedLevels + 1}/${totalLevels})`)

        // Find background image for this level
        let backgroundFile: File | null = null
        const backgroundPattern = new RegExp(`^${dirName}/(background|bg)\\.(jpg|jpeg|png|webp)$`, 'i')

        for (const [fileName, zipEntry] of Object.entries(zipContent.files)) {
          if (backgroundPattern.test(fileName) && !zipEntry.dir) {
            const blob = await zipEntry.async('blob')
            backgroundFile = new File([blob], fileName.split('/').pop() || 'background.jpg', {
              type: blob.type || 'image/jpeg'
            })
            break
          }
        }

        // Create category (level) with background
        if (backgroundFile) {
          const categoryId = await addCategory(dirName, backgroundFile)

          // Find all image/audio pairs in this directory
          const filesInDir = Object.keys(zipContent.files)
            .filter(fileName => fileName.startsWith(`${dirName}/`) && !zipContent.files[fileName].dir)
            .filter(fileName => !backgroundPattern.test(fileName))

          // Group files by name (without extension)
          const fileGroups: { [key: string]: { image?: string, audio?: string } } = {}

          filesInDir.forEach(fileName => {
            const baseName = fileName.split('/').pop()
            if (!baseName) return

            const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "")
            const extension = baseName.split('.').pop()?.toLowerCase()

            if (!fileGroups[nameWithoutExt]) {
              fileGroups[nameWithoutExt] = {}
            }

            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
              fileGroups[nameWithoutExt].image = fileName
            } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
              fileGroups[nameWithoutExt].audio = fileName
            }
          })

          // Create words for each complete pair
          let wordsCreated = 0
          for (const [wordName, files] of Object.entries(fileGroups)) {
            if (files.image && files.audio) {
              try {
                // Extract image file
                const imageZipEntry = zipContent.files[files.image]
                const imageBlob = await imageZipEntry.async('blob')
                const imageFile = new File([imageBlob], files.image.split('/').pop() || 'image.jpg', {
                  type: imageBlob.type || 'image/jpeg'
                })

                // Extract audio file
                const audioZipEntry = zipContent.files[files.audio]
                const audioBlob = await audioZipEntry.async('blob')
                const audioFile = new File([audioBlob], files.audio.split('/').pop() || 'audio.mp3', {
                  type: audioBlob.type || 'audio/mpeg'
                })

                // Add word to database
                await addWord(wordName, audioFile, imageFile, categoryId)
                wordsCreated++
              } catch (error) {
                console.error(`Error processing word "${wordName}":`, error)
              }
            }
          }

          setUploadProgress(`✅ Niveau "${dirName}" terminé : ${wordsCreated} mots ajoutés`)
        } else {
          setUploadProgress(`⚠️ Niveau "${dirName}" ignoré : aucune image de fond trouvée`)
          console.warn(`No background image found for level: ${dirName}`)
        }

        processedLevels++
      }

      setUploadProgress(`🎉 Import terminé ! ${totalLevels} niveaux traités avec succès`)

      // Reset form after a delay
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 4000)

    } catch (error) {
      console.error('Error processing zip file:', error)
      setUploadProgress(`❌ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      setIsUploading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/zip') {
      await processZipFile(file)
    } else {
      alert('Veuillez sélectionner un fichier ZIP valide')
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type === 'application/zip') {
      if (fileInputRef.current) {
        // Create a new FileList-like object
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
      await processZipFile(file)
    } else {
      alert('Veuillez déposer un fichier ZIP valide')
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          Importer ZIP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importer des niveaux depuis un ZIP</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="text-sm text-gray-600">
            <p>Téléchargez un fichier ZIP contenant des niveaux avec la structure suivante :</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
{`level1/
├── background.jpg
├── chat.jpg
├── chat.mp3
├── chien.jpg
└── chien.mp3`}
            </pre>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="zip-upload">Fichier ZIP</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isUploading ? (
                <div>
                  <div className="text-blue-600 font-medium">Traitement en cours...</div>
                  <div className="text-sm text-gray-600 mt-1">{uploadProgress}</div>
                </div>
              ) : (
                <div>
                  <div className="text-gray-600">
                    Glissez-déposez un fichier ZIP ici, ou cliquez pour sélectionner
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="mt-2"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
