import {Pace} from "../interface/Pace.tsx";
import {Time, timeToTotalSeconds} from "../interface/Time.tsx";
import {purdyPointV2} from "./PurdyPoints.tsx";

export const parseIntSafe = (str : string) : number => {
    return parseInt(str) || 0;
}

export function formatTime (value: number) {
    return String(value).padStart(2, '0');
}

export function secondsKmToKmHours(totalSeconds : number) {
    if (totalSeconds == 0) {
        return 0;
    }
    return 3600 / totalSeconds;
}

export function totalSecondsToPace(totalSeconds : number) : Pace {
    totalSeconds = Math.round(totalSeconds)
    return {
        minutes : Math.floor(totalSeconds / 60),
        seconds : Math.round(totalSeconds % 60)
    }
}

export function totalSecondsToTime(totalSeconds : number) : Time {

    totalSeconds = Math.round(totalSeconds)
    const hours = Math.floor( totalSeconds/ 3600);
    const totalSeconds2 = totalSeconds - 3600 * hours
    return {
        hours : hours,
        minutes : Math.floor(totalSeconds2 / 60),
        seconds : Math.round(totalSeconds2 % 60)
    }
}



export function toPace(speed : number) : Pace {
    const secPerKm = speedToSecondsKm(speed)
    return totalSecondsToPace(secPerKm)
}

export function speedToSecondsKm(speed : number) {
    if (speed == 0) {
        return 0;
    }
    return 3600 / speed;
}

export function equivalent(referenceTime : Time, referenceDistance : number, goalDistance : number) : Time {
    const factor = Math.pow((goalDistance / referenceDistance), 1.06)
    return totalSecondsToTime(timeToTotalSeconds(referenceTime) * factor)
}

export function equivalentPurdyPointV2(
    referenceTime : Time, // Temps de référence en secondes
    referenceDistance: number, // Distance de référence
    targetDistance: number // Distance cible pour laquelle vous voulez estimer le temps
): Time {
    const b1 = 11.15895;
    const b2 = 4.304605;
    const b3 = 0.5234627;
    const b4 = 4.031560;
    const b5 = 2.316157;
    const r1 = 3.796158e-2;
    const r2 = 1.646772e-3;
    const r3 = 4.107670e-4;
    const r4 = 7.068099e-6;
    const r5 = 5.220990e-9;



    // Calculate world record velocity from running curve for the reference distance
    const speedWR = -b1 * Math.exp(-r1 * targetDistance) + b2
        * Math.exp(-r2 * targetDistance) + b3
        * Math.exp(-r3 * targetDistance) + b4
        * Math.exp(-r4 * targetDistance) + b5
        * Math.exp(-r5 * targetDistance);

    // Calculate world record time for the reference distance
    const timeWR = targetDistance / speedWR;

    // Calculate least squares Purdy Points for the reference distance
    const k = 0.0654 - 0.00258 * speedWR;
    const a = 85 / k;
    const b = 1 - 1035 / a;

    const pointPerf = purdyPointV2(referenceDistance, referenceTime)

    const totalSecRes = timeWR / ((pointPerf / a) + b)

    return totalSecondsToTime(totalSecRes)
}

export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>