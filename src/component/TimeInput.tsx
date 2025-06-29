import React, { useEffect, useMemo, useState } from 'react'
import { parseIntSafe } from '../Utils/Utils.tsx'
import { defaultTime, Time, timeToString } from '../interface/Time.tsx'

import { useMaskito } from '@maskito/react'
import { maskitoWithPlaceholder } from '@maskito/kit'
import { MaskitoOptions } from '@maskito/core'
import { useMilliseconds } from '../contexts/MillisecondsContext.tsx'

interface OnTimeChange {
  timeChanged?: Time
  onTimeChange: (time: Time) => void
}

export function TimeInput({ onTimeChange, timeChanged }: OnTimeChange) {
  const [time, setTime] = useState(defaultTime)
  const { isMillisecondsMode } = useMilliseconds()
  const [timeStr, setTimeStr] = useState(timeToString(time, isMillisecondsMode))


  useEffect(() => {
    if (timeChanged) {
      setTime(timeChanged)
      setTimeStr(timeToString(timeChanged, isMillisecondsMode))
    }
  }, [timeChanged])

  useEffect(() => {
    setTime({...time, milliseconds: 0})
    setTimeStr(timeToString(time, isMillisecondsMode))
  }, [isMillisecondsMode])


  const parseTimeFromInput = (value: string, isMillisecondsMode: boolean): Time => {
    const [hours_str, minutes_str, seconds_milliseconds] = value.split(':')
    const hours = parseIntSafe(hours_str)
    const minutes = parseIntSafe(minutes_str)

    if (isMillisecondsMode) {
      const [seconds, milliseconds] = seconds_milliseconds
        .split('.')
        .map(parseIntSafe)
      return { hours, minutes, seconds, milliseconds: milliseconds * 10 }
    } else {
      const seconds = parseIntSafe(seconds_milliseconds)
      return { hours, minutes, seconds, milliseconds: 0 }
    }
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTimeStr(value)
    const time = parseTimeFromInput(value, isMillisecondsMode) // ✅ Simple et propre
    setTime(time)
    onTimeChange(time)
  }

  const { placeholder, mask } = useMemo(() => {
    if (isMillisecondsMode) {
      return {
        placeholder: '00:00:00.00',
        mask: [/[0-9]/,/[0-9]/,':',/[0-5]/,/[0-9]/,':',/[0-5]/,/[0-9]/,'.',/[0-9]/,/[0-9]/]
      }
    } else {
      return {
        placeholder: '00:00:00',
        mask: [/[0-9]/,/[0-9]/,':',/[0-5]/,/[0-9]/,':',/[0-5]/,/[0-9]/]
      }
    }
  }, [isMillisecondsMode])

  const maskitoOptions = useMemo(() => {
    const {
      plugins,
      ...placeholderOptions
    } = maskitoWithPlaceholder(placeholder, false)

    return {
      mask: mask,
      overwriteMode: 'replace' as const,
      preprocessors: [],
      postprocessors: [...placeholderOptions.postprocessors],
    } as MaskitoOptions
  }, [mask, placeholder])


  const maskedInputRef = useMaskito({ options: maskitoOptions })

  return (
    <>
      <input
        className={'custom-input'}
        ref={maskedInputRef}
        value={timeStr}
        onInput={onInputChange}
        placeholder={placeholder}
      />
    </>
  )
}
