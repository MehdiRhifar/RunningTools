import { Pace } from '../interface/Pace.tsx'
import { Time } from '../interface/Time.tsx'

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
export function formatMs(value: number): string {
  if (isNaN(value)) return '00'

  const str = String(Math.floor(Math.abs(value)))
  return str.slice(0, 2).padStart(2, '0')
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

export function totalMillisecondsToPace(totalMilliseconds: number): Pace {
  const minutes = Math.floor(totalMilliseconds / 60000);
  const remainingMilliseconds = totalMilliseconds % 60000;
  const seconds = Math.floor(remainingMilliseconds / 1000);
  const milliseconds = remainingMilliseconds % 1000;

  return {
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds
  }
}

export function totalMillisecondsToTime(totalMilliseconds: number): Time {
  if (totalMilliseconds < 0 || totalMilliseconds > 359_999_000) {
    // inf ou sup au min/max (converti en ms)
    return {
      hours: 99,
      minutes: 59,
      seconds: 59,
      milliseconds: 999 // Correction: 999 ms max (pas 99)
    }
  }

  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const remainderAfterHours = totalMilliseconds % 3_600_000;
  const minutes = Math.floor(remainderAfterHours / 60_000);
  const remainderAfterMinutes = remainderAfterHours % 60_000;
  const seconds = Math.floor(remainderAfterMinutes / 1_000);
  const milliseconds = remainderAfterMinutes % 1_000;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds
  }
}


export function toPace(speed: number): Pace {
  const secPerKm = speedToMillisecondsPerKm(speed)
  return totalMillisecondsToPace(secPerKm)
}

export function speedToMillisecondsPerKm(speed: number) {
  if (speed == 0) {
    return 0
  }
  return 3_600_000 / speed
}

export const getKeys = Object.keys as <T extends object>(
  obj: T
) => Array<keyof T>

// Fonction pour obtenir la valeur numérique d'une variable CSS
