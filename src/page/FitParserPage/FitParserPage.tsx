import React, { useState } from 'react'
import { MainContainer } from '../../component/MainContainer.tsx'
import FitParser from 'fit-file-parser'
import { timeMsToPace, totalMillisecondsToTime } from '../../Utils/Utils.tsx'
import { timeToStringMinimalist } from '../../interface/Time.tsx'
import { Pace, paceToString } from '../../interface/Pace.tsx'

// --- Interfaces ---

interface Interval {
  distance: number
  timeMilliseconds: number
  pace: Pace
  isRecovery: boolean
}

interface IntervalSet {
  count: number
  distance: number
  times: number[] // Liste des temps d'effort
  paces: Pace[] // Liste des allures d'effort
  avgPace: Pace // Allure moyenne de la série
  recoveryBetween?: number // Moyenne du repos INTRA série (ex: r1')
  recoveryAfter?: number // Repos APRÈS la série (ex: R3')
}

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

const TITRE_TEMPLATE = '{countPrefix}{distance}m'

const DEFAULT_CUSTOM_TEMPLATE = `{countPrefix}{distance}m : {times} ({avgPace}/km){recBetween}{recAfter}`

export function FitParserPage() {
  const [parsedData, setParsedData] = useState<any>(null)
  const [intervalSets, setIntervalSets] = useState<IntervalSet[]>([])
  const [sessionTitle, setSessionTitle] = useState<string>('')
  const [formattedText, setFormattedText] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('strava-temps')
  const [customTemplate, setCustomTemplate] = useState<string>(
    DEFAULT_CUSTOM_TEMPLATE
  )

  // --- Helpers d'affichage ---

  const formatTimeForDisplay = (milliseconds: number): string => {
    const time = totalMillisecondsToTime(milliseconds)
    return timeToStringMinimalist(time)
  }

  // --- Logique Métier ---

  const roundToStandardDistance = (distance: number): number => {
    let step: number
    if (distance <= 1000) step = 50
    else if (distance <= 3000) step = 100
    else if (distance <= 10000) step = 200
    else step = 500
    return Math.round(distance / step) * step
  }

  const isRecoveryLap = (
    distance: number,
    timeMilliseconds: number
  ): boolean => {
    // Seuil arbitraire : si c'est très lent (> 5'30/km pour du fractionné) et court
    // Note: Pour améliorer ça, il faudrait regarder le champ "intensity" du fichier FIT si dispo
    const paceSecondsPerKm = (timeMilliseconds / 1000 / distance) * 1000
    // On considère repos si distance < 400m ET allure lente,
    // OU si la distance est quasi nulle (repos statique mal capté par GPS)
    return distance < 50 || (distance < 400 && paceSecondsPerKm > 330)
  }

  const extractIntervalsFromLaps = (laps: any[]): Interval[] => {
    const intervals: Interval[] = []

    for (const lap of laps) {
      const rawDistance = lap.total_distance || 0
      const timeSeconds = lap.total_timer_time || lap.total_elapsed_time || 0
      const timeMilliseconds = timeSeconds * 1000

      // Ignorer les laps aberrants (0s)
      if (timeMilliseconds <= 0) continue

      const isRecovery = isRecoveryLap(rawDistance, timeMilliseconds)

      // Si c'est un repos, on garde la distance réelle (même si 0), sinon on arrondit
      const distance: number = isRecovery
        ? rawDistance
        : roundToStandardDistance(rawDistance)

      // Calcul du pace
      const pace = timeMsToPace(distance, timeMilliseconds)

      intervals.push({
        distance,
        timeMilliseconds,
        pace,
        isRecovery,
      })
    }

    return intervals
  }

  const groupIntervals = (intervals: Interval[]): IntervalSet[] => {
    const sets: IntervalSet[] = []

    // Variables temporaires pour construire le set en cours
    let currentSet: {
      distance: number
      timesMs: number[]
      paces: Pace[]
      internalRecoveries: number[] // Liste des repos ENTRE les répétitions du set
    } | null = null

    let pendingRecovery: number | null = null // Stocke un repos en attente d'attribution

    intervals.forEach((interval) => {
      if (interval.isRecovery) {
        pendingRecovery = interval.timeMilliseconds
        return
      }

      // Cas 1 : Continuation de la série en cours
      if (currentSet && interval.distance === currentSet.distance) {
        // Si on avait un repos en attente, c'est un repos "ENTRE" les répétitions
        if (pendingRecovery !== null) {
          currentSet.internalRecoveries.push(pendingRecovery)
          pendingRecovery = null
        }

        currentSet.timesMs.push(interval.timeMilliseconds)
        currentSet.paces.push(interval.pace)
      }
      // Cas 2 : Nouvelle série (distance différente ou première série)
      else {
        // Si une série était déjà en cours, on la clôture
        if (currentSet) {
          finalizeAndPushSet(sets, currentSet, pendingRecovery)
        }

        currentSet = {
          distance: interval.distance,
          timesMs: [interval.timeMilliseconds],
          paces: [interval.pace],
          internalRecoveries: [],
        }
        pendingRecovery = null
      }
    })

    // Ne pas oublier de pousser la toute dernière série à la fin de la boucle
    if (currentSet) {
      finalizeAndPushSet(sets, currentSet, pendingRecovery)
    }

    return sets
  }

  // Helper pour calculer les moyennes et fermer le set proprement
  const finalizeAndPushSet = (
    sets: IntervalSet[],
    currentSet: {
      distance: number
      timesMs: number[]
      paces: Pace[]
      internalRecoveries: number[]
    },
    lastPendingRecovery: number | null
  ) => {
    const count = currentSet.timesMs.length

    // Calcul Allure Moyenne
    const totalTime = currentSet.timesMs.reduce((a, b) => a + b, 0)
    const totalDist = currentSet.distance * count
    const avgPace = timeMsToPace(totalDist, totalTime)

    // Calcul Repos Moyen (Entre les répétitions)
    let recoveryBetween: number | undefined = undefined
    if (currentSet.internalRecoveries.length > 0) {
      const totalRec = currentSet.internalRecoveries.reduce((a, b) => a + b, 0)
      recoveryBetween = totalRec / currentSet.internalRecoveries.length
    }

    // Le repos "Après" est le dernier repos rencontré avant le changement de distance
    const recoveryAfter =
      lastPendingRecovery !== null ? lastPendingRecovery : undefined

    sets.push({
      count,
      distance: currentSet.distance,
      times: currentSet.timesMs,
      paces: currentSet.paces,
      avgPace,
      recoveryBetween,
      recoveryAfter,
    })
  }

  // --- Génération de texte ---

  const replaceTemplateVariables = (
    template: string,
    set: IntervalSet
  ): string => {
    const distanceInM = set.distance
    const timesStr = set.times.map(formatTimeForDisplay).join(' - ')
    const pacesStr = set.paces.map(paceToString).join(' - ')

    // Formatage des repos
    const recBetweenStr = set.recoveryBetween
      ? ` R${formatTimeForDisplay(set.recoveryBetween)}`
      : ''
    const recAfterStr = set.recoveryAfter
      ? ` RS=${formatTimeForDisplay(set.recoveryAfter)}`
      : ''

    // Préfixe conditionnel pour count (affiche "10 x " si count > 1, rien sinon)
    const countPrefix = set.count > 1 ? `${set.count} x ` : ''

    let result = template
    result = result.replace(/{countPrefix}/g, countPrefix)
    result = result.replace(/{count}/g, set.count.toString())
    result = result.replace(/{distance}/g, distanceInM.toString())
    result = result.replace(/{times}/g, timesStr)
    result = result.replace(/{paces}/g, pacesStr)
    result = result.replace(/{avgPace}/g, paceToString(set.avgPace))
    result = result.replace(/{recBetween}/g, recBetweenStr)
    result = result.replace(/{recAfter}/g, recAfterStr)

    return result
  }

  const generateSessionTitle = (sets: IntervalSet[]): string => {
    const titles = sets.map((set) =>
      replaceTemplateVariables(TITRE_TEMPLATE, set)
    )
    return titles.join(' + ')
  }

  const generateFormattedTextWithTemplate = (
    sets: IntervalSet[],
    templateType: TemplateType,
    customTemplateOverride?: string
  ): string => {
    let templateStr: string

    if (templateType === 'custom') {
      templateStr = customTemplateOverride ?? customTemplate
    } else {
      templateStr = TEMPLATES[templateType].template
    }

    const lines = sets.map((set) => replaceTemplateVariables(templateStr, set))
    return lines.join('\n')
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setParsedData(null)
    setIntervalSets([])
    setSessionTitle('')
    setFormattedText('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const fitParser = new FitParser({
        force: true,
        speedUnit: 'm/s',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: true,
        mode: 'list',
      })

      fitParser.parse(arrayBuffer, (error: any, data: any) => {
        if (error) {
          setError(`Erreur lors du parsing : ${error.message}`)
          setLoading(false)
          return
        }

        setParsedData(data)
        const laps = data.laps || []

        if (laps.length === 0) {
          setError('Aucun lap trouvé dans le fichier .fit')
          setLoading(false)
          return
        }

        const detectedIntervals = extractIntervalsFromLaps(laps)

        if (detectedIntervals.length === 0) {
          setError('Aucun intervalle valide détecté')
          setLoading(false)
          return
        }

        // Nouvelle logique de regroupement
        const grouped = groupIntervals(detectedIntervals)
        setIntervalSets(grouped)

        const title = generateSessionTitle(grouped)
        setSessionTitle(title)

        const text = generateFormattedTextWithTemplate(
          grouped,
          selectedTemplate
        )
        setFormattedText(text)

        setLoading(false)
      })
    } catch (err) {
      setError(
        `Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      )
      setLoading(false)
    }
  }

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template)
    if (intervalSets.length > 0) {
      const text = generateFormattedTextWithTemplate(intervalSets, template)
      setFormattedText(text)
    }
  }

  const copyToClipboard = () => {
    const fullText = sessionTitle
      ? `${sessionTitle}\n\n${formattedText}`
      : formattedText
    navigator.clipboard
      .writeText(fullText)
      .then(() => alert('Texte copié !'))
      .catch(() => alert('Erreur lors de la copie'))
  }

  return (
    <MainContainer maxWidth="700px">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Parser de fichier .FIT
      </h2>

      <div className="mb-6">
        <p className="text-gray-300 mb-4 text-center">
          Importez un fichier .fit pour générer un résumé de votre séance
          d'entraînement
        </p>

        <div className="flex justify-center">
          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Choisir un fichier .fit
            <input
              type="file"
              accept=".fit"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-300 my-4">
          Analyse en cours...
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
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
                    const text = generateFormattedTextWithTemplate(
                      intervalSets,
                      'custom',
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

          <button
            onClick={copyToClipboard}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Copier pour Strava
          </button>
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
                    {/* Affichage discret du repos si présent */}
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

      {parsedData && parsedData.laps && (
        <div className="mt-8 text-sm text-gray-400">
          <p>Fichier analysé : {parsedData.laps.length} laps détectés</p>
        </div>
      )}
    </MainContainer>
  )
}
