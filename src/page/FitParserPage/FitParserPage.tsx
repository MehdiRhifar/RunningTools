import { useEffect, useState } from 'react'
import { MainContainer } from '../../component/MainContainer.tsx'
import { FitFileImport } from './FitFileImport.tsx'
// import { StravaImport } from '../../component/StravaImport.tsx'
import { stravaService } from '../../services/stravaService'
import { IntervalService } from '../../services/intervalService'
import { TIMEOUTS } from '../../constants/pagination'
import { paceToString } from '../../interface/Pace.tsx'
import { timeToStringMinimalist } from '../../interface/Time.tsx'
import { totalMillisecondsToTime } from '../../Utils/Utils.tsx'
import type { IntervalSet } from '../../types/activity'
import { StravaImport } from './StravaImport.tsx'

type TemplateType = 'strava-temps' | 'strava-allures' | 'custom'

const TEMPLATES = {
  'strava-temps': {
    id: 'strava-temps',
    label: 'Strava - Temps uniquement',
    template: '{distance}m : {times} | {avgPace}/km',
  },
  'strava-allures': {
    id: 'strava-allures',
    label: 'Strava - Avec allures',
    template: '{times} | {paces}/km{recBetween}{recAfter}',
  },
  custom: { id: 'custom', label: 'Custom', template: '' },
} as const

const DEFAULT_CUSTOM_TEMPLATE = `{countPrefix}{distance}m : {times} ({avgPace}/km){recBetween}{recAfter}`

// Helper function to format time in milliseconds to string
function formatTimeForDisplay(milliseconds: number): string {
  const time = totalMillisecondsToTime(milliseconds)
  return timeToStringMinimalist(time)
}

export function FitParserPage() {
  const [intervalSets, setIntervalSets] = useState<IntervalSet[]>([])
  const [sessionTitle, setSessionTitle] = useState<string>('')
  const [formattedText, setFormattedText] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('strava-temps')
  const [customTemplate, setCustomTemplate] = useState<string>(
    DEFAULT_CUSTOM_TEMPLATE
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null)
  const [updatingActivity, setUpdatingActivity] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // --- Vérifier l'authentification Strava ---

  useEffect(() => {
    const token = stravaService.getToken()
    setIsAuthenticated(!!token)
  }, [])

  // --- Auto-dismiss success message ---

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, TIMEOUTS.SUCCESS_MESSAGE_DURATION)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // --- Handlers pour les imports ---

  const handleImportSuccess = (data: {
    intervalSets: IntervalSet[]
    sessionTitle: string
    formattedText: string
    activityId?: string
  }) => {
    setIntervalSets(data.intervalSets)
    setSessionTitle(data.sessionTitle)
    setFormattedText(data.formattedText)
    setCurrentActivityId(data.activityId || null)
    setLoading(false)
    setError('')
  }

  const handleImportError = (errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
  }

  // --- Helpers UI ---

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template)
    if (intervalSets.length > 0) {
      const templateStr = template === 'custom' ? customTemplate : TEMPLATES[template].template
      const text = IntervalService.generateFormattedText(intervalSets, templateStr)
      setFormattedText(text)
    }
  }

  const copyToClipboard = () => {
    const fullText = sessionTitle
      ? `${sessionTitle}\n\n${formattedText}`
      : formattedText
    navigator.clipboard
      .writeText(fullText)
      .then(() => setSuccessMessage('📋 Texte copié dans le presse-papier !'))
      .catch(() => setError('Erreur lors de la copie'))
  }

  const handleUpdateActivity = async () => {
    if (!currentActivityId) {
      setError('Aucune activité sélectionnée')
      return
    }

    setUpdatingActivity(true)
    setError('')
    setSuccessMessage('')

    try {
      const description = `${formattedText}\n\nmade by runningtools.fr`
      await stravaService.updateActivity(currentActivityId, sessionTitle, description)
      setSuccessMessage('✅ Activité mise à jour sur Strava avec succès !')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l'activité"
      )
    } finally {
      setUpdatingActivity(false)
    }
  }

  const currentTemplate = selectedTemplate === 'custom' ? customTemplate : TEMPLATES[selectedTemplate].template

  return (
    <MainContainer maxWidth="700px">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Analyse de séance
      </h2>

      {/* Import fichier FIT */}
      <FitFileImport
        onImportSuccess={handleImportSuccess}
        onError={handleImportError}
        disabled={loading}
        template={currentTemplate}
      />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">OU</span>
        </div>
      </div>

      <StravaImport
        onImportSuccess={handleImportSuccess}
        onError={handleImportError}
        onAuthChange={setIsAuthenticated}
        disabled={loading}
        template={currentTemplate}
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-200 hover:text-green-100 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {formattedText && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">Résumé de la séance :</h3>
            <div className="flex items-center gap-2">
              <label
                htmlFor="template-select"
                className="text-sm text-gray-400"
              >
                Format :
              </label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) =>
                  handleTemplateChange(e.target.value as TemplateType)
                }
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              >
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sessionTitle && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Titre de la séance :
              </label>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-100 font-semibold">{sessionTitle}</p>
              </div>
            </div>
          )}

          {selectedTemplate === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Template personnalisé :
                <span className="ml-2 text-xs">
                  Variables : {'{countPrefix}'}, {'{count}'}, {'{distance}'},{' '}
                  {'{times}'}, {'{paces}'}, {'{avgPace}'}, {'{recBetween}'},{' '}
                  {'{recAfter}'}
                </span>
              </label>
              <textarea
                value={customTemplate}
                onChange={(e) => {
                  const newTemplate = e.target.value
                  setCustomTemplate(newTemplate)
                  if (intervalSets.length > 0) {
                    const text = IntervalService.generateFormattedText(
                      intervalSets,
                      newTemplate
                    )
                    setFormattedText(text)
                  }
                }}
                rows={3}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm font-mono"
                placeholder="Ex: {count} x {distance}m | {times} | {paces}/km"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Détails :
            </label>
            <div className="bg-gray-800 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-gray-100 font-mono">
                {formattedText}
                <br />
                made by runningtools.fr
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            {currentActivityId && isAuthenticated ? (
              <>
                <button
                  onClick={handleUpdateActivity}
                  disabled={updatingActivity}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {updatingActivity ? 'Mise à jour...' : 'Mettre à jour sur Strava'}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Copier
                </button>
              </>
            ) : (
              <button
                onClick={copyToClipboard}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Copier pour Strava
              </button>
            )}
          </div>
        </div>
      )}

      {intervalSets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">
            Détails des intervalles :
          </h3>
          <div className="space-y-4">
            {intervalSets.map((set, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-lg">
                    {set.count} x {set.distance}m
                    {(set.recoveryBetween || set.recoveryAfter) && (
                      <span className="text-sm text-gray-400 font-normal ml-2">
                        {set.recoveryBetween
                          ? `(r${formatTimeForDisplay(set.recoveryBetween)}) `
                          : ''}
                        {set.recoveryAfter
                          ? `(R${formatTimeForDisplay(set.recoveryAfter)})`
                          : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400">
                    Allure moy: {paceToString(set.avgPace)}/km
                  </div>
                </div>
                <div className="text-gray-300">
                  Temps : {set.times.map(formatTimeForDisplay).join(' - ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainContainer>
  )
}
