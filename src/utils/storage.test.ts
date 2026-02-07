import { describe, expect, it, vi } from 'vitest'
import {
  isLocalStorageAvailable,
  loadGoalState,
  saveGoalState,
  clearGoalState,
  loadInflationState,
  saveInflationState,
  clearInflationState,
  loadViewPreference,
  saveViewPreference,
  clearViewPreference,
} from './storage'
import { DEFAULT_GOAL_STATE } from '../types/goal'
import type { GoalState } from '../types/goal'
import { DEFAULT_INFLATION_STATE } from '../types/inflation'
import type { InflationState } from '../types/inflation'

const buildMockStorage = () => {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

describe('isLocalStorageAvailable', () => {
  it('returns true when localStorage is writable', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    expect(isLocalStorageAvailable()).toBe(true)

    vi.unstubAllGlobals()
  })

  it('returns false when localStorage throws', () => {
    const mockStorage = {
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => undefined,
    }

    vi.stubGlobal('window', { localStorage: mockStorage })

    expect(isLocalStorageAvailable()).toBe(false)

    vi.unstubAllGlobals()
  })

  it('returns false when window is undefined', () => {
    const originalWindow = globalThis.window

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })

    expect(isLocalStorageAvailable()).toBe(false)

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    })
  })
})

describe('loadGoalState', () => {
  it('returns default state when storage unavailable', () => {
    const result = loadGoalState({ storageAvailable: false })
    expect(result).toEqual(DEFAULT_GOAL_STATE)
  })

  it('returns default state when no stored value', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadGoalState({ storageAvailable: true })
    expect(result).toEqual(DEFAULT_GOAL_STATE)

    vi.unstubAllGlobals()
  })

  it('returns stored goal state', () => {
    const mockStorage = buildMockStorage()
    const storedState: GoalState = {
      ...DEFAULT_GOAL_STATE,
      isGoalMode: true,
      targetBalance: 500000,
    }
    mockStorage.setItem('investment-tracker-goal', JSON.stringify(storedState))
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadGoalState({ storageAvailable: true })
    expect(result.isGoalMode).toBe(true)
    expect(result.targetBalance).toBe(500000)

    vi.unstubAllGlobals()
  })

  it('returns default state on invalid JSON', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-goal', 'invalid json')
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadGoalState({ storageAvailable: true })
    expect(result).toEqual(DEFAULT_GOAL_STATE)

    vi.unstubAllGlobals()
  })
})

describe('saveGoalState', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    saveGoalState({
      goalState: { ...DEFAULT_GOAL_STATE, isGoalMode: true },
      storageAvailable: false,
    })

    expect(mockStorage.getItem('investment-tracker-goal')).toBeNull()

    vi.unstubAllGlobals()
  })

  it('saves goal state to localStorage', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    const goalState: GoalState = {
      ...DEFAULT_GOAL_STATE,
      isGoalMode: true,
      targetBalance: 750000,
    }
    saveGoalState({ goalState, storageAvailable: true })

    const stored = mockStorage.getItem('investment-tracker-goal')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.isGoalMode).toBe(true)
    expect(parsed.targetBalance).toBe(750000)

    vi.unstubAllGlobals()
  })
})

describe('clearGoalState', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-goal', JSON.stringify(DEFAULT_GOAL_STATE))
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearGoalState({ storageAvailable: false })

    expect(mockStorage.getItem('investment-tracker-goal')).not.toBeNull()

    vi.unstubAllGlobals()
  })

  it('removes goal state from localStorage', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-goal', JSON.stringify(DEFAULT_GOAL_STATE))
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearGoalState({ storageAvailable: true })

    expect(mockStorage.getItem('investment-tracker-goal')).toBeNull()

    vi.unstubAllGlobals()
  })
})

describe('loadInflationState', () => {
  it('returns default state when storage unavailable', () => {
    const result = loadInflationState({ storageAvailable: false })
    expect(result).toEqual(DEFAULT_INFLATION_STATE)
  })

  it('returns default state when no stored value', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadInflationState({ storageAvailable: true })
    expect(result).toEqual(DEFAULT_INFLATION_STATE)

    vi.unstubAllGlobals()
  })

  it('returns stored inflation state', () => {
    const mockStorage = buildMockStorage()
    const storedState: InflationState = {
      isEnabled: true,
      annualRatePercent: 3.5,
    }
    mockStorage.setItem('investment-tracker-inflation', JSON.stringify(storedState))
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadInflationState({ storageAvailable: true })
    expect(result.isEnabled).toBe(true)
    expect(result.annualRatePercent).toBe(3.5)

    vi.unstubAllGlobals()
  })

  it('returns default state on invalid JSON', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-inflation', 'invalid json')
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadInflationState({ storageAvailable: true })
    expect(result).toEqual(DEFAULT_INFLATION_STATE)

    vi.unstubAllGlobals()
  })

  it('merges partial stored state with defaults', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-inflation', JSON.stringify({ isEnabled: true }))
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadInflationState({ storageAvailable: true })
    expect(result.isEnabled).toBe(true)
    expect(result.annualRatePercent).toBe(DEFAULT_INFLATION_STATE.annualRatePercent)

    vi.unstubAllGlobals()
  })
})

describe('saveInflationState', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    saveInflationState({
      inflationState: { isEnabled: true, annualRatePercent: 3 },
      storageAvailable: false,
    })

    expect(mockStorage.getItem('investment-tracker-inflation')).toBeNull()

    vi.unstubAllGlobals()
  })

  it('saves inflation state to localStorage', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    const inflationState: InflationState = {
      isEnabled: true,
      annualRatePercent: 4.0,
    }
    saveInflationState({ inflationState, storageAvailable: true })

    const stored = mockStorage.getItem('investment-tracker-inflation')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.isEnabled).toBe(true)
    expect(parsed.annualRatePercent).toBe(4.0)

    vi.unstubAllGlobals()
  })
})

describe('clearInflationState', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-inflation', JSON.stringify(DEFAULT_INFLATION_STATE))
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearInflationState({ storageAvailable: false })

    expect(mockStorage.getItem('investment-tracker-inflation')).not.toBeNull()

    vi.unstubAllGlobals()
  })

  it('removes inflation state from localStorage', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investment-tracker-inflation', JSON.stringify(DEFAULT_INFLATION_STATE))
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearInflationState({ storageAvailable: true })

    expect(mockStorage.getItem('investment-tracker-inflation')).toBeNull()

    vi.unstubAllGlobals()
  })
})

describe('loadViewPreference', () => {
  it('returns list when storage unavailable', () => {
    const result = loadViewPreference({ storageAvailable: false })
    expect(result).toBe('list')
  })

  it('returns list when no stored value', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadViewPreference({ storageAvailable: true })
    expect(result).toBe('list')

    vi.unstubAllGlobals()
  })

  it('returns stored view preference', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investmentTracker_viewPreference', 'list')
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadViewPreference({ storageAvailable: true })
    expect(result).toBe('list')

    vi.unstubAllGlobals()
  })

  it('returns list for invalid stored value', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investmentTracker_viewPreference', 'table')
    vi.stubGlobal('window', { localStorage: mockStorage })

    const result = loadViewPreference({ storageAvailable: true })
    expect(result).toBe('list')

    vi.unstubAllGlobals()
  })
})

describe('saveViewPreference', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    saveViewPreference({ viewPreference: 'list', storageAvailable: false })

    expect(mockStorage.getItem('investmentTracker_viewPreference')).toBeNull()

    vi.unstubAllGlobals()
  })

  it('saves view preference to localStorage', () => {
    const mockStorage = buildMockStorage()
    vi.stubGlobal('window', { localStorage: mockStorage })

    saveViewPreference({ viewPreference: 'list', storageAvailable: true })

    expect(mockStorage.getItem('investmentTracker_viewPreference')).toBe('list')

    vi.unstubAllGlobals()
  })
})

describe('clearViewPreference', () => {
  it('does nothing when storage unavailable', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investmentTracker_viewPreference', 'list')
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearViewPreference({ storageAvailable: false })

    expect(mockStorage.getItem('investmentTracker_viewPreference')).not.toBeNull()

    vi.unstubAllGlobals()
  })

  it('removes view preference from localStorage', () => {
    const mockStorage = buildMockStorage()
    mockStorage.setItem('investmentTracker_viewPreference', 'list')
    vi.stubGlobal('window', { localStorage: mockStorage })

    clearViewPreference({ storageAvailable: true })

    expect(mockStorage.getItem('investmentTracker_viewPreference')).toBeNull()

    vi.unstubAllGlobals()
  })
})
