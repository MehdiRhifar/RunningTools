import React from 'react';
import MaskedInput from 'react-text-mask';
import {parseIntSafe} from "../Utils.tsx";
import {defaultTime, Time} from "../interface/Time.tsx";

interface OnTimeChange {
    onTimeChange: (time: Time) => void;
}

function TimeInput({ onTimeChange }: OnTimeChange) {

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        if(event.target.value == "") {
            onTimeChange(defaultTime);
            return
        }

        const value = event.target.value.replace("'", "").replace("_", "0")
        const timeSplit = value.split(':');
        const [ hours, minutes, seconds ] = timeSplit.map(parseIntSafe);
        const time : Time = {hours: hours, minutes: minutes, seconds: seconds}
        onTimeChange(time);
    };

    return (
        <MaskedInput
            className={"custom-input"}
            mask={[/[0-9]/, /[0-9]/, ':', /[0-5]/ , /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            guide={true}
            keepCharPositions={true}
            onChange={handleInputChange}
            placeholder="hh:mm:ss"
        />
    );
}

export default TimeInput;
