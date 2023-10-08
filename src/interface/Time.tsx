import {Pace} from "./Pace.tsx";
import {secPerKmToPace} from "../Utils.tsx";

export interface Time {
    hours : number
    minutes : number,
    seconds : number
}

export const defaultTime : Time = {
    hours : 0,
    minutes: 0,
    seconds: 0
}

export function isZero(time : Time) : boolean {
    return time.hours == 0 && time.minutes == 0 && time.seconds == 0;
}

function totalSeconds(time : Time) {
    return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

export function toPace(time : Time, distanceMetre : number): Pace {
    const secPerMetre = totalSeconds(time) / distanceMetre;
    const secPerKm = secPerMetre * 1000;

    return secPerKmToPace(secPerKm)
}
