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
import { useMilliseconds } from '../../contexts/MillisecondsContext.tsx'

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

  const { isMillisecondsMode } = useMilliseconds()

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
    <div className={'main-container'}>
      <title>percentage</title>
        <h2>{'Calcul du temps pour une allure donnée'}</h2>
        <div>
          <NumberInput
            className={'w-20'}
            onNumberInput={handlePercent}
            propsValue={state.percent}
            postfix={' %'}
          />{' '}
        <div className={'flex'}>
          <NumberInput
            className={'flex-1'}
            onNumberInput={handleSpeed}
            propsValue={state.speed}
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
      <div>Temps : {timeToString(state.timeForDist, isMillisecondsMode)}</div>

      <TimeCalculator
        distance={state.distance}
        time={state.timeForDist}
        speed={state.speedPercent}
      ></TimeCalculator>
  </div>
  )
}
