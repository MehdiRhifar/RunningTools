import { StravaLap, NormalizedLap } from '../types/activity'

/**
 * Adaptateur pour convertir les laps Strava en format normalisé
 */
export class StravaAdapter {
  /**
   * Convertit un lap Strava en lap normalisé
   */
  static toLap(stravaLap: StravaLap): NormalizedLap {
    const distance = stravaLap.distance || 0
    const timeSeconds = stravaLap.elapsed_time || 0

    return {
      distance,
      timeSeconds,
      timeMilliseconds: timeSeconds * 1000,
    }
  }

  /**
   * Convertit un tableau de laps Strava en laps normalisés
   */
  static toLaps(stravaLaps: StravaLap[]): NormalizedLap[] {
    return stravaLaps
      .map(lap => this.toLap(lap))
      .filter(lap => lap.timeMilliseconds > 0) // Filtrer les laps invalides
  }
}
