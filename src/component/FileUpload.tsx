import { useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  loading?: boolean
}

export function FileUpload({ onFileSelect, disabled = false, loading = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
      // Reset input pour permettre de sélectionner le même fichier à nouveau
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="text-center">
      <label className="block text-gray-300 mb-4">
        Importer un fichier FIT :
      </label>

      <div className="flex justify-center mb-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".fit"
          onChange={handleFileChange}
          disabled={disabled || loading}
          className="hidden"
          id="fit-file-upload"
        />
        <label
          htmlFor="fit-file-upload"
          className={`
            cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-colors
            ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? 'Traitement...' : '📁 Choisir un fichier .FIT'}
        </label>
      </div>

      <p className="text-xs text-gray-400">
        Téléchargez le fichier .FIT depuis votre montre (Coros, Garmin, Polar, etc.)
      </p>
    </div>
  )
}
