import {ChangeEvent, useEffect, useRef, useState} from "react";

interface OnNumberChange {
    onNumberChange: (number: number) => void;
    value? : number
}
export function FloatInput(
    { onNumberChange, value } : OnNumberChange
) {
    const [numberStr, setNumberStr] = useState("0");

    const isEditLocal = useRef(true);

    useEffect(() => {
        if (isEditLocal.current) {
            isEditLocal.current = false
            return
        }
        if (value != undefined) {
            setNumberStr(value.toFixed(2));
        }
    }, [value]);

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(',', '.');

        const newNumber = Number(newNumberStr);
        if (!isNaN(newNumber)) { // La valeur est un nombre !
            isEditLocal.current = true
            setNumberStr(newNumberStr);
            onNumberChange(newNumber);
        }
    };

    return (
        <span>
            <input
                className="custom-input w-20"
                type="text"
                inputMode="numeric"
                value={numberStr}
                onChange={handleNumberChange}
            />
        </span>
    )
}
