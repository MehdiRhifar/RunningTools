import {useEffect, useState} from "react";
import TimeInput from "./TimeInput.tsx";
import {IntegerInput} from "./IntegerInput.tsx";

interface FormCalculPaceProps {
    onFormChange: (distance : number, totalSeconds : number) => void;
}
function FormCalculPace({ onFormChange } : FormCalculPaceProps) {
    const [distance, setDistance] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0)

    useEffect(() => {
        onFormChange(
            distance,
            totalSeconds
        );
    }, [onFormChange, distance, totalSeconds])


    return (
        <>
            <h2>{"Calcul de l'allure de course"}</h2>
            <form>
                <IntegerInput onIntegerChange={setDistance}></IntegerInput> Mètres <br /> <br/>
                <label>Temps : </label>
                <TimeInput onTimeChange={setTotalSeconds}></TimeInput>
            </form>
        </>
    );
}

export default FormCalculPace;
