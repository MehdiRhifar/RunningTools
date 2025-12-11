import { FileUpload } from '../../component/FileUpload.tsx'
import { FitAdapter } from '../../adapters/fitAdapter.ts'
import { IntervalService } from '../../services/intervalService.ts'
import type { IntervalSet } from '../../types/activity.ts'

interface FitFileImportProps {
  onImportSuccess: (data: {
    intervalSets: IntervalSet[]
    sessionTitle: string
    formattedText: string
  }) => void
  onError: (error: string) => void
  disabled?: boolean
  template: string
}

export function FitFileImport({
  onImportSuccess,
  onError,
  disabled = false,
  template,
}: FitFileImportProps) {
  const handleFitFileImport = async (file: File) => {
    try {
      // Parser le fichier FIT
      const fitData = await FitAdapter.parseFile(file)

      // Vérifier qu'il y a des laps
      if (!fitData.laps || fitData.laps.length === 0) {
        onError('Aucun lap trouvé dans ce fichier FIT')
        return
      }

      // Convertir les laps FIT en format normalisé
      const normalizedLaps = FitAdapter.toLaps(fitData.laps)

      // Extraire et grouper les intervalles
      const intervals = IntervalService.extractIntervals(normalizedLaps)
      if (intervals.length === 0) {
        onError('Aucun intervalle valide détecté')
        return
      }

      const grouped = IntervalService.groupIntervals(intervals)

      // Générer le résumé
      const summary = IntervalService.generateWorkoutSummary(grouped, template)

      onImportSuccess({
        intervalSets: grouped,
        sessionTitle: summary.title,
        formattedText: summary.formattedText,
      })
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import du fichier FIT"
      )
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Importer un fichier FIT</h3>
      <FileUpload
        onFileSelect={handleFitFileImport}
        disabled={disabled}
        loading={disabled}
      />
    </div>
  )
}
