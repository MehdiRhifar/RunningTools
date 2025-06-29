import {
  Time,
  timeToStringMinimalist,
  timeToTotalMilliseconds,
} from '../interface/Time.tsx'
import { useEffect, useState } from 'react'
import { totalMillisecondsToTime } from '../Utils/Utils.tsx'
import { NumberInput } from './NumberInput.tsx'

type TimeCalculatorProps = {
  speed?: number
  distance: number
  time: Time
}

export function TimeCalculator({ speed, distance, time }: TimeCalculatorProps) {
  const [inputDistance, setInputDistance] = useState(0)
  const [millisecondsPassage, setMillisecondsPassage] = useState(0)

  useEffect(() => {
    if (speed) {
      setMillisecondsPassage((inputDistance * 36_00) / speed)
    } else {
      setMillisecondsPassage((inputDistance * timeToTotalMilliseconds(time)) / distance)
    }
  }, [inputDistance, distance, time, speed])

  return (
    <div className="p-2">
      <h2>Temps de passage</h2>
      <NumberInput postfix={' m'} onNumberInput={setInputDistance}></NumberInput>
      <p>
        Temps de passage au {inputDistance.toLocaleString()}m :{' '}
        {timeToStringMinimalist(totalMillisecondsToTime(millisecondsPassage))}
      </p>
    </div>
  )
}
