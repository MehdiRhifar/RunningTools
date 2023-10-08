import React, {useEffect, useRef, useState} from 'react';
import MaskedInput from 'react-text-mask';
import {parseIntSafe} from "../Utils.tsx";
import {defaultPace, Pace, toString} from "../interface/Pace.tsx";

interface OnPaceChange {
    onTimeChange: (pace: Pace) => void,
    pace? : Pace
}

export function PaceInput(
    { onTimeChange, pace }: OnPaceChange
) {
    const [timeStr, setTimeStr] = useState(toString(defaultPace))

    const isEditLocal = useRef(true);

    useEffect(() => {
        console.log(pace, isEditLocal)
        if (isEditLocal.current) {
            isEditLocal.current = false
            return
        }
        if (pace) {
            setTimeStr(toString(pace));
        }
    }, [pace]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        setTimeStr(event.target.value)
        const value = event.target.value.replace("'", "").replace("_", "0")
        const timeSplit = value.split('"');
        const [minutes, seconds] = timeSplit.map(parseIntSafe)
        const pace2 : Pace = {minutes : minutes, seconds : seconds}
        isEditLocal.current = true;

        onTimeChange(pace2);
    };

    useEffect(() => {

    }, [timeStr]);


    return (
        <MaskedInput className={"custom-input w-20"}
            mask={[/[0-9]/, /[0-9]/, '"', /[0-5]/, /[0-9]/, "'"]}
            guide={true}
            value={timeStr}
            keepCharPositions={true}
            onChange={handleInputChange}
            placeholder={'mm\u0022ss\u0027'}
        />
    );
}
