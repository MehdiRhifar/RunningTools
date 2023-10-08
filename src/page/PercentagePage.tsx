import {useState, useEffect} from 'react';
import {FloatInput} from "../component/FloatInput.tsx";
import {PaceInput} from "../component/PaceInput.tsx";
import {defaultPace, Pace, toSpeed, toString, totalSeconds} from "../interface/Pace.tsx";
import {secPerKmToPace, toPace} from "../Utils.tsx";
import {IntegerInput} from "../component/IntegerInput.tsx";

function calculateSpeedPercent(percent: number, speed: number): number {
    return (percent * speed) / 100;
}

function calculatePacePercent(percent: number, pace: Pace): Pace {
    if (percent == 0) {
        return defaultPace;
    }
    const totalSec = totalSeconds(pace)
    const secondsPercent =  totalSec * 100 / percent;
    return secPerKmToPace(secondsPercent);
}

export function PercentagePage() {
    const [percent, setPercent] = useState(0);
    const [pace, setPace] = useState(defaultPace);
    const [speed, setSpeed] = useState(0);

    const [speedPercent, setSpeedPercent] = useState(0);
    const [pacePercent, setPacePercent] = useState(defaultPace)

    useEffect(() => {
        setSpeedPercent(
            calculateSpeedPercent(
                percent,
                speed
            )
        );

        setPacePercent(
            calculatePacePercent(percent, pace)
        );
    }, [percent, speed, pace]);


    const handlePace = (pace: Pace) => {
        setPace(pace)
        setSpeed(Number(toSpeed(pace).toFixed(2)))
    };

    const handleSpeed = (speed: number) => {
        setSpeed(speed)
        setPace(toPace(speed))
    };

    return (
        <>
            <div>
                <IntegerInput onIntegerChange={setPercent}></IntegerInput> %
            </div>
            <div>
                <FloatInput onNumberChange={handleSpeed} value={speed}></FloatInput> km/h
                <PaceInput onTimeChange={handlePace} pace={pace}></PaceInput> / km
            </div>

            <div>{speedPercent.toFixed(2)} km/h - {toString(pacePercent)}</div>
        </>
    );
}
