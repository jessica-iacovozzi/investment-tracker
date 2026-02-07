import type { KeyboardEvent } from 'react'
import type { ViewPreference } from '../types/investment'

type ViewToggleProps = {
  activeView: ViewPreference
  onChange: (view: ViewPreference) => void
}

const TABS: { value: ViewPreference; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'cards', label: 'Cards' },
]

/**
 * Tab bar for switching between Cards and List account views.
 * Implements WAI-ARIA tablist pattern with full keyboard navigation.
 */
function ViewToggle({ activeView, onChange }: ViewToggleProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = TABS.findIndex((tab) => tab.value === activeView)
    let nextIndex = currentIndex

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      nextIndex = (currentIndex + 1) % TABS.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
    } else if (event.key === 'Home') {
      event.preventDefault()
      nextIndex = 0
    } else if (event.key === 'End') {
      event.preventDefault()
      nextIndex = TABS.length - 1
    } else {
      return
    }

    onChange(TABS[nextIndex].value)

    const nextButton = document.querySelector<HTMLButtonElement>(
      `[data-view-tab="${TABS[nextIndex].value}"]`,
    )
    nextButton?.focus()
  }

  return (
    <div className="view-toggle" role="tablist" aria-label="Account view">
      {TABS.map((tab) => {
        const isActive = activeView === tab.value

        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            className={`view-toggle__tab${isActive ? ' view-toggle__tab--active' : ''}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            data-view-tab={tab.value}
            onClick={() => onChange(tab.value)}
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default ViewToggle
