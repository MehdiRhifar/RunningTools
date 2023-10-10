import { useReducer, useEffect } from 'react';
import { FloatInput } from '../../component/FloatInput.tsx';
import { PaceInput } from '../../component/PaceInput.tsx';
import {
    defaultPace,
    Pace,
    toSpeed,
    paceToString,
    totalSeconds,
} from '../../interface/Pace.tsx';
import
import { totalSecondsToPace, toPace } from '../../Utils.tsx';
import { IntegerInput } from '../../component/IntegerInput.tsx';
import { defaultTime, timeToString } from '../../interface/Time.tsx';
import { DistanceInput } from '../../component/DistanceInput.tsx';
import {PercentageActionType} from "./Percentage.reducer.ts";

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


export function PercentagePage() {
    const [state, dispatch] = useReducer(percentageReducer, {
        percent: 100,
        pace: defaultPace,
        speed: 0,
        distance: 0,
        timeForDist: defaultTime,
        speedPercent: 0,
        pacePercent: defaultPace,
    });

    const {
        percent,
        pace,
        speed,
        distance,
        timeForDist,
        pacePercent,
        speedPercent,
    } = state;

    useEffect(() => {
        dispatch({ type: PercentageActionType.SET_DISTANCE, payload: distance });
    }, [distance]);

    const handlePercent = (newPercent: number) => {
        dispatch({ type: SET_PERCENT, payload: newPercent });
        const newSpeedPercent = calculateSpeedPercent(newPercent, speed);
        const newPacePercent = calculatePacePercent(newPercent, pace);
        dispatch({
            type: SET_SPEED_PACE_PERCENTS,
            payload: { speedPercent: newSpeedPercent, pacePercent: newPacePercent },
        });
    };

    const handlePace = (newPace: Pace) => {
        dispatch({ type: SET_PACE, payload: newPace });
        const newSpeed = Number(toSpeed(newPace).toFixed(2));
        dispatch({ type: SET_SPEED, payload: newSpeed });
        const newSpeedPercent = calculateSpeedPercent(percent, newSpeed);
        const newPacePercent = calculatePacePercent(percent, newPace);
        dispatch({
            type: SET_SPEED_PACE_PERCENTS,
            payload: { speedPercent: newSpeedPercent, pacePercent: newPacePercent },
        });
    };

    const handleSpeed = (newSpeed: number) => {
        dispatch({ type: SET_SPEED, payload: newSpeed });
        const newPace = toPace(newSpeed);
        dispatch({ type: SET_PACE, payload: newPace });
        const newSpeedPercent = calculateSpeedPercent(percent, newSpeed);
        const newPacePercent = calculatePacePercent(percent, newPace);
        dispatch({
            type: SET_SPEED_PACE_PERCENTS,
            payload: { speedPercent: newSpeedPercent, pacePercent: newPacePercent },
        });
    };

    return (
        <>
            <div className={'m-10'}>
                <div>
                    <IntegerInput onIntegerChange={handlePercent} value={percent} />
                    %
                </div>
                <div>
                    <FloatInput onNumberChange={handleSpeed} value={speed} />
                    km/h <PaceInput onTimeChange={handlePace} pace={pace} /> / km
                </div>
                <div>
                    {speedPercent.toFixed(2)} km/h - {paceToString(pacePercent)}
                </div>
            </div>
            <div>
                <DistanceInput
                    onIntegerChange={(newDistance) =>
                        dispatch({ type: SET_DISTANCE, payload: newDistance })
                    }
                />
            </div>
            <div>Temps : {timeToString(timeForDist)}</div>
        </>
    );
}
