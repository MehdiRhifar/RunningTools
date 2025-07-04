import { useCallback, useState } from 'react'
import FormCalculPace from '../../component/FormCalculPace.tsx'
import {
  defaultPace,
  Pace,
  paceToString,
  toSpeed,
} from '../../interface/Pace.tsx'
import {
  defaultTime,
  isZeroTime,
  Time,
  timeToPace,
} from '../../interface/Time.tsx'
import { TimeCalculator } from '../../component/TimeCalculator.tsx'
import MainContainer from '../../component/MainContainer.tsx'

export function TimeToPacePage() {
  // const url : string = "/"

  const [pace, setPace] = useState<Pace>(defaultPace)
  const [speed, setSpeed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [time, setTime] = useState(defaultTime)

  const handleFormChange = useCallback((distanceMeter: number, time: Time) => {
    setDistance(distanceMeter)
    setTime(time)
    if (distanceMeter == 0 || isZeroTime(time)) {
      setSpeed(0)
      setPace(defaultPace)
      return
    }

    const newPace = timeToPace(time, distanceMeter)

    setPace(newPace)
    setSpeed(toSpeed(newPace))
  }, [])

  return (
    <>
      <MainContainer>
        <h2>{"Calcul de l'allure de course"}</h2>
        <FormCalculPace onFormChange={handleFormChange}></FormCalculPace>
        <p>
          {speed.toFixed(2)} km/h - {paceToString(pace)}
        </p>

        <TimeCalculator distance={distance} time={time}></TimeCalculator>
      </MainContainer>
    </>
  )
}
