import { describe, expect, it, vi } from 'vitest'
import { isLocalStorageAvailable, loadGoalState, saveGoalState, clearGoalState } from './storage'
import { DEFAULT_GOAL_STATE } from '../types/goal'
import type { GoalState } from '../types/goal'

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
