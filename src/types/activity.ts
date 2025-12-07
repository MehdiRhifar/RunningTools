import { Pace } from '../interface/Pace'

// === Formats source (raw data) ===

/**
 * Format d'un lap provenant d'un fichier FIT
 */
export interface FitLap {
  total_distance: number // en mètres
  total_timer_time: number // en secondes
  total_elapsed_time: number // en secondes
}

/**
 * Format d'un lap provenant de l'API Strava
 */
export interface StravaLap {
  distance: number // en mètres
  elapsed_time: number // en secondes
  moving_time: number // en secondes
}

// === Format normalisé interne ===

/**
 * Format unifié d'un lap, indépendant de la source
 * C'est le format utilisé dans toute l'application
 */
export interface NormalizedLap {
  distance: number // en mètres
  timeSeconds: number // en secondes
  timeMilliseconds: number // en millisecondes (pour les calculs)
}

/**
 * Un intervalle détecté (effort ou récupération)
 */
export interface Interval {
  distance: number // en mètres (arrondie pour les efforts, brute pour les récupérations)
  timeMilliseconds: number
  pace: Pace
  isRecovery: boolean
}

/**
 * Un set d'intervalles groupés (ex: 5 x 400m)
 */
export interface IntervalSet {
  count: number // nombre de répétitions
  distance: number // distance en mètres
  times: number[] // temps de chaque répétition en ms
  paces: Pace[] // allures de chaque répétition
  avgPace: Pace // allure moyenne du set
  recoveryBetween?: number // repos moyen entre les répétitions (ms)
  recoveryAfter?: number // repos après le set (ms)
}

/**
 * Résumé complet d'une séance
 */
export interface WorkoutSummary {
  title: string // titre de la séance (ex: "10 x 400m + 5 x 200m")
  intervalSets: IntervalSet[] // tous les sets d'intervalles
  formattedText: string // texte formaté pour copier-coller
}
