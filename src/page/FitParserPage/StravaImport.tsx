import { useState, useEffect, useCallback, useRef } from 'react'
import { ActivityCard } from '../../component/ActivityCard.tsx'
import { InfiniteScrollLoader } from '../../component/InfiniteScrollLoader.tsx'
import { stravaService } from '../../services/stravaService.ts'
import { StravaAdapter } from '../../adapters/stravaAdapter.ts'
import { IntervalService } from '../../services/intervalService.ts'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.ts'
import { PAGINATION } from '../../constants/pagination.ts'
import type { IntervalSet } from '../../types/activity.ts'
import type { StravaActivity } from '../../types/strava.ts'

interface StravaImportProps {
  onImportSuccess: (data: {
    intervalSets: IntervalSet[]
    sessionTitle: string
    formattedText: string
    activityId: string
  }) => void
  onError: (error: string) => void
  onAuthChange?: (isAuthenticated: boolean) => void
  disabled?: boolean
  template: string
}

export function StravaImport({
  onImportSuccess,
  onError,
  onAuthChange,
  disabled = false,
  template,
}: StravaImportProps) {
  const [stravaUrl, setStravaUrl] = useState<string>('')
  const [loadingStrava, setLoadingStrava] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [hasMoreActivities, setHasMoreActivities] = useState<boolean>(true)
  const isLoadingRef = useRef<boolean>(false)

  // --- Initialisation Strava & OAuth Callback ---

  useEffect(() => {
    // Vérifier si tokens présents
    const token = stravaService.getToken()
    const authenticated = !!token
    setIsAuthenticated(authenticated)
    onAuthChange?.(authenticated)

    // Récupérer paramètres depuis callback OAuth
    const params = new URLSearchParams(window.location.search)

    // Gérer les erreurs OAuth
    if (params.get('auth_cancelled') === 'true') {
      onError('Connexion à Strava annulée. Vous devez autoriser l\'application pour continuer.')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (params.get('auth_error') === 'true') {
      onError('Erreur lors de la connexion à Strava. Veuillez réessayer.')
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
      onAuthChange?.(true)

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
    // Protection contre les chargements multiples avec useRef (synchrone)
    if (isLoadingRef.current) {
      console.log('Loading already in progress, skipping...')
      return
    }

    isLoadingRef.current = true
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
      isLoadingRef.current = false
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

    try {
      // Récupérer les données depuis Strava
      const data = await stravaService.fetchActivityById(activityId)

      // Vérifier qu'il y a des laps
      if (!data.laps || data.laps.length === 0) {
        onError('Aucun lap trouvé dans cette activité')
        setLoadingStrava(false)
        return
      }

      // Utiliser l'adaptateur Strava pour normaliser les laps
      const normalizedLaps = StravaAdapter.toLaps(data.laps)

      // Extraire et grouper les intervalles
      const intervals = IntervalService.extractIntervals(normalizedLaps)
      if (intervals.length === 0) {
        onError('Aucun intervalle valide détecté')
        setLoadingStrava(false)
        return
      }

      const grouped = IntervalService.groupIntervals(intervals)

      // Générer le résumé
      const summary = IntervalService.generateWorkoutSummary(grouped, template)

      onImportSuccess({
        intervalSets: grouped,
        sessionTitle: summary.title,
        formattedText: summary.formattedText,
        activityId,
      })

      setLoadingStrava(false)
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import Strava"
      )
      setLoadingStrava(false)
    }
  }

  const handleStravaImport = async () => {
    if (!stravaUrl.trim()) {
      onError('Veuillez entrer une URL Strava')
      return
    }

    setLoadingStrava(true)

    try {
      // Extraire l'ID de l'activité depuis l'URL
      const activityId = stravaService.extractActivityId(stravaUrl)

      // Récupérer les données depuis Strava
      const data = await stravaService.fetchActivity(stravaUrl)

      // Vérifier qu'il y a des laps
      if (!data.laps || data.laps.length === 0) {
        onError('Aucun lap trouvé dans cette activité')
        setLoadingStrava(false)
        return
      }

      // Utiliser l'adaptateur Strava pour normaliser les laps
      const normalizedLaps = StravaAdapter.toLaps(data.laps)

      // Extraire et grouper les intervalles
      const intervals = IntervalService.extractIntervals(normalizedLaps)
      if (intervals.length === 0) {
        onError('Aucun intervalle valide détecté')
        setLoadingStrava(false)
        return
      }

      const grouped = IntervalService.groupIntervals(intervals)

      // Générer le résumé
      const summary = IntervalService.generateWorkoutSummary(grouped, template)

      onImportSuccess({
        intervalSets: grouped,
        sessionTitle: summary.title,
        formattedText: summary.formattedText,
        activityId: activityId || '',
      })

      setLoadingStrava(false)
      setStravaUrl('') // Clear input
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import Strava"
      )
      setLoadingStrava(false)
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Importer depuis Strava (beta)</h3>

      {/* Input URL Strava - Toujours visible */}
      <div className="mb-6">
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
            disabled={loadingStrava || !stravaUrl.trim() || !isAuthenticated || disabled}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loadingStrava ? 'Chargement...' : 'Importer'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          {isAuthenticated
            ? "Appuyez sur Entrée ou cliquez sur Importer"
            : "⚠️ Vous devez être connecté à Strava pour importer une activité par URL"}
        </p>
      </div>

      {/* Connexion Strava */}
      {!isAuthenticated ? (
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            Ou connectez-vous pour voir vos activités récentes
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
            <span className="text-green-400 text-sm">✓ Connecté à Strava - Vos activités récentes</span>
            <button
              onClick={() => {
                stravaService.clearTokens()
                setIsAuthenticated(false)
                onAuthChange?.(false)
                setActivities([])
              }}
              className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
              Déconnecter
            </button>
          </div>

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
                      disabled={loadingStrava || disabled}
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
        </div>
      )}
    </div>
  )
}
