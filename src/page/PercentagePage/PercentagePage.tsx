import {useReducer} from 'react';
import {FloatInput} from '../../component/FloatInput.tsx';
import {PaceInput} from '../../component/PaceInput.tsx';
import {defaultPace, Pace, paceToString} from '../../interface/Pace.tsx';
import {IntegerInput} from '../../component/IntegerInput.tsx';
import {defaultTime, timeToString} from '../../interface/Time.tsx';
import {DistanceInput} from '../../component/DistanceInput.tsx';
import {PercentageActionType, percentageReducer} from "./Percentage.reducer.ts";

export function PercentagePage() {
    const [state, dispatch] = useReducer(percentageReducer, {
        percent: 100,
        pace: defaultPace,
        pacePercent: defaultPace,
        speedPercent: 0,
        speed: 0,
        distance: 0,
        timeForDist: defaultTime,
    });

    const handleDistance = (newDistance : number) => {
        dispatch({ type: PercentageActionType.SET_DISTANCE, payload: newDistance });
    }
    const handlePercent = (newPercent: number) => {
        dispatch({ type: PercentageActionType.SET_PERCENT, payload: newPercent });
    };

    const handlePace = (newPace: Pace) => {
        dispatch({ type: PercentageActionType.SET_PACE, payload: newPace });
    };

    const handleSpeed = (newSpeed: number) => {
        dispatch({ type: PercentageActionType.SET_SPEED, payload: newSpeed });
    };

    return (
        <>
            <div className={'m-10'}>
                <div>
                    <IntegerInput onIntegerChange={handlePercent} value={state.percent} /> %
                </div>
                <div>
                    <FloatInput onNumberChange={handleSpeed} value={state.speed} /> km/h
                    <PaceInput onTimeChange={handlePace} pace={state.pace} /> / km
                </div>
                <div>
                    {state.speedPercent.toFixed(2)} km/h - {paceToString(state.pacePercent)}
                </div>
            </div>
            <div>
                <DistanceInput onIntegerChange={handleDistance}/>
            </div>
            <div>Temps : {timeToString(state.timeForDist)}</div>
        </>
    );
}
