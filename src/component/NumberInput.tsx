import { ChangeEvent, useEffect, useMemo, useState } from 'react'
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
  decimalPseudoSeparators?: string[]
  minimumFractionDigits?: number
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
      setNumberStr(
        propsValue.toLocaleString(undefined, { maximumFractionDigits: 9 }) +
          (numberInputProps.postfix ?? '')
      )
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

  const { min, max, decimalPseudoSeparators, minimumFractionDigits, prefix, postfix } =
    numberInputProps

  // Options stables : un nouvel objet à chaque rendu recréerait Maskito à chaque frappe
  const numberOptions = useMemo(() => {
    const base = maskitoNumberOptionsGenerator({
      min,
      max,
      decimalPseudoSeparators,
      minimumFractionDigits,
      prefix,
      postfix,
      decimalSeparator: decimalSeparatorSymbol,
      thousandSeparator: thousandsSeparatorSymbol,
      maximumFractionDigits: 9,
    })
    const plugins = [...base.plugins]
    if (postfix != undefined) {
      const length = postfix.length
      plugins.push(maskitoCaretGuard((value) => [0, value.length - length]))
    }
    return { ...base, plugins } as MaskitoOptions
  }, [min, max, decimalPseudoSeparators, minimumFractionDigits, prefix, postfix])

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
        inputMode="decimal"
        value={numberStr}
        onInput={handleNumberChange}
      />
    </>
  )
}
