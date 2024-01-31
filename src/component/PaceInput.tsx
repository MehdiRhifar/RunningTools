import React, { useEffect, useState } from 'react'
import { parseIntSafe } from '../Utils/Utils.tsx'
import { defaultPace, Pace, paceToString } from '../interface/Pace.tsx'
import { maskitoWithPlaceholder } from '@maskito/kit'
import { useMaskito } from '@maskito/react'
import { MaskitoOptions } from '@maskito/core'

interface OnPaceChange {
  onTimeChange: (pace: Pace) => void
  pace?: Pace
  className?: string
}

export function PaceInput({ onTimeChange, pace, className }: OnPaceChange) {
  const [paceStr, setPaceStr] = useState(paceToString(defaultPace))

  useEffect(() => {
    if (pace) {
      setPaceStr(paceToString(pace))
    }
  }, [pace])

  const {
    plugins, // plugins keeps caret inside actual value and remove placeholder on blur
    ...placeholderOptions
    // pass 'true' as second argument to add plugin to hide placeholder when input is not focused
  } = maskitoWithPlaceholder('00\u002200\u0027', false)

  const optionWithPlace = {
    mask: [/[0-9]/, /[0-9]/, '"', /[0-5]/, /[0-9]/, "'"],
    overwriteMode: 'replace',
    preprocessors: [],
    postprocessors: [...placeholderOptions.postprocessors],
  } as MaskitoOptions

  const maskedInputRef = useMaskito({ options: optionWithPlace })

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaceStr(event.target.value)

    if (event.target.value == '') {
      onTimeChange(defaultPace)
      return
    }

    const value = event.target.value.replace("'", '')
    const timeSplit = value.split('"')
    const [minutes, seconds] = timeSplit.map(parseIntSafe)
    const pace2: Pace = { minutes: minutes, seconds: seconds }
    onTimeChange(pace2)
  }

  return (
    <>
      <input
        className={className}
        onInput={onInputChange}
        ref={maskedInputRef}
        value={paceStr}
      />
    </>
  )
}
