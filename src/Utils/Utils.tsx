import { Pace } from '../interface/Pace.tsx'
import { Time, timeToTotalSeconds } from '../interface/Time.tsx'

export const parseIntSafe = (str: string): number => {
  return parseInt(str.replace(thousandsSeparatorSymbol, '')) || 0
}

export const parseNumberSafe = (str: string): number => {
  return parseFloat(
    str
      .replaceAll(thousandsSeparatorSymbol, '')
      .replaceAll(decimalSeparatorSymbol, '.')
  )
}

export function formatTime(value: number) {
  return isNaN(value) ? '00' : String(value).padStart(2, '0')
}

export const thousandsSeparatorSymbol: string = Number(1000)
  .toLocaleString()
  .charAt(1)
export const decimalSeparatorSymbol: string = Number(1000.1)
  .toLocaleString()
  .charAt(5)

export function toLocaleString(value: number) {
  return Number(value).toLocaleString()
}
export function secondsKmToKmHours(totalSeconds: number) {
  if (totalSeconds == 0) {
    return 0
  }
  return 3600 / totalSeconds
}

export function totalSecondsToPace(totalSeconds: number): Pace {
  totalSeconds = Math.round(totalSeconds)
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: Math.round(totalSeconds % 60),
  }
}

export function totalSecondsToTime(totalSeconds: number): Time {
  totalSeconds = Math.round(totalSeconds)
  if (totalSeconds < 0 || totalSeconds > 35_9999) {
    // inf ou sup au min/max
    return {
      hours: 99,
      minutes: 59,
      seconds: 59,
    }
  }
  const hours = Math.floor(totalSeconds / 3600)
  const totalSeconds2 = totalSeconds - 3600 * hours
  return {
    hours: hours,
    minutes: Math.floor(totalSeconds2 / 60),
    seconds: Math.round(totalSeconds2 % 60),
  }
}

export function toPace(speed: number): Pace {
  const secPerKm = speedToSecondsKm(speed)
  return totalSecondsToPace(secPerKm)
}

export function speedToSecondsKm(speed: number) {
  if (speed == 0) {
    return 0
  }
  return 3600 / speed
}

export function equivalent(
  referenceTime: Time,
  referenceDistance: number,
  goalDistance: number
): Time {
  const factor = Math.pow(goalDistance / referenceDistance, 1.06)
  return totalSecondsToTime(timeToTotalSeconds(referenceTime) * factor)
}

export const getKeys = Object.keys as <T extends object>(
  obj: T
) => Array<keyof T>

// Fonction pour obtenir la valeur numérique d'une variable CSS
