import {useCallback, useState} from "react";
import FormCalculPace from "../component/FormCalculPace.tsx";
import {defaultPace, isZero, Pace, toSpeed, toString} from "../interface/Pace.tsx";
import {Time, toPace} from "../interface/Time.tsx";

export function CalculPacePage() {

    // const url : string = "/"

    const [pace, setPace] = useState<Pace>(defaultPace)
    const [speed, setSpeed] = useState(0);

    const handleFormChange = useCallback((distanceMeter : number, time : Time) => {
        if (distanceMeter == 0 || isZero(time)) {
            setSpeed(0);
            setPace(defaultPace)
            return;
        }

        const newPace = toPace(time, distanceMeter)
        setPace(newPace)
        setSpeed(toSpeed(newPace));
    }, []);

    return (
        <>
            <FormCalculPace onFormChange={handleFormChange}></FormCalculPace>
            <p>
                {speed.toFixed(2)} km/h - {toString(pace)}
            </p>
        </>
    );
}