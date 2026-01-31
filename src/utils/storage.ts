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
