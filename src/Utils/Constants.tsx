import { defaultTime, Time } from '../interface/Time.tsx'
import { parseIntSafe } from './Utils.tsx'
import '../App.css'

export interface DistanceDetail {
  distance: number
  name: string
}

export interface Distance<T> {
  Marathon: T
  SemiMarathon: T
  km10: T
  km5: T
  km3: T
  m1500: T
  m800: T
}

export interface DistanceInfo extends Distance<DistanceDetail> {}
export const distancesInfo: DistanceInfo = {
  Marathon: { distance: 42_195, name: 'Marathon' },
  SemiMarathon: { distance: 21_098, name: 'Semi Marathon' },
  km10: { distance: 10_000, name: '10 km' },
  km5: { distance: 5_000, name: '5 km' },
  km3: { distance: 3_000, name: '3 km' },
  m1500: { distance: 1_500, name: '1500 m' },
  m800: { distance: 800, name: '800 m' },
}

export const defaultDistanceTime: Distance<Time> = {
  Marathon: defaultTime,
  SemiMarathon: defaultTime,
  km10: defaultTime,
  km5: defaultTime,
  km3: defaultTime,
  m1500: defaultTime,
  m800: defaultTime,
}

export const animErrorDuration = parseIntSafe(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--animation-error-duration'
  )
)
