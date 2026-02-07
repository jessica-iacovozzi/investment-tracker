import { useState } from 'react'
import { isValidAge } from '../utils/ageLabel'

type CurrentAgeInputProps = {
  currentAge: number | undefined
  onChange: (age: number | undefined) => void
}

function CurrentAgeInput({ currentAge, onChange }: CurrentAgeInputProps) {
  const [inputValue, setInputValue] = useState(() =>
    currentAge === undefined ? '' : String(currentAge),
  )
  const [prevAge, setPrevAge] = useState(currentAge)
  if (currentAge !== prevAge) {
    setPrevAge(currentAge)
    setInputValue(currentAge === undefined ? '' : String(currentAge))
  }

  const handleChange = (value: string) => {
    setInputValue(value)
    if (value === '') {
      onChange(undefined)
      return
    }

    const parsed = Number(value)
    if (!Number.isFinite(parsed) || !isValidAge(parsed)) {
      return
    }

    onChange(parsed)
  }

  const parsedAge = Number(inputValue)
  const showError =
    inputValue !== '' && (!Number.isFinite(parsedAge) || !isValidAge(parsedAge))
  return (
    <div className="current-age-input">
      <label htmlFor="global-current-age" className="field-label--with-info">
        Current age
        <span className="field-label__info" title="Optional">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </span>
      </label>
      <input
        id="global-current-age"
        type="number"
        min="0"
        max="120"
        step="1"
        value={inputValue}
        onChange={(event) => handleChange(event.target.value)}
        aria-describedby={showError ? 'global-current-age-help' : undefined}
        aria-invalid={showError}
      />
      {showError && (
        <p
          id="global-current-age-help"
          className="field-help"
          aria-live="polite"
        >
          Enter an age between 0 and 120.
        </p>
      )}
    </div>
  )
}

export default CurrentAgeInput
