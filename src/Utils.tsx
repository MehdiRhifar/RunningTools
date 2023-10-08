import {Pace} from "./interface/Pace.tsx";

export const parseIntSafe = (str : string) : number => {
    return parseInt(str) || 0;
}

export function secondsKmToKmHours(totalSeconds : number) {
    if (totalSeconds == 0) {
        return 0;
    }
    return 3600 / totalSeconds;
}

export function secPerKmToPace(secPerKm : number) {
    return {
        minutes : Math.floor(secPerKm / 60),
        seconds : Math.round(secPerKm % 60)
    }
}

export function toPace(speed : number) : Pace {
    const secPerKm = speedToSecondsKm(speed)
    return secPerKmToPace(secPerKm)
}
export function speedToSecondsKm(speed : number) {
    if (speed == 0) {
        return 0;
    }
    return 3600 / speed;
}