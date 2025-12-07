import { useState, useEffect, useCallback } from 'react'
import { MainContainer } from '../../component/MainContainer.tsx'
import { ActivityCard } from '../../component/ActivityCard.tsx'
import { InfiniteScrollLoader } from '../../component/InfiniteScrollLoader.tsx'
import { stravaService } from '../../services/stravaService'
import { IntervalService } from '../../services/intervalService'
import { StravaAdapter } from '../../adapters/stravaAdapter'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION, TIMEOUTS } from '../../constants/pagination'
import type { IntervalSet } from '../../types/activity'
import type { StravaActivity } from '../../types/strava'

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
  const [stravaUrl, setStravaUrl] = useState<string>('')
  const [loadingStrava, setLoadingStrava] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false)
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null)
  const [updatingActivity, setUpdatingActivity] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [hasMoreActivities, setHasMoreActivities] = useState<boolean>(true)

  // --- Auto-dismiss success message ---

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, TIMEOUTS.SUCCESS_MESSAGE_DURATION)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // --- Initialisation Strava & OAuth Callback ---

  useEffect(() => {
    // Vérifier si tokens présents
    const token = stravaService.getToken()
    setIsAuthenticated(!!token)

    // Récupérer paramètres depuis callback OAuth
    const params = new URLSearchParams(window.location.search)

    // Gérer les erreurs OAuth
    if (params.get('auth_cancelled') === 'true') {
      setError('Connexion à Strava annulée. Vous devez autoriser l\'application pour continuer.')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (params.get('auth_error') === 'true') {
      setError('Erreur lors de la connexion à Strava. Veuillez réessayer.')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    // Récupérer tokens depuis callback OAuth
    const accessToken = params.get('strava_access_token')
    const refreshToken = params.get('strava_refresh_token')
    const expiresAt = params.get('strava_expires_at')

    if (accessToken && refreshToken && expiresAt) {
      stravaService.saveTokens(
        accessToken,
        refreshToken,
        parseInt(expiresAt)
      )
      setIsAuthenticated(true)

      // Nettoyer URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Charger les activités si authentifié
    if (token || (accessToken && refreshToken && expiresAt)) {
      loadActivities()
    }
  }, [])

  // --- Charger les activités ---

  const loadActivities = async (page: number = 1, append: boolean = false) => {
    // Éviter les chargements multiples
    if (loadingActivities) return

    setLoadingActivities(true)
    try {
      const userActivities = await stravaService.fetchUserActivities(
        page,
        PAGINATION.ACTIVITIES_PER_PAGE
      )

      // Append ou replace selon le paramètre
      if (append) {
        setActivities((prev) => [...prev, ...userActivities])
      } else {
        setActivities(userActivities)
      }

      setCurrentPage(page)

      // Si on a moins d'activités que demandé, il n'y a plus de pages
      setHasMoreActivities(userActivities.length === PAGINATION.ACTIVITIES_PER_PAGE)
    } catch (err) {
      console.error('Error loading activities:', err)
    } finally {
      setLoadingActivities(false)
    }
  }

  const loadMoreActivities = useCallback(() => {
    loadActivities(currentPage + 1, true)
  }, [currentPage])

  // --- Infinite scroll ---

  const observerTarget = useInfiniteScroll({
    hasMore: hasMoreActivities,
    isLoading: loadingActivities,
    onLoadMore: loadMoreActivities,
    rootMargin: PAGINATION.INFINITE_SCROLL_MARGIN,
    threshold: PAGINATION.INFINITE_SCROLL_THRESHOLD,
  })

  // --- Import Strava ---

  const handleActivitySelect = async (activityId: string) => {
    setLoadingStrava(true)
    setError('')
    setCurrentActivityId(activityId)

    try {
      // Récupérer les données depuis Strava
      const data = await stravaService.fetchActivityById(activityId)

      // Vérifier qu'il y a des laps
      if (!data.laps || data.laps.length === 0) {
        setError('Aucun lap trouvé dans cette activité')
        setLoadingStrava(false)
        return
      }

      // Utiliser l'adaptateur Strava pour normaliser les laps
      const normalizedLaps = StravaAdapter.toLaps(data.laps)

      // Extraire et grouper les intervalles
      const intervals = IntervalService.extractIntervals(normalizedLaps)
      if (intervals.length === 0) {
        setError('Aucun intervalle valide détecté')
        setLoadingStrava(false)
        return
      }

      const grouped = IntervalService.groupIntervals(intervals)
      setIntervalSets(grouped)

      // Générer le résumé
      const template = selectedTemplate === 'custom' ? customTemplate : TEMPLATES[selectedTemplate].template
      const summary = IntervalService.generateWorkoutSummary(grouped, template)

      setSessionTitle(summary.title)
      setFormattedText(summary.formattedText)

      setLoadingStrava(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import Strava"
      )
      setLoadingStrava(false)
    }
  }

  const handleStravaImport = async () => {
    if (!stravaUrl.trim()) {
      setError('Veuillez entrer une URL Strava')
      return
    }

    setLoadingStrava(true)
    setError('')

    try {
      // Extraire l'ID de l'activité depuis l'URL
      const activityId = stravaService.extractActivityId(stravaUrl)
      if (activityId) {
        setCurrentActivityId(activityId)
      }

      // Récupérer les données depuis Strava
      const data = await stravaService.fetchActivity(stravaUrl)

      // Vérifier qu'il y a des laps
      if (!data.laps || data.laps.length === 0) {
        setError('Aucun lap trouvé dans cette activité')
        setLoadingStrava(false)
        return
      }

      // Utiliser l'adaptateur Strava pour normaliser les laps
      const normalizedLaps = StravaAdapter.toLaps(data.laps)

      // Extraire et grouper les intervalles
      const intervals = IntervalService.extractIntervals(normalizedLaps)
      if (intervals.length === 0) {
        setError('Aucun intervalle valide détecté')
        setLoadingStrava(false)
        return
      }

      const grouped = IntervalService.groupIntervals(intervals)
      setIntervalSets(grouped)

      // Générer le résumé
      const template = selectedTemplate === 'custom' ? customTemplate : TEMPLATES[selectedTemplate].template
      const summary = IntervalService.generateWorkoutSummary(grouped, template)

      setSessionTitle(summary.title)
      setFormattedText(summary.formattedText)

      setLoadingStrava(false)
      setStravaUrl('') // Clear input
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import Strava"
      )
      setLoadingStrava(false)
    }
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

  return (
    <MainContainer maxWidth="700px">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Analyse de séance Strava
      </h2>

      {/* Import Strava */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Importer depuis Strava</h3>

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Connectez-vous à Strava pour importer vos activités
            </p>
            <button
              onClick={() => stravaService.startAuth()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Connecter Strava
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 text-sm">✓ Connecté à Strava</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  {showManualInput ? 'Voir mes activités' : 'Entrer une URL'}
                </button>
                <button
                  onClick={() => {
                    stravaService.clearTokens()
                    setIsAuthenticated(false)
                    setActivities([])
                  }}
                  className="text-xs text-gray-400 hover:text-gray-200 underline"
                >
                  Déconnecter
                </button>
              </div>
            </div>

            {showManualInput ? (
              <div>
                <label className="block text-gray-300 mb-2">
                  Collez le lien d'une activité Strava :
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stravaUrl}
                    onChange={(e) => setStravaUrl(e.target.value)}
                    placeholder="https://www.strava.com/activities/123456789"
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStravaImport()
                      }
                    }}
                  />
                  <button
                    onClick={handleStravaImport}
                    disabled={loadingStrava || !stravaUrl.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loadingStrava ? 'Chargement...' : 'Importer'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Appuyez sur Entrée ou cliquez sur Importer
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-gray-300 mb-3">
                  Sélectionnez une activité :
                </label>

                {activities.length === 0 && !loadingActivities ? (
                  <div className="text-center text-gray-400 py-8">
                    Aucune activité de course trouvée
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onSelect={handleActivitySelect}
                          disabled={loadingStrava}
                        />
                      ))}

                      <InfiniteScrollLoader
                        isLoading={loadingActivities}
                        hasMore={hasMoreActivities}
                        itemCount={activities.length}
                        observerRef={observerTarget}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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
                  {updatingActivity ? 'Mise à jour...' : '🚀 Mettre à jour sur Strava'}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  📋 Copier
                </button>
              </>
            ) : (
              <button
                onClick={copyToClipboard}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📋 Copier pour Strava
              </button>
            )}
          </div>
        </div>
      )}

      {/*{intervalSets.length > 0 && (*/}
      {/*  <div className="mt-8">*/}
      {/*    <h3 className="text-xl font-semibold mb-3">*/}
      {/*      Détails des intervalles :*/}
      {/*    </h3>*/}
      {/*    <div className="space-y-4">*/}
      {/*      {intervalSets.map((set, index) => (*/}
      {/*        <div key={index} className="bg-gray-800 p-4 rounded-lg">*/}
      {/*          <div className="flex justify-between items-start mb-2">*/}
      {/*            <div className="font-semibold text-lg">*/}
      {/*              {set.count} x {set.distance}m*/}
      {/*              /!* Affichage discret du repos si présent *!/*/}
      {/*              {(set.recoveryBetween || set.recoveryAfter) && (*/}
      {/*                <span className="text-sm text-gray-400 font-normal ml-2">*/}
      {/*                  {set.recoveryBetween*/}
      {/*                    ? `(r${formatTimeForDisplay(set.recoveryBetween)}) `*/}
      {/*                    : ''}*/}
      {/*                  {set.recoveryAfter*/}
      {/*                    ? `(R${formatTimeForDisplay(set.recoveryAfter)})`*/}
      {/*                    : ''}*/}
      {/*                </span>*/}
      {/*              )}*/}
      {/*            </div>*/}
      {/*            <div className="text-gray-400">*/}
      {/*              Allure moy: {paceToString(set.avgPace)}/km*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*          <div className="text-gray-300">*/}
      {/*            Temps : {set.times.map(formatTimeForDisplay).join(' - ')}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}
    </MainContainer>
  )
}
