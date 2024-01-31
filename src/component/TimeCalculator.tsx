import { Time, timeToStringMinimalist, timeToTotalSeconds } from '../interface/Time.tsx'
import { useEffect, useState } from 'react'
import { totalSecondsToTime } from '../Utils/Utils.tsx'
import { NumberInput } from './NumberInput.tsx'

type TimeCalculatorProps = {
  speed?: number
  distance: number
  time: Time
}

export function TimeCalculator({ speed, distance, time }: TimeCalculatorProps) {
  const [input, setInput] = useState(0)
  const [secondsPassage, setSecondsPassage] = useState(0)

  useEffect(() => {
    if (speed) {
      setSecondsPassage(input * 3.6 / speed)
    } else {
      setSecondsPassage((input * timeToTotalSeconds(time)) / distance)
    }
  }, [input, distance, time, speed])

  return (
    <div className="p-2">
      <h2>Temps de passage</h2>
      <NumberInput postfix={' m'} onNumberInput={setInput}></NumberInput>
      <p>
        Temps de passage au {input.toLocaleString()}m :{' '}
        {timeToStringMinimalist(totalSecondsToTime(secondsPassage))}
      </p>
    </div>
  )
}
