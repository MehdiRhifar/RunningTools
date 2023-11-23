import {Time, timeToStringMinimalist, timeToTotalSeconds} from "../interface/Time.tsx";
import {useEffect, useState} from "react";
import {IntegerInput} from "./IntegerInput.tsx";
import {totalSecondsToTime} from "../Utils/Utils.tsx";

type TimeCalculatorProps = {
  distance: number;
  time: Time;
};

export function TimeCalculator({ distance, time }: TimeCalculatorProps) {
    const [input, setInput] = useState(0)
    const [secondsPassage, setSecondsPassage] = useState(0)

    useEffect(() => {
        setSecondsPassage( (input * timeToTotalSeconds(time)) / distance )
    }, [input, distance, time]);


  return (
    <div className="p-2">
      <h2>Temps de passage</h2>
        <IntegerInput onIntegerChange={setInput}></IntegerInput>
      <p>Temps de passage au {input.toLocaleString()}m : {timeToStringMinimalist(totalSecondsToTime(secondsPassage))}</p>
    </div>
  );
}
