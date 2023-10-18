import {useEffect, useState} from "react";
import {IntegerInput} from "./IntegerInput.tsx";
import {defaultTime, Time} from "../interface/Time.tsx";
import {TimeInput} from "./TimeInput.tsx";

interface FormCalculPaceProps {
    onFormChange: (distance : number, time: Time) => void;
}
function FormCalculPace({ onFormChange } : FormCalculPaceProps) {
    const [distance, setDistance] = useState(0);
    const [time, setTime] = useState(defaultTime)

    useEffect(() => {
        onFormChange(
            distance,
            time
        );
    }, [onFormChange, distance, time])


    return (
        <>
            <h2>{"Calcul de l'allure de course"}</h2>
            <form>
                <IntegerInput onIntegerChange={setDistance}></IntegerInput> Mètres <br /> <br/>
                <label>Temps : </label>
                <TimeInput onTimeChange={setTime}></TimeInput>
            </form>
        </>
    );
}

export default FormCalculPace;
