import {ChangeEvent, useEffect, useState} from "react";

interface FormCalculPaceProps {
    onPaceChange: (totalSeconds: number) => void;
}
function FormCalculPace({ onPaceChange } : FormCalculPaceProps) {
    const [hours, setHours] = useState("0");
    const [minutes, setMinutes] = useState("0");
    const [seconds, setSeconds] = useState("0");

    const safeParseInt = (str : string) => {
        const res = parseInt(str);
        return isNaN(res) ? 0 : res;
    }

    useEffect(() => {
        onPaceChange(
            safeParseInt(hours) * 3600 +
            safeParseInt(minutes) * 60 +
            safeParseInt(seconds)
        );
    }, [onPaceChange, hours, minutes, seconds])

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
            <div>
                <input type="number" min="0" value={hours} onChange={handleHoursChange} /> Heures <br />
            </div>
            <div>
                <input type="number" min="0" value={minutes} onChange={handleMinutesChange} /> Minutes <br />
            </div>
            <div>
                <input type="number" min="0" value={seconds} onChange={handleSecondsChange} /> Secondes <br />
            </div>
        </>
    );
}

export default FormCalculPace;
