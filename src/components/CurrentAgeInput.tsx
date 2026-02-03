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
  const helpText = showError ? 'Enter an age between 0 and 120.' : 'Optional'

  return (
    <div className="current-age-input">
      <label htmlFor="global-current-age">Current age</label>
      <input
        id="global-current-age"
        type="number"
        min="0"
        max="120"
        step="1"
        value={inputValue}
        onChange={(event) => handleChange(event.target.value)}
        aria-describedby="global-current-age-help"
        aria-invalid={showError}
      />
      <p
        id="global-current-age-help"
        className="field-help"
        aria-live="polite"
      >
        {helpText}
      </p>
    </div>
  )
}

export default CurrentAgeInput
