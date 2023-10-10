import React, { useState } from 'react';
import {parseIntSafe} from "../Utils.tsx";
import MaskedInput, {Mask} from "react-text-mask";
import {createNumberMask} from "text-mask-addons";

interface OnIntegerChange {
    onIntegerChange: (number: number) => void;
    value? : number
}
export function DistanceInput({ onIntegerChange, value }: OnIntegerChange) {
    const [numberStr, setNumberStr] = useState<string>(
        value !== undefined ? value.toString() : ''
    );

    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(' ', '');
        const newNumber = parseIntSafe(newNumberStr);
        setNumberStr(newNumberStr);
        onIntegerChange(newNumber);
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const distance = parseIntSafe(event.target.value)
        const selectedValue = distance.toLocaleString();
        setNumberStr(selectedValue); // Mettez à jour la valeur de l'input avec la sélection
        onIntegerChange(distance);
    };

    const predefinedValues = new Map([
        ["10km", 10_000],
        ["Marathon", 42_195],
        ["Semi", 21_975]
    ])

    const numberMask: Mask = createNumberMask({
        prefix: '',
        thousandsSeparatorSymbol: `\u00A0`,
        allowLeadingZeroes: false

    });

    return (
        <div>
            <MaskedInput
                className="custom-input w-20 m-1"
                mask={numberMask}
                value={numberStr}
                onChange={handleNumberChange}
            />mètre |
            <select
                value={numberStr}
                onChange={handleSelectChange}
                className="custom-input w-52 m-1"
            >
                <option value="">Sélectionnez une valeur</option>
                {Array.from(predefinedValues).map(([key, distance]) => (
                    <option key={key} value={distance}>
                        {key}
                    </option>
                ))}
            </select>
        </div>
    )
}