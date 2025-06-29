import { Time } from './Time.tsx'
import { formatTime, totalMillisecondsToTime } from '../Utils/Utils.tsx'

export interface Pace {
  minutes: number
  seconds: number
  milliseconds: number
}

export const defaultPace: Pace = {
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
}

export function totalMillisecondsPerKm(pace: Pace) {
  return (pace.minutes * 60 + pace.seconds) * 1000 + pace.milliseconds
}

export function toSpeed(pace: Pace): number {
  const paceMs = totalMillisecondsPerKm(pace)
  return paceMs == 0 ? 0 : 3_600_000 / paceMs
}

export function toTime(distanceMeter: number, pace: Pace): Time {
  const msPerKm = totalMillisecondsPerKm(pace)
  const totalMilliseconds = msPerKm * (distanceMeter / 1000)
  return totalMillisecondsToTime(totalMilliseconds)
}

export function isZeroPace(pace: Pace): boolean {
  return pace.minutes == 0 && pace.seconds == 0
}

export function paceToString(pace: Pace): string {
  return formatTime(pace.minutes) + '"' + formatTime(pace.seconds) + "'"
}
