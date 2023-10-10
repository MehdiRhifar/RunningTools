// Définissez les actions pour votre reducer
import {Pace, toSpeed, toTime} from "../../interface/Pace.js";
import {toPace} from "../../Utils.js";

export interface PercentagePageState {
    percent: number;
    pace: Pace;
    pacePercent: Pace;
    speed: number;
    speedPercent: number;

    distance: number;
    timeForDist: any; // Remplacez le type par le bon type pour timeForDist
}

export enum PercentageActionType {
    SET_PERCENT,
    SET_PACE,
    SET_SPEED,
    SET_DISTANCE
}

export interface Action {
    type: PercentageActionType;
    payload : Pace | number
}

// Fonction de réduction
export const percentageReducer = (state: PercentagePageState, action: Action) => {
    switch (action.type) {
        case PercentageActionType.SET_PERCENT:
            return {
                ...state,
                percent: action.payload,
            };
        case PercentageActionType.SET_PACE:
            const pace = action.payload;
            const speed = Number(toSpeed(pace).toFixed(2));
            return {
                ...state,
                pace,
                speed,
            };
        case PercentageActionType.SET_SPEED:
            const newSpeed = action.payload;
            const newPace = toPace(newSpeed);
            return {
                ...state,
                speed: newSpeed,
                pace: newPace,
            };
        case PercentageActionType.SET_DISTANCE:
            const distance = action.payload;
            const timeForDist = toTime(distance, state.pacePercent);
            return {
                ...state,
                distance,
                timeForDist,
            };
    }
    return state;
}