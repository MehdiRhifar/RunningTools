import { Pace } from './Pace.tsx'
import {
  formatMs,
  formatTime,
  totalMillisecondsToPace,
} from '../Utils/Utils.tsx'

export interface Time {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

export const defaultTime: Time = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
}

export function isZeroTime(time: Time): boolean {
  return (
    time.hours == 0 &&
    time.minutes == 0 &&
    time.seconds == 0 &&
    time.milliseconds == 0
  )
}

export function timeToTotalMilliseconds(time: Time) {
  return (
    time.hours * 3_600_000 +
    time.minutes * 60_000 +
    time.seconds * 1000 +
    time.milliseconds
  )
}

export function timeToPace(time: Time, distanceMetre: number): Pace {
  const msPerMetre = timeToTotalMilliseconds(time) / distanceMetre
  const msPerKm = msPerMetre * 1000
  return totalMillisecondsToPace(msPerKm)
}

function roundTime(time: Time, isMillisecondsMode: boolean) {
  let adjustedTime = { ...time }

  // Si on n'affiche pas les ms et qu'il y a >= 500ms, arrondir à la seconde supérieure
  if (!isMillisecondsMode && adjustedTime.milliseconds >= 500) {
    adjustedTime.seconds += 1

    // Gérer les cascades
    if (adjustedTime.seconds >= 60) {
      adjustedTime.seconds = 0
      adjustedTime.minutes += 1

      if (adjustedTime.minutes >= 60) {
        adjustedTime.minutes = 0
        adjustedTime.hours += 1
      }
    }
  }
  return adjustedTime
}

export function timeToString(time: Time, isMillisecondsMode: boolean): string {
  // Créer une copie pour ne pas modifier l'original
  let adjustedTime = roundTime(time, isMillisecondsMode)

  if (adjustedTime.hours > 99) {
    let time = '99:59:59'
    if (isMillisecondsMode) time += '.99'
    return time
  }

  let timeStrBase =
    formatTime(adjustedTime.hours) +
    ':' +
    formatTime(adjustedTime.minutes) +
    ':' +
    formatTime(adjustedTime.seconds)

  if (isMillisecondsMode) {
    timeStrBase += '.' + formatMs(time.milliseconds)
  }

  return timeStrBase
}

export function timeToStringMinimalist(time: Time) {
  if (time.hours > 0) {
    return (
      formatTime(time.hours) +
      ':' +
      formatTime(time.minutes) +
      ':' +
      formatTime(time.seconds)
    )
  } else if (time.minutes > 0) {
    return formatTime(time.minutes) + "'" + formatTime(time.seconds) + '"'
  }
  return (
    formatTime(time.seconds) + '.' + formatMs(Math.round(time.milliseconds))
  )
}
