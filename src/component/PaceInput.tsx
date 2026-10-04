import React, { useEffect, useState } from 'react'
import { parseIntSafe, selectAllOnFocus } from '../Utils/Utils.tsx'
import { defaultPace, Pace, paceToString } from '../interface/Pace.tsx'
import { maskitoWithPlaceholder } from '@maskito/kit'
import { useMaskito } from '@maskito/react'
import { MaskitoOptions } from '@maskito/core'

interface OnPaceChange {
  onTimeChange: (pace: Pace) => void
  pace?: Pace
  className?: string
}

const { postprocessors } = maskitoWithPlaceholder(`00'00"`, false)

// Constante de module : Maskito ne doit pas être recréé à chaque rendu
const paceMaskOptions: MaskitoOptions = {
  mask: [/[0-9]/, /[0-9]/, "'", /[0-5]/, /[0-9]/, '"'],
  overwriteMode: 'replace',
  preprocessors: [],
  postprocessors: [...postprocessors],
}

export function PaceInput({ onTimeChange, pace, className }: OnPaceChange) {
  const [paceStr, setPaceStr] = useState(paceToString(defaultPace))

  useEffect(() => {
    if (pace) {
      setPaceStr(paceToString(pace))
    }
  }, [pace])

  const maskedInputRef = useMaskito({ options: paceMaskOptions })

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaceStr(event.target.value)

    if (event.target.value == '') {
      onTimeChange(defaultPace)
      return
    }

    const value = event.target.value.replace('"', '')
    const timeSplit = value.split("'")
    const [minutes = 0, seconds = 0] = timeSplit.map(parseIntSafe)
    const pace2: Pace = { minutes: minutes, seconds: seconds, milliseconds: 0 }
    onTimeChange(pace2)
  }

  return (
    <>
      <input
        className={className}
        onInput={onInputChange}
        onFocus={selectAllOnFocus}
        ref={maskedInputRef}
        inputMode="numeric"
        value={paceStr}
      />
    </>
  )
}
