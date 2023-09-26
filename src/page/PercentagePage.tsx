import { useState, useEffect } from 'react';
import {FloatInput} from "../component/FloatInput.tsx";

function calculateSpeedPercent(percent: number, speed: number): number {
    return (percent * speed) / 100;
}

export function PercentagePage() {
    const [percent, setPercent] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [speedPercent, setSpeedPercent] = useState(0);

    useEffect(() => {
        setSpeedPercent(
            calculateSpeedPercent(
                percent,
                speed
            )
        );
    }, [percent, speed]);


    return (
        <>
            <div>
                <FloatInput onNumberChange={setPercent}></FloatInput> %
            </div>
            <div>
                <FloatInput onNumberChange={setSpeed}></FloatInput> km/h
            </div>

            <div>{speedPercent} km/h</div>
        </>
    );
}
