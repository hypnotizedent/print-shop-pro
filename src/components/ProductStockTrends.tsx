import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendUp, TrendDown, Package, MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
import type { Quote, Job } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface ProductStockTrendsProps {
  quotes: Quote[]
  jobs: Job[]
}

interface ProductTrend {
  productName: string
  productColor: string
  totalOrdered: number
  avgOrderSize: number
  orderCount: number
  recentOrderCount: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  lastOrderDate: string
  sizes: {
    XS: number
    S: number
    M: number
    L: number
    XL: number
    '2XL': number
    '3XL': number
  }
}

export function ProductStockTrends({ quotes, jobs }: ProductStockTrendsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90' | '180'>('90')
  const [sortBy, setSortBy] = useState<'popularity' | 'trend' | 'recent'>('popularity')

  const productTrends = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
    const halfwayDate = new Date(cutoffDate.getTime() + (now.getTime() - cutoffDate.getTime()) / 2)

    const productMap = new Map<string, ProductTrend>()

    const allItems = [
      ...quotes
        .filter(q => q.status === 'approved')
        .flatMap(q => q.line_items.map(item => ({
          ...item,
          date: q.created_at
        }))),
      ...jobs.flatMap(j => {
        const relatedQuote = quotes.find(q => q.id === j.quote_id)
        const jobDate = relatedQuote?.created_at || new Date().toISOString()
        return j.line_items.map(item => ({
          ...item,
          date: jobDate
        }))
      })
    ]

    allItems.forEach(item => {
      const itemDate = new Date(item.date)
      if (itemDate < cutoffDate) return

      const key = `${item.product_name}|${item.product_color || 'N/A'}`
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          productName: item.product_name,
          productColor: item.product_color || 'N/A',
          totalOrdered: 0,
          avgOrderSize: 0,
          orderCount: 0,
          recentOrderCount: 0,
          trend: 'stable',
          trendPercent: 0,
          lastOrderDate: item.date,
          sizes: {
            XS: 0,
            S: 0,
            M: 0,
            L: 0,
            XL: 0,
            '2XL': 0,
            '3XL': 0,
          }
        })
      }

      const product = productMap.get(key)!
      product.totalOrdered += item.quantity
      product.orderCount += 1
      
      if (itemDate > halfwayDate) {
        product.recentOrderCount += 1
      }

      if (new Date(product.lastOrderDate) < itemDate) {
        product.lastOrderDate = item.date
      }

      Object.keys(item.sizes).forEach(size => {
        const sizeKey = size as keyof typeof product.sizes
        if (product.sizes[sizeKey] !== undefined) {
          product.sizes[sizeKey] += item.sizes[sizeKey]
        }
      })
    })

    const trends = Array.from(productMap.values()).map(product => {
      product.avgOrderSize = Math.round(product.totalOrdered / product.orderCount)
      
      const olderHalfCount = product.orderCount - product.recentOrderCount
      const percentChange = olderHalfCount > 0
        ? ((product.recentOrderCount - olderHalfCount) / olderHalfCount) * 100
        : product.recentOrderCount > 0 ? 100 : 0

      product.trendPercent = Math.abs(Math.round(percentChange))
      
      if (percentChange > 15) {
        product.trend = 'up'
      } else if (percentChange < -15) {
        product.trend = 'down'
      } else {
        product.trend = 'stable'
      }

      return product
    })

    let filtered = trends.filter(product => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        product.productName.toLowerCase().includes(query) ||
        product.productColor.toLowerCase().includes(query)
      )
    })

    if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.totalOrdered - a.totalOrdered)
    } else if (sortBy === 'trend') {
      filtered.sort((a, b) => {
        if (a.trend === b.trend) return b.trendPercent - a.trendPercent
        if (a.trend === 'up') return -1
        if (b.trend === 'up') return 1
        if (a.trend === 'stable') return -1
        return 1
      })
    } else {
      filtered.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())
    }

    return filtered
  }, [quotes, jobs, timeRange, searchQuery, sortBy])

  const topSizes = useMemo(() => {
    const sizeTotals = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      '2XL': 0,
      '3XL': 0,
    }

    productTrends.forEach(product => {
      Object.keys(product.sizes).forEach(size => {
        const sizeKey = size as keyof typeof sizeTotals
        sizeTotals[sizeKey] += product.sizes[sizeKey]
      })
    })

    return Object.entries(sizeTotals)
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count)
  }, [productTrends])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Product Stock Trends</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historical ordering patterns for popular products
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="trend">By Trend</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products or colors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package size={24} className="text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
          </div>
          <p className="text-3xl font-bold">{productTrends.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Unique product/color combos</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendUp size={24} className="text-green-500" />
            <p className="text-sm font-medium text-muted-foreground">Trending Up</p>
          </div>
          <p className="text-3xl font-bold">{productTrends.filter(p => p.trend === 'up').length}</p>
          <p className="text-sm text-muted-foreground mt-1">Increasing in popularity</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendDown size={24} className="text-red-500" />
            <p className="text-sm font-medium text-muted-foreground">Trending Down</p>
          </div>
          <p className="text-3xl font-bold">{productTrends.filter(p => p.trend === 'down').length}</p>
          <p className="text-sm text-muted-foreground mt-1">Decreasing in popularity</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Size Distribution</h3>
        <div className="space-y-3">
          {topSizes.map(({ size, count }) => {
            const maxCount = topSizes[0].count
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
            
            return (
              <div key={size} className="flex items-center gap-4">
                <span className="text-sm font-medium w-12">{size}</span>
                <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-primary/80 transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && (
                      <span className="text-sm font-semibold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="p-4 text-sm font-semibold">Product</th>
                <th className="p-4 text-sm font-semibold">Color</th>
                <th className="p-4 text-sm font-semibold text-right">Total Ordered</th>
                <th className="p-4 text-sm font-semibold text-right">Orders</th>
                <th className="p-4 text-sm font-semibold text-right">Avg Size</th>
                <th className="p-4 text-sm font-semibold text-center">Trend</th>
                <th className="p-4 text-sm font-semibold">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {productTrends.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No product data found for the selected time range
                  </td>
                </tr>
              ) : (
                productTrends.map((product, index) => (
                  <tr
                    key={`${product.productName}-${product.productColor}-${index}`}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium">{product.productName}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{product.productColor}</span>
                    </td>
                    <td className="p-4 text-right font-semibold">{product.totalOrdered}</td>
                    <td className="p-4 text-right text-muted-foreground">{product.orderCount}</td>
                    <td className="p-4 text-right text-muted-foreground">{product.avgOrderSize}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {product.trend === 'up' && (
                          <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30 gap-1">
                            <TrendUp size={14} weight="bold" />
                            {product.trendPercent}%
                          </Badge>
                        )}
                        {product.trend === 'down' && (
                          <Badge variant="default" className="bg-red-500/20 text-red-700 border-red-500/30 gap-1">
                            <TrendDown size={14} weight="bold" />
                            {product.trendPercent}%
                          </Badge>
                        )}
                        {product.trend === 'stable' && (
                          <Badge variant="outline" className="gap-1">
                            Stable
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(product.lastOrderDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
