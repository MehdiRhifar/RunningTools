import { useReducer } from 'react'
import { PaceInput } from '../../component/PaceInput.tsx'
import { defaultPace, Pace, paceToString } from '../../interface/Pace.tsx'
import { defaultTime, timeToString } from '../../interface/Time.tsx'
import { DistanceInput } from '../../component/DistanceInput.tsx'
import {
  PercentageActionType,
  percentageReducer,
} from './Percentage.reducer.ts'
import { TimeCalculator } from '../../component/TimeCalculator.tsx'
import { NumberInput } from '../../component/NumberInput.tsx'

export function PaceToTimePage() {
  const [state, dispatch] = useReducer(percentageReducer, {
    percent: 100,
    pace: defaultPace,
    pacePercent: defaultPace,
    speedPercent: 0,
    speed: 0,
    distance: 0,
    timeForDist: defaultTime,
  })

  const handleDistance = (newDistance: number) => {
    dispatch({ type: PercentageActionType.SET_DISTANCE, payload: newDistance })
  }
  const handlePercent = (newPercent: number) => {
    dispatch({ type: PercentageActionType.SET_PERCENT, payload: newPercent })
  }

  const handlePace = (newPace: Pace) => {
    dispatch({ type: PercentageActionType.SET_PACE, payload: newPace })
  }

  const handleSpeed = (newSpeed: number) => {
    dispatch({ type: PercentageActionType.SET_SPEED, payload: newSpeed })
  }

  return (
    <>
      <title>percentage</title>
      <div className={'my-10'}>
        <div>
          <NumberInput
            className={'w-16'}
            onNumberInput={handlePercent}
            value={state.percent}
            postfix={' %'}
          />{' '}
        </div>
        <div className={'flex'}>
          <NumberInput
            className={'flex-1'}
            onNumberInput={handleSpeed}
            value={state.speed}
            postfix={' km/h'}
          />{' '}
          <PaceInput
            className={'flex-1 ml-1 custom-input'}
            onTimeChange={handlePace}
            pace={state.pace}
          />
        </div>
        <div>
          {state.speedPercent.toFixed(2)} km/h -{' '}
          {paceToString(state.pacePercent)}
        </div>
      </div>
      <div>
        <DistanceInput onDistanceChange={handleDistance} />
      </div>
      <div>Temps : {timeToString(state.timeForDist)}</div>

      <TimeCalculator
        distance={state.distance}
        time={state.timeForDist}
      ></TimeCalculator>
    </>
  )
}
