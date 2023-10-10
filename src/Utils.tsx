import {Pace} from "./interface/Pace.tsx";
import {Time} from "./interface/Time.tsx";

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
    return {
        minutes : Math.floor(totalSeconds / 60),
        seconds : Math.round(totalSeconds % 60)
    }
}

export function totalSecondsToTime(totalSeconds : number) : Time {
    const hours = Math.floor(totalSeconds / 3600);
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