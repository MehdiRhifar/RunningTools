import {ChangeEvent, useState} from "react";

interface OnNumberChange {
    onNumberChange: (number: number) => void;
}
export function FloatInput(
    { onNumberChange } : OnNumberChange
) {

    const [numberStr, setNumberStr] = useState("0");

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(',', '.');
        const newNumber = Number(newNumberStr);
        if (!isNaN(newNumber)) { // La valeur est un nombre !
            setNumberStr(newNumberStr);
            onNumberChange(newNumber);
        }
    };

    return (
        <span>
            <input
                type="text"
                inputMode="numeric"
                value={numberStr}
                onChange={handleNumberChange}
            />
        </span>
    )
}
