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
  const [showInfo, setShowInfo] = useState(false)

  const updateTimes = (
    newPurdyPoint: number,
    newDistance: number,
    newTime: Time
  ) => {
    const updatedTimes: Record<keyof DistanceInfo, Time> = { ...times }
    setPurdyPoint(newPurdyPoint)

    getKeys(distancesInfo).forEach((key) => {
      if (distancesInfo[key].distance == newDistance) {
        updatedTimes[key] = newTime
      } else {
        updatedTimes[key] = equivalentPurdyPoint(
          newPurdyPoint,
          distancesInfo[key].distance
        )
      }
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
    setTimes(updateTimes(newPurdyPoint, distance, newTime))

    setCustom({
      distance: custom.distance,
      time: equivalentPurdyPoint(newPurdyPoint, custom.distance),
    })
  }

  return (
    <MainContainer maxWidth="550px">
      <div className={'flex justify-between items-center'}>
        <h2>Page equivalence de performance</h2>
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Informations sur le calcul"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-sm font-bold text-gray-400 hover:border-white hover:text-white transition-colors cursor-pointer"
          >
            i
          </button>
          {showInfo && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowInfo(false)}
              />
              <div
                className="absolute right-0 top-8 z-20 w-72 rounded-lg p-4 text-sm text-gray-100 shadow-xl border border-gray-600"
                style={{ backgroundColor: 'var(--body-bg-color)' }}
              >
                <p className="font-bold mb-2 text-white">
                  Calcul de l'équivalence
                </p>
                <p className="mb-2">
                  L'équivalence est basée sur les{' '}
                  <span className="font-semibold text-white">Points Purdy</span>
                </p>
                <p className="mb-2">
                  Les autres méthodes de comparaison (par la vo2 max avec vdot
                  par exemple) propose des chronos souvent trop ambitieux
                  longues distances, ou simplement imprécis.
                </p>
                <p>
                  la méthode{' '}
                  <span className="font-semibold text-white">Points Purdy</span>{' '}
                  montre des résultats plus équilibrés en se basant sur les records du monde de chaque distance. D'un
                  point de vu scientifique, plusieurs articles utilise cette
                  méthode comme base de références
                  : <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4919094/">https://pmc.ncbi.nlm.nih.gov/articles/PMC4919094/</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
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
