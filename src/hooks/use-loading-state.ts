import { useState, useEffect } from 'react'

export function useLoadingState(initialLoading = true, delay = 500) {
  const [isLoading, setIsLoading] = useState(initialLoading)

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [initialLoading, delay])

  return isLoading
}

export function useSimulatedLoading(duration = 1000) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  return isLoading
}
