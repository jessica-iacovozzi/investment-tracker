import { describe, expect, it, vi } from 'vitest'
import { isLocalStorageAvailable } from './storage'

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
