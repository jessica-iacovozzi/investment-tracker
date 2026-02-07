import { useState } from 'react'
import type { InflationState } from '../types/inflation'
import {
  MIN_INFLATION_RATE,
  MAX_INFLATION_RATE,
  INFLATION_RATE_STEP,
} from '../types/inflation'
import { isValidInflationRate } from '../utils/inflation'

type InflationControlsProps = {
  inflationState: InflationState
  onUpdate: (updates: Partial<InflationState>) => void
}

function InflationControls({ inflationState, onUpdate }: InflationControlsProps) {
  const [inputValue, setInputValue] = useState(() =>
    String(inflationState.annualRatePercent),
  )

  const handleToggle = () => {
    onUpdate({ isEnabled: !inflationState.isEnabled })
  }

  const handleRateChange = (value: string) => {
    setInputValue(value)

    if (value === '') {
      return
    }

    const parsed = Number(value)
    if (!Number.isFinite(parsed) || !isValidInflationRate(parsed)) {
      return
    }

    onUpdate({ annualRatePercent: parsed })
  }

  const parsedRate = Number(inputValue)
  const showError =
    inputValue !== '' &&
    (!Number.isFinite(parsedRate) || !isValidInflationRate(parsedRate))
  const helpText = showError
    ? `Enter a rate between ${MIN_INFLATION_RATE}% and ${MAX_INFLATION_RATE}%.`
    : ''

  return (
    <div className="inflation-controls">
      <div className="inflation-controls__toggle">
        <span className="inflation-controls__label" id="inflation-toggle-label">
          Inflation Adjusted
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={inflationState.isEnabled}
          aria-labelledby="inflation-toggle-label"
          className={`inflation-controls__switch ${inflationState.isEnabled ? 'inflation-controls__switch--active' : ''}`}
          onClick={handleToggle}
        >
          <span className="inflation-controls__thumb" />
        </button>
      </div>

      {inflationState.isEnabled && (
        <div className="inflation-controls__input">
          <label htmlFor="inflation-rate">Inflation rate (%)</label>
          <input
            id="inflation-rate"
            type="number"
            min={MIN_INFLATION_RATE}
            max={MAX_INFLATION_RATE}
            step={INFLATION_RATE_STEP}
            value={inputValue}
            onChange={(event) => handleRateChange(event.target.value)}
            aria-describedby="inflation-rate-help"
            aria-invalid={showError}
          />
          <p
            id="inflation-rate-help"
            className="field-help"
            aria-live="polite"
          >
            {helpText}
          </p>
        </div>
      )}
    </div>
  )
}

export default InflationControls
