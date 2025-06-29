import { useEffect, useState } from 'react'
import { defaultTime, Time } from '../interface/Time.tsx'
import { TimeInput } from './TimeInput.tsx'
import { DistanceInput } from './DistanceInput.tsx'

interface FormCalculPaceProps {
  onFormChange: (distance: number, time: Time) => void
}

function FormCalculPace({ onFormChange }: FormCalculPaceProps) {
  const [distance, setDistance] = useState(0)
  const [time, setTime] = useState(defaultTime)

  useEffect(() => {
    onFormChange(distance, time)
  }, [onFormChange, distance, time])

  return (
    <>
      <form className={""}>
        <DistanceInput onDistanceChange={setDistance}></DistanceInput>
        <label>Temps : </label>
        <TimeInput onTimeChange={setTime}></TimeInput>
      </form>
    </>
  )
}

export default FormCalculPace
