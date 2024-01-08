import React, { useEffect, useRef, useState } from 'react'
import { parseIntSafe } from '../Utils/Utils.tsx'
import { defaultTime, Time, timeToString } from '../interface/Time.tsx'

import { useMaskito } from '@maskito/react'
import {
  maskitoTimeOptionsGenerator,
  maskitoWithPlaceholder,
} from '@maskito/kit'
import { MaskitoOptions } from '@maskito/core'

interface OnTimeChange {
  value?: Time
  onTimeChange: (time: Time) => void
}

export function TimeInput({ onTimeChange, value }: OnTimeChange) {
  const [timeStr, setTimeStr] = useState(timeToString(defaultTime))

  const isEditLocal = useRef(true)

  useEffect(() => {
    if (isEditLocal.current) {
      isEditLocal.current = false
      return
    }
    if (value) {
      setTimeStr(timeToString(value))
    }
  }, [value])

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTimeStr(value)
    const [hours, minutes, seconds] = value.split(':').map(parseIntSafe)
    onTimeChange({ hours, minutes, seconds })
  }

  const timeOption = maskitoTimeOptionsGenerator({
    mode: 'HH:MM:SS',
    timeSegmentMaxValues: { hours: 99 },
  })

  const {
    plugins, // plugins keeps caret inside actual value and remove placeholder on blur
    ...placeholderOptions
    // pass 'true' as second argument to add plugin to hide placeholder when input is not focused
  } = maskitoWithPlaceholder('00:00:00', false)

  const optionWithPlace = {
    ...timeOption,
    plugins: timeOption.plugins.concat(),
    preprocessors: [...timeOption.preprocessors],
    postprocessors: [
      ...timeOption.postprocessors,
      // Always put it AFTER all other postprocessors
      ...placeholderOptions.postprocessors,
    ],
  } as Required<MaskitoOptions>

  const maskedInputRef = useMaskito({ options: optionWithPlace })

  return (
    <>
      <input
        className={'custom-input'}
        ref={maskedInputRef}
        value={timeStr}
        onInput={onInputChange}
      />
    </>
  )
}
