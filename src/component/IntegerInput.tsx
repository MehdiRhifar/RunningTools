import { useState, ChangeEvent } from 'react';
import MaskedInput from "react-text-mask";
import {createNumberMask} from "text-mask-addons";
import {parseIntSafe} from "../Utils.tsx";

interface OnIntegerChange {
    onIntegerChange: (number: number) => void;
}

export function IntegerInput(
                    { onIntegerChange }: OnIntegerChange
                ) {
    const [numberStr, setNumberStr] = useState("0");

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(" ", "");
        const newNumber = parseIntSafe(newNumberStr); // Parse la chaîne en un nombre entier
        setNumberStr(newNumberStr);
        onIntegerChange(newNumber);

    };

    const numberMask = createNumberMask({
        prefix : '',
        thousandsSeparatorSymbol : " "
    });
    return (
        <span>
            <MaskedInput
                mask={numberMask}
                value={numberStr}
                onChange={handleNumberChange}
            />
        </span>
    );
}
