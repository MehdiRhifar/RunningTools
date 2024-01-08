import React, { useEffect, useRef, useState } from 'react'
import MaskedInput from 'react-text-mask'
import { parseIntSafe } from '../Utils/Utils.tsx'
import { defaultPace, Pace, paceToString } from '../interface/Pace.tsx'

interface OnPaceChange {
  onTimeChange: (pace: Pace) => void
  pace?: Pace
  className?: string
}

export function PaceInput({ onTimeChange, pace, className }: OnPaceChange) {
  const [paceStr, setPaceStr] = useState(paceToString(defaultPace))

  const isEditLocal = useRef(true)

  useEffect(() => {
    if (isEditLocal.current) {
      isEditLocal.current = false
      return
    }
    if (pace) {
      setPaceStr(paceToString(pace))
    }
  }, [pace])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaceStr(event.target.value)
    isEditLocal.current = true

    if (event.target.value == '') {
      onTimeChange(defaultPace)
      return
    }

    const value = event.target.value.replace("'", '').replace('_', '0')
    const timeSplit = value.split('"')
    const [minutes, seconds] = timeSplit.map(parseIntSafe)
    const pace2: Pace = { minutes: minutes, seconds: seconds }
    onTimeChange(pace2)
  }

  return (
    <MaskedInput
      className={className}
      mask={[/[0-9]/, /[0-9]/, '"', /[0-5]/, /[0-9]/, "'"]}
      guide={true}
      value={paceStr}
      keepCharPositions={true}
      onChange={handleInputChange}
      placeholder={'mm\u0022ss\u0027'}
    />
  )
}
