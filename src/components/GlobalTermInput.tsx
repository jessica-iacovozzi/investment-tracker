import { useState } from 'react'

const MIN_TERM_YEARS = 1
const MAX_TERM_YEARS = 100

const isValidTermYears = (value: number): boolean =>
  Number.isFinite(value) && value >= MIN_TERM_YEARS && value <= MAX_TERM_YEARS

type GlobalTermInputProps = {
  termYears: number
  onChange: (termYears: number) => void
}

function GlobalTermInput({ termYears, onChange }: GlobalTermInputProps) {
  const [inputValue, setInputValue] = useState(() => String(termYears))
  const [prevTermYears, setPrevTermYears] = useState(termYears)
  if (termYears !== prevTermYears) {
    setPrevTermYears(termYears)
    setInputValue(String(termYears))
  }

  const handleChange = (value: string) => {
    setInputValue(value)
    if (value === '') {
      return
    }

    const parsed = Number(value)
    if (!isValidTermYears(parsed)) {
      return
    }

    onChange(parsed)
  }

  const parsedValue = Number(inputValue)
  const showError =
    inputValue !== '' && (!Number.isFinite(parsedValue) || !isValidTermYears(parsedValue))
  return (
    <div className="global-term-input">
      <label htmlFor="global-term-years" className="field-label--with-info">
        Term (years)
        <span className="field-label__info" title="Applies to all accounts">
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
        id="global-term-years"
        type="number"
        min={MIN_TERM_YEARS}
        max={MAX_TERM_YEARS}
        step="1"
        value={inputValue}
        onChange={(event) => handleChange(event.target.value)}
        aria-describedby={showError ? 'global-term-years-help' : undefined}
        aria-invalid={showError}
      />
      {showError && (
        <p
          id="global-term-years-help"
          className="field-help"
          aria-live="polite"
        >
          {`Enter a value between ${MIN_TERM_YEARS} and ${MAX_TERM_YEARS}.`}
        </p>
      )}
    </div>
  )
}

export default GlobalTermInput
