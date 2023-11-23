import React, {useState} from 'react';
import {getKeys, parseIntSafe, thousandsSeparatorSymbol} from "../Utils/Utils.tsx";
import MaskedInput, {Mask} from "react-text-mask";
import {createNumberMask} from "text-mask-addons";
import {distancesInfo} from "../Utils/Constants.tsx";

interface OnIntegerChange {
    onIntegerChange: (number: number) => void;
    value? : number
}
export function DistanceInput({ onIntegerChange, value }: OnIntegerChange) {
    const [numberStr, setNumberStr] = useState<string>(
        value !== undefined ? value.toString() : ''
    );

    const [number, setNumber] = useState<number>(
        value !== undefined ? value : 0
    )

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const numberMask: Mask = createNumberMask({
        prefix: '',
        thousandsSeparatorSymbol: thousandsSeparatorSymbol, //Symbole de séparation des milier en fonction de la langue du PC
        allowLeadingZeroes: false
    });

    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newNumberStr = event.target.value.replace(thousandsSeparatorSymbol, "")
        const newNumber = parseIntSafe(newNumberStr);
        setNumberStr(event.target.value);
        setNumber(newNumber)
        onIntegerChange(newNumber);
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const distance = parseIntSafe(event.target.value)
        const selectedValue = distance.toLocaleString();
        setNumberStr(selectedValue); // Mettez à jour la valeur de l'input avec la sélection
        setNumber(distance)
        onIntegerChange(distance);
    };

    return (
        <div>
            <MaskedInput
                className="custom-input w-20 m-1"
                mask={numberMask}
                value={numberStr}
                onChange={handleNumberChange}
            />mètres |
            <select
                value={number}
                onChange={handleSelectChange}
                className="custom-input w-56 m-1">
                <option value="">Sélectionnez une valeur</option>
                {
                    getKeys(distancesInfo).map((key) =>
                            <option key={key} value={distancesInfo[key].distance}>
                                {distancesInfo[key].name}
                            </option>
                    )
                }
            </select>
        </div>
    )
}