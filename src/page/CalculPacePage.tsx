import {useCallback, useState} from "react";
import FormCalculPace from "../component/FormCalculPace.tsx";

export function CalculPacePage() {

    // const url : string = "/"

    const [paceMin, setPaceMin] = useState(0);
    const [paceSec, setPaceSec] = useState(0);
    const [speed, setSpeed] = useState(0);

    const handleFormChange = useCallback((distance : number, totalSeconds : number) => {
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

    const formatTime = (value: number) => {
        return String(value).padStart(2, '0');
    };

    return (
        <>
            <FormCalculPace onFormChange={handleFormChange}></FormCalculPace>
            <p>
                {speed.toFixed(2)} km/h - {formatTime(paceMin)+'"'}{formatTime(paceSec)+"'"}
            </p>
        </>
    );
}