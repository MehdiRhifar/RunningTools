import React, { useState } from 'react'
import { getKeys, parseIntSafe } from '../Utils/Utils.tsx'
import { distancesInfo } from '../Utils/Constants.tsx'
import { NumberInput } from './NumberInput.tsx'

interface OnDistanceChange {
  onDistanceChange: (number: number) => void
  value?: number
}

export function DistanceInput({ onDistanceChange, value }: OnDistanceChange) {
  const [distance, setDistance] = useState<number>(
    value !== undefined ? value : 0
  )

  const handleDistanceChange = (distance: number) => {
    setDistance(distance)
    onDistanceChange(distance)
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleDistanceChange(parseIntSafe(event.target.value))
  }

  return (
    <div className="">
      <NumberInput
        className="custom-input"
        propsValue={distance}
        onNumberInput={handleDistanceChange}
        postfix=" m"
      />

      <select
        value={distance}
        onChange={handleSelectChange}
        className="ml-1 custom-input"
      >
        <option value="">Select Distance</option>
        {getKeys(distancesInfo).map((key) => (
          <option key={key} value={distancesInfo[key].distance}>
            {distancesInfo[key].name}
          </option>
        ))}
      </select>
    </div>
  )
}
