import React, { useState, useEffect, ReactNode } from 'react'

interface AsyncBoundaryProps<T> {
  loadFn: () => Promise<T>
  loadingFallback: ReactNode
  errorFallback?: (error: Error) => ReactNode
  children: (data: T) => ReactNode
  deps?: any[]
}

export function AsyncBoundary<T>({
  loadFn,
  loadingFallback,
  errorFallback,
  children,
  deps = []
}: AsyncBoundaryProps<T>) {
  const [state, setState] = useState<{
    loading: boolean
    data: T | null
    error: Error | null
  }>({
    loading: true,
    data: null,
    error: null
  })

  useEffect(() => {
    let isMounted = true
    setState({ loading: true, data: null, error: null })

    loadFn()
      .then((data) => {
        if (isMounted) {
          setState({ loading: false, data, error: null })
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ loading: false, data: null, error })
        }
      })

    return () => {
      isMounted = false
    }
  }, deps)

  if (state.loading) {
    return <>{loadingFallback}</>
  }

  if (state.error && errorFallback) {
    return <>{errorFallback(state.error)}</>
  }

  if (state.data) {
    return <>{children(state.data)}</>
  }

  return null
}
