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
  propsValue?: number
  className?: string
  min?: number
  max?: number
  precision?: number
  decimalPseudoSeparators?: string[]
  decimalZeroPadding?: boolean
  prefix?: string
  postfix?: string
}

export function NumberInput({
  propsValue,
  ...numberInputProps
}: NumberInputProps) {
  const [numberStr, setNumberStr] = useState<string>('')

  useEffect(() => {
    if (propsValue == undefined || (propsValue == 0 && numberStr == '')) {
      // Meaning input is empty
      setNumberStr('')
      return
    }
    if (propsValue != parseNumberSafe(numberStr)) {
      // Changement de l'exterieur
      setNumberStr(propsValue.toLocaleString() + numberInputProps.postfix)
    }
  }, [propsValue])

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newNumberStr = event.target.value
    const newNumber = parseNumberSafe(newNumberStr) // Parse la chaîne en un nombre entier

    if (isNaN(newNumber)) {
      setNumberStr('')
      numberInputProps.onNumberInput(0)
      return
    }
    if (newNumber != propsValue) {
      setNumberStr(newNumberStr)
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

  const getClassName = () => {
    return numberInputProps.className ? numberInputProps.className : ''
  }

  const maskedInputRef = useMaskito({ options: numberOptions })
  return (
    <>
      <input
        placeholder={'0' + (numberInputProps.postfix ?? '')}
        className={'custom-input ' + getClassName()}
        ref={maskedInputRef}
        value={numberStr}
        onInput={handleNumberChange}
      />
    </>
  )
}
