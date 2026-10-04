// Définissez les actions pour votre reducer
import {
  defaultPace,
  Pace,
  toSpeed,
  totalMillisecondsPerKm,
  toTime,
} from '../../interface/Pace.js'
import { toPace, totalMillisecondsToPace } from '../../Utils/Utils.tsx'
import { Time } from '../../interface/Time.tsx'

export interface PercentagePageState {
  percent: number
  pace: Pace // Valeur affichée dans le champ allure (synchronisée depuis l'extérieur)
  basePace: Pace // Allure de référence (100 %) utilisée pour les calculs
  pacePercent: Pace
  speed: number
  speedPercent: number

  distance: number
  timeForDist: Time
}

export enum PercentageActionType {
  SET_PERCENT,
  SET_PACE,
  SET_SPEED,
  SET_DISTANCE,
}

// Définir une interface pour chaque type d'action
interface SetNumberAction {
  type:
    | PercentageActionType.SET_PERCENT
    | PercentageActionType.SET_SPEED
    | PercentageActionType.SET_DISTANCE
  payload: number
}

interface SetPaceAction {
  type: PercentageActionType.SET_PACE
  payload: Pace
}

// Utiliser une union pour regrouper tous les types d'action
type ActionType = SetNumberAction | SetPaceAction

function calculateSpeedPercent(percent: number, speed: number): number {
  return (percent * speed) / 100
}

function calculatePacePercent(percent: number, pace: Pace): Pace {
  if (percent == 0) {
    return defaultPace
  }
  const totalMs = totalMillisecondsPerKm(pace)
  const msPercent = (totalMs * 100) / percent
  return totalMillisecondsToPace(msPercent)
}

// Fonction de réduction
export const percentageReducer = (
  state: PercentagePageState,
  action: ActionType
) => {
  switch (action.type) {
    case PercentageActionType.SET_PERCENT: {
      const newPercent = action.payload
      const newPacePercent = calculatePacePercent(newPercent, state.basePace)
      const newSpeedPercent = calculateSpeedPercent(
        newPercent,
        toSpeed(state.basePace)
      )
      return {
        ...state,
        pacePercent: newPacePercent,
        speedPercent: newSpeedPercent,
        timeForDist: toTime(state.distance, newPacePercent),
      }
    }
    case PercentageActionType.SET_PACE: {
      const newPace = action.payload
      const newPacePercent = calculatePacePercent(state.percent, newPace)
      // La vitesse affichée est arrondie, mais les calculs partent de la valeur exacte
      const exactSpeed = toSpeed(newPace)
      const newSpeed = Number(exactSpeed.toFixed(2))
      const newSpeedPercent = calculateSpeedPercent(state.percent, exactSpeed)
      return {
        ...state,
        basePace: newPace,
        pacePercent: newPacePercent,
        speed: newSpeed,
        speedPercent: newSpeedPercent,
        timeForDist: toTime(state.distance, newPacePercent),
      }
    }
    case PercentageActionType.SET_SPEED: {
      const newSpeed = action.payload
      const newSpeedPercent = calculateSpeedPercent(state.percent, newSpeed)
      const newPace = toPace(newSpeed)
      const newPacePercent = calculatePacePercent(state.percent, newPace)
      return {
        ...state,
        speedPercent: newSpeedPercent,
        pace: newPace,
        basePace: newPace,
        pacePercent: newPacePercent,
        timeForDist: toTime(state.distance, newPacePercent),
      }
    }
    case PercentageActionType.SET_DISTANCE: {
      const distance = action.payload
      const timeForDist = toTime(distance, state.pacePercent)
      return {
        ...state,
        distance: distance,
        timeForDist: timeForDist,
      }
    }
    default:
      return state
  }
}
