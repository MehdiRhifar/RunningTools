export interface Pace {
    minutes : number,
    seconds : number
}

export const defaultPace : Pace = {
    minutes: 0,
    seconds: 0
}

export function totalSeconds(pace : Pace) {
    return pace.minutes * 60 + pace.seconds
}

export function toSpeed(pace : Pace) : number {
    const speed = totalSeconds(pace);
    return speed == 0 ? 0 : 3600 / speed
}

export function isZero(pace : Pace) : boolean {
    return pace.minutes == 0 && pace.seconds == 0;
}

function formatTime (value: number) {
    return String(value).padStart(2, '0');
}

export function toString(pace : Pace) : string {
    return formatTime(pace.minutes) + '"' + formatTime(pace.seconds)+"'"
}