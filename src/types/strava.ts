export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  start_date: string
  start_date_local: string
  type: string
  has_laps: boolean
  map: {
    summary_polyline: string
    resource_state: number
  } | null
}

export interface StravaLap {
  distance: number
  elapsed_time: number
  moving_time: number
  pace_zone: number
  average_speed: number
}

export interface StravaActivityDetail {
  id: number
  name: string
  distance: number
  moving_time: number
  laps: StravaLap[]
  map: {
    summary_polyline: string
    polyline: string
  }
}
