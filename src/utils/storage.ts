import type { GoalState } from '../types/goal'
import { DEFAULT_GOAL_STATE } from '../types/goal'
import type { InflationState } from '../types/inflation'
import { DEFAULT_INFLATION_STATE } from '../types/inflation'

const GOAL_STORAGE_KEY = 'investment-tracker-goal'
const INFLATION_STORAGE_KEY = 'investment-tracker-inflation'

/**
 * Check if localStorage is available for read/write operations.
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return false
  }

  try {
    const testKey = '__investment_tracker_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch (error) {
    console.warn('Local storage is unavailable.', error)
    return false
  }
}

/**
 * Load goal state from localStorage.
 */
export const loadGoalState = ({
  storageAvailable,
}: {
  storageAvailable: boolean
}): GoalState => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return DEFAULT_GOAL_STATE
  }

  const storedValue = window.localStorage.getItem(GOAL_STORAGE_KEY)
  if (!storedValue) {
    return DEFAULT_GOAL_STATE
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<GoalState>
    return {
      ...DEFAULT_GOAL_STATE,
      ...parsed,
    }
  } catch (error) {
    console.warn('Failed to load saved goal state.', error)
    return DEFAULT_GOAL_STATE
  }
}

/**
 * Save goal state to localStorage.
 */
export const saveGoalState = ({
  goalState,
  storageAvailable,
}: {
  goalState: GoalState
  storageAvailable: boolean
}): void => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalState))
}

/**
 * Clear goal state from localStorage.
 */
export const clearGoalState = ({
  storageAvailable,
}: {
  storageAvailable: boolean
}): void => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.removeItem(GOAL_STORAGE_KEY)
}

/**
 * Load inflation state from localStorage.
 */
export const loadInflationState = ({
  storageAvailable,
}: {
  storageAvailable: boolean
}): InflationState => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return DEFAULT_INFLATION_STATE
  }

  const storedValue = window.localStorage.getItem(INFLATION_STORAGE_KEY)
  if (!storedValue) {
    return DEFAULT_INFLATION_STATE
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<InflationState>
    return {
      ...DEFAULT_INFLATION_STATE,
      ...parsed,
    }
  } catch (error) {
    console.warn('Failed to load saved inflation state.', error)
    return DEFAULT_INFLATION_STATE
  }
}

/**
 * Save inflation state to localStorage.
 */
export const saveInflationState = ({
  inflationState,
  storageAvailable,
}: {
  inflationState: InflationState
  storageAvailable: boolean
}): void => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.setItem(INFLATION_STORAGE_KEY, JSON.stringify(inflationState))
}

/**
 * Clear inflation state from localStorage.
 */
export const clearInflationState = ({
  storageAvailable,
}: {
  storageAvailable: boolean
}): void => {
  if (typeof window === 'undefined' || !storageAvailable) {
    return
  }

  window.localStorage.removeItem(INFLATION_STORAGE_KEY)
}
