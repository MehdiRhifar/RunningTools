// Définissez les actions pour votre reducer
import {Pace, toSpeed, toTime} from "../../interface/Pace.js";
import {toPace} from "../../Utils.js";
import {defaultPace, Pace, toSpeed, totalSeconds, toTime} from "../../interface/Pace.js";
import {toPace, totalSecondsToPace} from "../../Utils/Utils.tsx";
import {Time} from "../../interface/Time.tsx";

export interface PercentagePageState {
    percent: number;
    pace: Pace;
    pacePercent: Pace;
    speed: number;
    speedPercent: number;

    distance: number;
    timeForDist: Time
}

export enum PercentageActionType {
    SET_PERCENT,
    SET_PACE,
    SET_SPEED,
    SET_DISTANCE
}

// Définir une interface pour chaque type d'action
interface SetNumberAction {
    type: PercentageActionType.SET_PERCENT | PercentageActionType.SET_SPEED | PercentageActionType.SET_DISTANCE;
    payload: number;
}

interface SetPaceAction {
    type: PercentageActionType.SET_PACE;
    payload: Pace;
}

// Utiliser une union pour regrouper tous les types d'action
type ActionType = SetNumberAction | SetPaceAction;


function calculateSpeedPercent(percent: number, speed: number): number {
    return (percent * speed) / 100;
}

function calculatePacePercent(percent: number, pace: Pace): Pace {
    if (percent == 0) {
        return defaultPace;
    }
    const totalSec = totalSeconds(pace)
    const secondsPercent =  totalSec * 100 / percent;
    return totalSecondsToPace(secondsPercent);
}

// Fonction de réduction
export const percentageReducer = (state: PercentagePageState, action: ActionType) => {
    switch (action.type) {
        case PercentageActionType.SET_PERCENT: {
            const newPercent = action.payload;
            const newPacePercent = calculatePacePercent(newPercent, state.pace)
            const newSpeedPercent = calculateSpeedPercent(newPercent, state.speed)
            return {
                ...state,
                percent: newPercent,
                pacePercent: newPacePercent,
                speedPercent: newSpeedPercent,
                timeForDist: toTime(state.distance, newPacePercent),
            };
        }
        case PercentageActionType.SET_PACE: {
            const newPace = action.payload;
            const newPacePercent = calculatePacePercent(state.percent, newPace)
            const newSpeed = Number(toSpeed(newPace).toFixed(2))
            const newSpeedPercent = calculateSpeedPercent(state.percent, newSpeed)
            return {
                ...state,
                pace: action.payload,
                pacePercent: newPacePercent,
                speed: newSpeed,
                speedPercent: newSpeedPercent,
                timeForDist : toTime(state.distance, newPacePercent),
            };
        }
        case PercentageActionType.SET_SPEED: {
            const newSpeed = action.payload;
            const newSpeedPercent = calculateSpeedPercent(state.percent, newSpeed)
            const newPace = toPace(newSpeed);
            const newPacePercent = calculatePacePercent(state.percent, newPace)
            return {
                ...state,
                speed: newSpeed,
                speedPercent: newSpeedPercent,
                pace: newPace,
                pacePercent: newPacePercent,
                timeForDist : toTime(state.distance, newPacePercent),
            };
        }
        case PercentageActionType.SET_DISTANCE: {
            const distance = action.payload;
            const timeForDist = toTime(distance, state.pacePercent);
            return {
                ...state,
                distance : distance,
                timeForDist : timeForDist,
            };
        }
        default :
            return state
    }
}