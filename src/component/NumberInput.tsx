import { ChangeEvent, useEffect, useState } from 'react'
import {
  decimalSeparatorSymbol,
  parseNumberSafe,
  thousandsSeparatorSymbol,
} from '../Utils/Utils.tsx'
import { maskitoCaretGuard, maskitoNumberOptionsGenerator } from '@maskito/kit'
import { useMaskito } from '@maskito/react'
import { MaskitoOptions } from '@maskito/core'

interface NumberInputProps {
  onNumberInput: (number: number) => void
  value?: number
  className?: string
  min?: number
  max?: number
  precision?: number
  decimalPseudoSeparators?: string[]
  decimalZeroPadding?: boolean
  prefix?: string
  postfix?: string
}

export function NumberInput(numberInputProps: NumberInputProps) {
  const [numberStr, setNumberStr] = useState<string>(
    numberInputProps.value != undefined
      ? numberInputProps.value.toString()
      : '0'
  )

  useEffect(() => {
    if (
      numberInputProps.value != undefined &&
      numberInputProps.value != parseNumberSafe(numberStr) // Changement de l'exterieur
    ) {
      setNumberStr(numberInputProps.value.toLocaleString())
    }
  }, [numberInputProps.value])

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newNumberStr = event.target.value
    const newNumber = parseNumberSafe(newNumberStr) // Parse la chaîne en un nombre entier
    setNumberStr(newNumberStr)

    if (newNumber != numberInputProps.value) {
      numberInputProps.onNumberInput(newNumber)
    }
  }

  const numberOptionsBase = maskitoNumberOptionsGenerator({
    min: numberInputProps.min,
    max: numberInputProps.max,
    decimalPseudoSeparators: numberInputProps.decimalPseudoSeparators,
    decimalZeroPadding: numberInputProps.decimalZeroPadding,
    prefix: numberInputProps.prefix,
    postfix: numberInputProps.postfix,
    decimalSeparator: decimalSeparatorSymbol,
    thousandSeparator: thousandsSeparatorSymbol,
    precision: 9,
  })
  const getPlugins = () => {
    const plugins = [...numberOptionsBase.plugins]
    if (numberInputProps.postfix != undefined) {
      const length = numberInputProps.postfix.length
      plugins.push(maskitoCaretGuard((value) => [0, value.length - length]))
    }

    return plugins
  }
  const numberOptions = {
    ...numberOptionsBase,
    plugins: getPlugins(),
  } as MaskitoOptions

  const maskedInputRef = useMaskito({ options: numberOptions })
  return (
    <>
      <input
        className={'custom-input ' + numberInputProps.className}
        ref={maskedInputRef}
        value={numberStr}
        onInput={handleNumberChange}
      />
    </>
  )
}
