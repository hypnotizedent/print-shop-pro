/**
 * API Hooks for Mint Prints Spark Frontend
 *
 * These hooks provide easy integration with the mintprints-api
 * while maintaining compatibility with the existing useKV pattern.
 */

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from './api-adapter'
import type { Quote, Job, Customer } from './types'

// ============================================================================
// Constants
// ============================================================================

const API_BASE = 'https://mintprints-api.ronny.works'

// ============================================================================
// Types
// ============================================================================

export interface ProductionStats {
  quote: number
  art: number
  screenprint: number
  embroidery: number
  dtg: number
  fulfillment: number
  complete: number
  total: number
}

interface UseAPIDataResult<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseAPISingleResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch production stats from the API
 */
export function useProductionStats(): {
  data: ProductionStats | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<ProductionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/production-stats`)
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      const rawData = await response.json()
      // API returns strings, convert to numbers
      const stats: ProductionStats = {
        quote: parseInt(rawData.quote, 10) || 0,
        art: parseInt(rawData.art, 10) || 0,
        screenprint: parseInt(rawData.screenprint, 10) || 0,
        embroidery: parseInt(rawData.embroidery, 10) || 0,
        dtg: parseInt(rawData.dtg, 10) || 0,
        fulfillment: parseInt(rawData.fulfillment, 10) || 0,
        complete: parseInt(rawData.complete, 10) || 0,
        total: parseInt(rawData.total, 10) || 0,
      }
      setData(stats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch production stats'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch quotes from the API with automatic transformation
 */
export function useAPIQuotes(params?: {
  status?: string
  limit?: number
  offset?: number
  enabled?: boolean
}): UseAPIDataResult<Quote> {
  const [data, setData] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (params?.enabled === false) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const quotes = await apiClient.getQuotes({
        status: params?.status,
        limit: params?.limit,
        offset: params?.offset,
      })
      setData(quotes)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quotes'))
    } finally {
      setIsLoading(false)
    }
  }, [params?.status, params?.limit, params?.offset, params?.enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch a single quote by ID
 */
export function useAPIQuote(id: string | null): UseAPISingleResult<Quote> {
  const [data, setData] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null)
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const quote = await apiClient.getQuote(id)
      setData(quote)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quote'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch jobs from the API with automatic transformation
 */
export function useAPIJobs(params?: {
  status?: string
  limit?: number
  offset?: number
  enabled?: boolean
}): UseAPIDataResult<Job> {
  const [data, setData] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (params?.enabled === false) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const jobs = await apiClient.getJobs({
        status: params?.status,
        limit: params?.limit,
        offset: params?.offset,
      })
      setData(jobs)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'))
    } finally {
      setIsLoading(false)
    }
  }, [params?.status, params?.limit, params?.offset, params?.enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch a single job by ID
 */
export function useAPIJob(id: string | null): UseAPISingleResult<Job> {
  const [data, setData] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null)
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const job = await apiClient.getJob(id)
      setData(job)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch job'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch customers from the API with automatic transformation
 */
export function useAPICustomers(params?: {
  search?: string
  limit?: number
  offset?: number
  enabled?: boolean
}): UseAPIDataResult<Customer> {
  const [data, setData] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (params?.enabled === false) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const customers = await apiClient.getCustomers({
        search: params?.search,
        limit: params?.limit,
        offset: params?.offset,
      })
      setData(customers)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'))
    } finally {
      setIsLoading(false)
    }
  }, [params?.search, params?.limit, params?.offset, params?.enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Fetch a single customer by ID
 */
export function useAPICustomer(id: string | null): UseAPISingleResult<Customer> {
  const [data, setData] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null)
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const customer = await apiClient.getCustomer(id)
      setData(customer)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// ============================================================================
// Hybrid Hook (API + Local KV)
// ============================================================================

/**
 * Hybrid data hook that fetches from API but allows local modifications
 * 
 * This is useful during the transition period where you want real API data
 * but also need to support local edits before they're synced back.
 */
export function useHybridData<T extends { id: string }>(
  apiFetch: () => Promise<T[]>,
  initialData: T[] = []
): {
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addItem: (item: T) => void
  updateItem: (id: string, updates: Partial<T>) => void
  removeItem: (id: string) => void
} {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apiData = await apiFetch()
      setData(apiData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
    } finally {
      setIsLoading(false)
    }
  }, [apiFetch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addItem = useCallback((item: T) => {
    setData(current => [...current, item])
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setData(current => 
      current.map(item => item.id === id ? { ...item, ...updates } : item)
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setData(current => current.filter(item => item.id !== id))
  }, [])

  return {
    data,
    setData,
    isLoading,
    error,
    refetch: fetchData,
    addItem,
    updateItem,
    removeItem,
  }
}
