import React, { useEffect, useRef, useState } from 'react'
import { InputMask } from '@react-input/mask'
import { animErrorDuration } from '../Utils/Constants.tsx'

interface InputMaskCustomProps {
  mask: string
  placeholder: string
  regex: RegExp
  onValidInput: (value: string) => void
  value?: string // Nouvelle prop pour la valeur externe
  className?: string
}

export function InputMaskCustom({
  mask,
  placeholder,
  regex,
  onValidInput,
  value,
  className,
}: InputMaskCustomProps) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState(false)
  const isEditLocal = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditLocal.current) {
      isEditLocal.current = false
      return
    }
    if (value) {
      setInputValue(value)
    }
  }, [value])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const value = event.target.value
    const cursorPosition = event.target.selectionStart

    if (regex.test(value)) {
      isEditLocal.current = true
      onValidInput(value)
      setInputValue(value)
    } else {
      setInputError(true)
      if (cursorPosition !== null) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
        }, 0)
      }
      setTimeout(() => {
        setInputError(false)
      }, animErrorDuration)
    }
  }

  return (
    <InputMask
      ref={inputRef}
      className={`${className} ${inputError ? 'input-error' : ''}`}
      mask={mask}
      replacement={'_'}
      placeholder={placeholder}
      showMask
      separate
      value={inputValue}
      onChange={handleInputChange}
    />
  )
}
