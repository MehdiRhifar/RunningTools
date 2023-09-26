import React, { useState, useEffect } from 'react';
import MaskedInput from 'react-text-mask';
import {parseIntSafe} from "../Utils.tsx";

interface OnTimeChange {
    onTimeChange: (totalSeconds: number) => void;
}

function TimeInput({ onTimeChange }: OnTimeChange) {
    const [time, setTime] = useState("");

    useEffect(() => {
        if (!onTimeChange) {
            return;
        }
        if (time == "") {
            onTimeChange(0)
            return;
        }
        const timeSplit = time.split(':');
        const [hours, minutes, seconds] = timeSplit.map(parseIntSafe)
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        onTimeChange(totalSeconds);

    }, [onTimeChange, time]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTime(event.target.value);
    };

    return (
        <MaskedInput
            mask={[/[0-9]/, /[0-9]/, ':', /[0-5]/ , /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            guide={true}
            value={time}
            keepCharPositions={true}
            onChange={handleInputChange}
            placeholder="hh:mm:ss"
        />
    );
}

export default TimeInput;
