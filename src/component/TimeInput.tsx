import React from 'react';
import MaskedInput from 'react-text-mask';
import {parseIntSafe} from "../Utils.tsx";
import {Time} from "../interface/Time.tsx";

interface OnTimeChange {
    onTimeChange: (time: Time) => void;
}

function TimeInput({ onTimeChange }: OnTimeChange) {

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const timeSplit = event.target.value.split(':');
        const [ hours, minutes, seconds ] = timeSplit.map(parseIntSafe);
        const time : Time = {hours: hours, minutes: minutes, seconds: seconds}
        onTimeChange(time);
    };

    return (
        <MaskedInput
            mask={[/[0-9]/, /[0-9]/, ':', /[0-5]/ , /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            guide={true}
            keepCharPositions={true}
            onChange={handleInputChange}
            placeholder="hh:mm:ss"
        />
    );
}

export default TimeInput;
