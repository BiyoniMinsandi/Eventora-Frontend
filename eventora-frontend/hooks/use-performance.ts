/**
 * Performance Optimization Hooks
 * Provides React hooks for caching, memoization, and debouncing
 * Improves application performance for concurrent users
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Cache for expensive computations
 */
class ComputationCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map()
  private ttl: number // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.ttl = ttl
  }

  get(key: string): T | undefined {
    const cached = this.cache.get(key)
    if (!cached) return undefined

    const isExpired = Date.now() - cached.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return undefined
    }

    return cached.value
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }
}

// Global cache instance
const globalCache = new ComputationCache()

/**
 * Hook for memoizing expensive computations with cache
 * @param fn - Function to memoize
 * @param deps - Dependency array
 * @param key - Cache key
 * @returns Memoized function
 */
export function useMemoizedComputation<T extends any>(
  fn: () => T,
  deps: React.DependencyList,
  key: string
): T {
  const [value, setValue] = useState<T>(() => {
    const cached = globalCache.get(key)
    if (cached !== null && cached !== undefined) {
      return cached as T
    }
    return fn()
  })

  useEffect(() => {
    const cached = globalCache.get(key)
    if (cached !== undefined) {
      setValue(cached as T)
    } else {
      const result = fn()
      globalCache.set(key, result)
      setValue(result)
    }
  // `deps` is intentionally passed in from the caller. Disable exhaustive-deps
  // for this specific pattern where the dependency array is dynamic.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return value
}

/**
 * Debounce hook for rapid updates
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T extends any>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for rate limiting function calls
 * @param callback - Function to throttle
 * @param delay - Throttle delay in milliseconds
 * @returns Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const throttled = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const lastRun = lastRunRef.current

    // First call should run immediately.
    if (lastRun === 0) {
      lastRunRef.current = now
      callback(...args)
      return
    }

    const timeSinceLastRun = now - lastRun

    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now
      callback(...args)
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      lastRunRef.current = Date.now()
      callback(...args)
    }, delay - timeSinceLastRun)
  }, [callback, delay])

  return throttled as T
}

/**
 * Prevent double-submit by tracking pending state
 * @param asyncFn - Async function to protect
 * @returns Array with [result, loading, execute]
 */
export function useAsyncAction<Args extends any[], Result extends any>(
  asyncFn: (...args: Args) => Promise<Result>
): [Result | null, boolean, (...args: Args) => Promise<Result | null>] {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const pendingRef = useRef<boolean>(false)

  const execute = useCallback(
    async (...args: Args): Promise<Result | null> => {
      // Prevent double-submit
      if (pendingRef.current) return null

      pendingRef.current = true
      setLoading(true)

      try {
        const res = await asyncFn(...args)
        setResult(res)
        return res
      } catch (error) {
        console.error('Async action failed:', error)
        return null
      } finally {
        setLoading(false)
        pendingRef.current = false
      }
    },
    [asyncFn]
  )

  return [result, loading, execute]
}

/**
 * Local storage hook with automatic synchronization
 * @param key - Storage key
 * @param defaultValue - Initial value
 * @returns Array with [value, setValue]
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (val: T | ((v: T) => T)) => {
      try {
        const valueToStore = val instanceof Function ? val(value) : val
        setValue(valueToStore)

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error('Failed to store value:', error)
      }
    },
    [key, value]
  )

  return [value, setStoredValue]
}

/**
 * Batch state updates to reduce re-renders
 * @returns Object with batched state and update function
 */
export function useBatchState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const batched = useRef<Partial<T>>({})
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const updateBatch = useCallback((updates: Partial<T>) => {
    batched.current = { ...batched.current, ...updates }

    // Batch updates with debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...batched.current }))
      batched.current = {}
    }, 16) // ~60fps
  }, [])

  return [state, updateBatch] as const
}

/**
 * Infinite scroll hook for pagination
 * @param items - Array of items
 * @param pageSize - Items per page
 * @returns Object with visible items, hasMore, and loadMore function
 */
export function useInfiniteScroll<T>(items: T[], pageSize: number = 20) {
  const [displayCount, setDisplayCount] = useState(pageSize)

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + pageSize, items.length))
  }, [items.length, pageSize])

  const visibleItems = items.slice(0, displayCount)
  const hasMore = displayCount < items.length

  return { visibleItems, hasMore, loadMore, displayCount }
}

/**
 * Session storage hook for temporary state
 * @param key - Storage key
 * @param defaultValue - Initial value
 * @returns Array with [value, setValue]
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = sessionStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (val: T | ((v: T) => T)) => {
      try {
        const valueToStore = val instanceof Function ? val(value) : val
        setValue(valueToStore)

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error('Failed to store value in session:', error)
      }
    },
    [key, value]
  )

  return [value, setStoredValue]
}

/**
 * Clear global computation cache
 */
export function clearComputationCache(): void {
  globalCache.clear()
}
