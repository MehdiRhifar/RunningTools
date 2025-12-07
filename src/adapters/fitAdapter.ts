import FitParser from 'fit-file-parser'
import { FitLap, NormalizedLap } from '../types/activity'

/**
 * Adaptateur pour parser et convertir les fichiers FIT
 */
export class FitAdapter {
  /**
   * Parse un fichier FIT (version asynchrone pour composant)
   */
  static async parseFile(file: File): Promise<any> {
    const arrayBuffer = await file.arrayBuffer()

    return new Promise((resolve, reject) => {
      const fitParser = new FitParser({
        force: true,
        speedUnit: 'm/s',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: true,
        mode: 'list', // Important : mode 'list' pour compatibilité
      })

      fitParser.parse(arrayBuffer, (error: any, data: any) => {
        if (error) {
          reject(new Error(`Erreur lors du parsing : ${error.message}`))
          return
        }
        resolve(data)
      })
    })
  }

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
      .map((lap) => this.toLap(lap))
      .filter((lap) => lap.timeMilliseconds > 0) // Filtrer les laps invalides
  }

  /**
   * Extrait le nom de l'activité depuis les données FIT
   */
  static getActivityName(fitData: any): string {
    const session = fitData.sessions?.[0]
    if (session?.sport) {
      const date = new Date()
      return `${session.sport} ${date.toLocaleDateString('fr-FR')}`
    }
    return 'Activité FIT'
  }

  /**
   * Extrait la distance totale
   */
  static getTotalDistance(fitData: any): number {
    const session = fitData.sessions?.[0]
    return session?.total_distance || 0
  }

  /**
   * Extrait le temps total
   */
  static getTotalTime(fitData: any): number {
    const session = fitData.sessions?.[0]
    return session?.total_elapsed_time || 0
  }
}
