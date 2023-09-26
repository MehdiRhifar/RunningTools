import {ChangeEvent, useCallback, useState} from "react";
import FormCalculPace from "../component/FormCalculPace.tsx";

export function PercentagePage() {

    // const url : string = "/"

    const [percent, setPercent] = useState("0");
    const [speed, setSpeed] = useState("0");
    const [speedPercent, setSpeedPercent] = useState("0");
    const [paceMin, setPaceMin] = useState(0);
    const [paceSec, setPaceSec] = useState(0);

    const handlePercentChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPercent(event.target.value);
    };

    const handleSpeedChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSpeed(event.target.value);
    };

    const handlePaceChange = useCallback((totalSeconds : number) => {
        if (distance == 0 || totalSeconds == 0) {
            setSpeed(0); setPaceMin(0); setPaceSec(0)
            return;
        }

        const secPerMetre = totalSeconds / distance;
        const kmPerMetre = secPerMetre * 1000;

        setPaceMin(Math.floor(kmPerMetre / 60));
        setPaceSec(Math.round(kmPerMetre % 60));

        const newSpeed = (distance*36)/(10*totalSeconds);
        setSpeed(newSpeed);
    }, []);


    return (
        <>
            <FormCalculPace onFormChange={handlePaceChange}></FormCalculPace>

            <div>
                <input type="number" min="0" value={percent}
                       onChange={handlePercentChange} /> %
            </div>

            <div>
                <input type="number" min="0" value={speed}
                       onChange={handleSpeedChange} /> km/h
            </div>
        </>
    );
}