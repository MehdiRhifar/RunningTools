import { Interval, IntervalSet, NormalizedLap, WorkoutSummary } from '../types/activity'
import { timeMsToPace } from '../Utils/Utils'
import { Pace, paceToString } from '../interface/Pace'
import { totalMillisecondsToTime } from '../Utils/Utils'
import { timeToStringMinimalist } from '../interface/Time'

/**
 * Service pour analyser les laps et détecter les intervalles
 */
export class IntervalService {
  /**
   * Arrondit une distance aux valeurs standards (50m, 100m, 200m, 500m)
   */
  private static roundToStandardDistance(distance: number): number {
    let step: number
    if (distance <= 1000) step = 50
    else if (distance <= 3000) step = 100
    else if (distance <= 10000) step = 200
    else step = 500
    return Math.round(distance / step) * step
  }

  /**
   * Détermine si un lap est une récupération
   * Critères: distance très courte OU (distance < 400m ET allure très lente > 5'30/km)
   */
  private static isRecoveryLap(distance: number, timeMilliseconds: number): boolean {
    const paceSecondsPerKm = (timeMilliseconds / 1000 / distance) * 1000

    // Repos si distance quasi nulle (GPS mal capté)
    if (distance < 50) return true

    // Repos si distance courte ET allure lente
    return distance < 400 && paceSecondsPerKm > 330;
  }

  /**
   * Convertit les laps normalisés en intervalles détectés
   */
  static extractIntervals(laps: NormalizedLap[]): Interval[] {
    const intervals: Interval[] = []

    for (const lap of laps) {
      const { distance: rawDistance, timeMilliseconds } = lap

      // Ignorer les laps aberrants (0s)
      if (timeMilliseconds <= 0) continue

      const isRecovery = this.isRecoveryLap(rawDistance, timeMilliseconds)

      // Si récupération, garder la distance brute, sinon arrondir
      const distance = isRecovery
        ? rawDistance
        : this.roundToStandardDistance(rawDistance)

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

  /**
   * Groupe les intervalles en sets (ex: 5 x 400m)
   */
  static groupIntervals(intervals: Interval[]): IntervalSet[] {
    const sets: IntervalSet[] = []

    let currentSet: {
      distance: number
      timesMs: number[]
      paces: Pace[]
      internalRecoveries: number[]
    } | null = null

    let pendingRecovery: number | null = null

    intervals.forEach((interval) => {
      // Si c'est une récupération, la stocker pour plus tard
      if (interval.isRecovery) {
        pendingRecovery = interval.timeMilliseconds
        return
      }

      // Cas 1: Continuation de la série en cours (même distance)
      if (currentSet && interval.distance === currentSet.distance) {
        // Repos entre les répétitions
        if (pendingRecovery !== null) {
          currentSet.internalRecoveries.push(pendingRecovery)
          pendingRecovery = null
        }

        currentSet.timesMs.push(interval.timeMilliseconds)
        currentSet.paces.push(interval.pace)
      }
      // Cas 2: Nouvelle série (distance différente ou première série)
      else {
        // Clôturer la série précédente
        if (currentSet) {
          this.finalizeAndPushSet(sets, currentSet, pendingRecovery)
        }

        // Démarrer une nouvelle série
        currentSet = {
          distance: interval.distance,
          timesMs: [interval.timeMilliseconds],
          paces: [interval.pace],
          internalRecoveries: [],
        }
        pendingRecovery = null
      }
    })

    // Ne pas oublier la dernière série
    if (currentSet) {
      this.finalizeAndPushSet(sets, currentSet, pendingRecovery)
    }

    return sets
  }

  /**
   * Finalise un set et l'ajoute à la liste
   */
  private static finalizeAndPushSet(
    sets: IntervalSet[],
    currentSet: {
      distance: number
      timesMs: number[]
      paces: Pace[]
      internalRecoveries: number[]
    },
    lastPendingRecovery: number | null
  ): void {
    const count = currentSet.timesMs.length

    // Calcul allure moyenne
    const totalTime = currentSet.timesMs.reduce((a, b) => a + b, 0)
    const totalDist = currentSet.distance * count
    const avgPace = timeMsToPace(totalDist, totalTime)

    // Calcul repos moyen entre répétitions
    let recoveryBetween: number | undefined = undefined
    if (currentSet.internalRecoveries.length > 0) {
      const totalRec = currentSet.internalRecoveries.reduce((a, b) => a + b, 0)
      recoveryBetween = totalRec / currentSet.internalRecoveries.length
    }

    // Repos après la série
    const recoveryAfter = lastPendingRecovery !== null ? lastPendingRecovery : undefined

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

  /**
   * Formate un temps en millisecondes vers une chaîne minimale (ex: "1'25")
   */
  private static formatTime(milliseconds: number): string {
    const time = totalMillisecondsToTime(milliseconds)
    return timeToStringMinimalist(time)
  }

  /**
   * Génère le titre de la séance (ex: "10 x 400m + 5 x 200m")
   */
  static generateTitle(sets: IntervalSet[]): string {
    const titles = sets.map((set) => {
      const countPrefix = set.count > 1 ? `${set.count} x ` : ''
      return `${countPrefix}${set.distance}m`
    })
    return titles.join(' - ')
  }

  /**
   * Génère le texte formaté selon un template
   */
  static generateFormattedText(
    sets: IntervalSet[],
    template: string
  ): string {
    const lines = sets.map((set) => {
      const timesStr = set.times.map(this.formatTime).join(' - ')
      const pacesStr = set.paces.map(paceToString).join(' - ')

      const recBetweenStr = set.recoveryBetween
        ? ` R${this.formatTime(set.recoveryBetween)}`
        : ''
      const recAfterStr = set.recoveryAfter
        ? ` RS=${this.formatTime(set.recoveryAfter)}`
        : ''

      const countPrefix = set.count > 1 ? `${set.count} x ` : ''

      let result = template
      result = result.replace(/{countPrefix}/g, countPrefix)
      result = result.replace(/{count}/g, set.count.toString())
      result = result.replace(/{distance}/g, set.distance.toString())
      result = result.replace(/{times}/g, timesStr)
      result = result.replace(/{paces}/g, pacesStr)
      result = result.replace(/{avgPace}/g, paceToString(set.avgPace))
      result = result.replace(/{recBetween}/g, recBetweenStr)
      result = result.replace(/{recAfter}/g, recAfterStr)

      return result
    })

    return lines.join('\n')
  }

  /**
   * Génère un résumé complet de la séance
   */
  static generateWorkoutSummary(
    sets: IntervalSet[],
    template: string
  ): WorkoutSummary {
    return {
      title: this.generateTitle(sets),
      intervalSets: sets,
      formattedText: this.generateFormattedText(sets, template),
    }
  }
}
