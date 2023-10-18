import {ChangeEvent, useState} from 'react';
import MaskedInput, {Mask} from "react-text-mask";
import {createNumberMask} from "text-mask-addons";
import {parseIntSafe} from "../Utils/Utils.tsx";

interface OnIntegerChange {
    onIntegerChange: (number: number) => void;
    value? : number
}

export function IntegerInput(
                    { onIntegerChange, value }: OnIntegerChange
                ) {
    const [numberStr, setNumberStr] = useState<string>(value != undefined ? value.toString() : "0");

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(" ", "");
        const newNumber = parseIntSafe(newNumberStr); // Parse la chaîne en un nombre entier
        setNumberStr(newNumberStr);
        onIntegerChange(newNumber);

    };

    const numberMask : Mask = createNumberMask({
        prefix : '',
        thousandsSeparatorSymbol : " ",
        allowLeadingZeroes: false

    });
    return (
        <span>
            <MaskedInput
                className={"custom-input"}
                mask={numberMask}
                value={numberStr}
                onChange={handleNumberChange}
            />
        </span>
    );
}
