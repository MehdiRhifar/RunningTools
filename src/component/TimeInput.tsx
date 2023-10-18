import React, {useEffect, useRef, useState} from 'react';
import MaskedInput from 'react-text-mask';
import {parseIntSafe} from "../Utils/Utils.tsx";
import {defaultTime, Time, timeToString} from "../interface/Time.tsx";

interface OnTimeChange {
    value?: Time
    onTimeChange: (time: Time) => void;
}

export function TimeInput({ onTimeChange, value }: OnTimeChange) {

    const [timeStr, setTimeStr] = useState(timeToString(defaultTime));

    const isEditLocal = useRef(true);

    useEffect(() => {
        if (isEditLocal.current) {
            isEditLocal.current = false
            return
        }
        if (value) {
            setTimeStr(timeToString(value));
        }
    }, [value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        setTimeStr(event.target.value)
        isEditLocal.current = true

        if(event.target.value == "") {
            onTimeChange(defaultTime);
            return
        }

        const value = event.target.value.replace("_", "0")
        const timeSplit = value.split(':');
        const [ hours, minutes, seconds ] = timeSplit.map(parseIntSafe);
        const time : Time = {hours: hours, minutes: minutes, seconds: seconds}
        onTimeChange(time);
    };

    return (
        <MaskedInput
            className={"custom-input"}
            mask={[/[0-9]/, /[0-9]/, ':', /[0-5]/ , /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            value={timeStr}
            guide={true}
            keepCharPositions={true}
            onChange={handleInputChange}
            placeholder="hh:mm:ss"
        />
    );
}
