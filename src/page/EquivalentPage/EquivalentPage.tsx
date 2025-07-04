import { useState } from 'react'
import { defaultTime, Time, timeToPace } from '../../interface/Time.tsx'
import { TimeInput } from '../../component/TimeInput.tsx'
import { getKeys } from '../../Utils/Utils.tsx'
import {
  defaultDistanceTime,
  Distance,
  DistanceInfo,
  distancesInfo,
} from '../../Utils/Constants.tsx'
import { paceToString } from '../../interface/Pace.tsx'
import { equivalentPurdyPoint, purdyPoints } from '../../Utils/PurdyPoints.tsx'
import { NumberInput } from '../../component/NumberInput.tsx'
import MainContainer from '../../component/MainContainer.tsx'

export function EquivalentPage() {
  const [purdyPoint, setPurdyPoint] = useState(0)
  const [times, setTimes] = useState<Distance<Time>>(defaultDistanceTime)
  const [custom, setCustom] = useState({
    distance: 0,
    time: defaultTime,
  })

  const updateTimes = (newPurdyPoint: number) => {
    const updatedTimes: Record<keyof DistanceInfo, Time> = { ...times }
    setPurdyPoint(newPurdyPoint)

    getKeys(distancesInfo).map((key) => {
      updatedTimes[key] = equivalentPurdyPoint(
        newPurdyPoint,
        distancesInfo[key].distance
      )
    })

    return updatedTimes
  }

  const handleCustomDistanceChange = (newDistance: number) => {
    setCustom({
      distance: newDistance,
      time: equivalentPurdyPoint(purdyPoint, newDistance),
    })
  }

  const handleTimeChange = (distance: number, newTime: Time) => {
    const newPurdyPoint = purdyPoints(distance, newTime)
    setPurdyPoint(newPurdyPoint)
    setTimes(updateTimes(newPurdyPoint))

    setCustom({
      distance: custom.distance,
      time: equivalentPurdyPoint(newPurdyPoint, custom.distance),
    })
  }

  return (
    // <div className={"main-container max-w-2xl"}>
      <MainContainer>
      <h2>Page equivalence de performance</h2>

      <table className={'custom-table'}>
        <thead>
          <tr className={'font-extrabold'}>
            <th>Distance</th>
            <th>Temps</th>
            <th>Pace (min/km)</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(times) as Array<keyof typeof times>).map((distance) => {
            return (
              <tr key={distance}>
                <td>{distancesInfo[distance].name}</td>
                <td>
                  <TimeInput
                    timeChanged={times[distance]}
                    onTimeChange={(newValue) => {
                      handleTimeChange(
                        distancesInfo[distance].distance,
                        newValue
                      )
                    }}
                  />
                </td>
                <td>
                  {paceToString(
                    timeToPace(
                      times[distance],
                      distancesInfo[distance].distance
                    )
                  )}
                </td>
              </tr>
            )
          })}
          <tr key={'custom'}>
            <td>
              <NumberInput
                max={100_000}
                postfix={' m'}
                onNumberInput={handleCustomDistanceChange}
              />
            </td>
            <td>
              <TimeInput
                timeChanged={custom.time}
                onTimeChange={(newValue) => {
                  handleTimeChange(custom.distance, newValue)
                }}
              />
            </td>
            <td>{paceToString(timeToPace(custom.time, custom.distance))}</td>
          </tr>
        </tbody>
      </table>
      </MainContainer>
    // </div>
  )
}
