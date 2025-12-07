import { FitLap, NormalizedLap } from '../types/activity'

/**
 * Adaptateur pour convertir les laps FIT en format normalisé
 */
export class FitAdapter {
  /**
   * Convertit un lap FIT en lap normalisé
   */
  static toLap(fitLap: FitLap): NormalizedLap {
    const distance = fitLap.total_distance || 0
    const timeSeconds = fitLap.total_timer_time || fitLap.total_elapsed_time || 0

    return {
      distance,
      timeSeconds,
      timeMilliseconds: timeSeconds * 1000,
    }
  }

  /**
   * Convertit un tableau de laps FIT en laps normalisés
   */
  static toLaps(fitLaps: FitLap[]): NormalizedLap[] {
    return fitLaps
      .map(lap => this.toLap(lap))
      .filter(lap => lap.timeMilliseconds > 0) // Filtrer les laps invalides
  }
}
