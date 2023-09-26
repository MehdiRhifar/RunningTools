import {ChangeEvent, useEffect, useState} from "react";

interface FormCalculPaceProps {
    onFormChange: (distance: number, hours : number, minutes: number, seconds: number) => void;
}
function FormCalculPace({ onFormChange } : FormCalculPaceProps) {
    const [distance, setDistance] = useState("0");
    const [hours, setHours] = useState("0");
    const [minutes, setMinutes] = useState("0");
    const [seconds, setSeconds] = useState("0");

    const safeParseInt = (str : string) => {
        const res = parseInt(str);
        return isNaN(res) ? 0 : res;
    }

    useEffect(() => {
        onFormChange(
            safeParseInt(distance),
            safeParseInt(hours),
            safeParseInt(minutes),
            safeParseInt(seconds)
        );
    }, [onFormChange, distance, hours, minutes, seconds])

    const handleDistanceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDistance(event.target.value);
    };
    const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHours(event.target.value);
    };
    const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMinutes(event.target.value);
    };
    const handleSecondsChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSeconds(event.target.value);
    };

    return (
        <>
            <h2>{"Calcul de l'allure de course"}</h2>
            <form>
                <input type="number" min="0" value={distance} onChange={handleDistanceChange} /> Mètres <br /> <br/>
                <input type="number" min="0" value={hours} onChange={handleHoursChange} /> Heures <br />
                <input type="number" min="0" value={minutes} onChange={handleMinutesChange} /> Minutes <br />
                <input type="number" min="0" value={seconds} onChange={handleSecondsChange} /> Secondes <br />
            </form>
        </>
    );
}

export default FormCalculPace;
