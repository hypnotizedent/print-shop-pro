import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendUp,
  TrendDown,
  Package,
  Clock,
  CheckCircle,
  Star,
  CurrencyDollar,
  Warning,
} from '@phosphor-icons/react'
import type { PurchaseOrder, SupplierType } from '@/lib/types'

interface SupplierMetricsCardProps {
  supplier: SupplierType
  metrics: {
    totalOrders: number
    avgDeliveryTime: number
    onTimeRate: number
    avgAccuracy: number
    totalSpent: number
    avgOrderValue: number
    issueCount: number
  }
  orders: PurchaseOrder[]
}

export function SupplierMetricsCard({ supplier, metrics, orders }: SupplierMetricsCardProps) {
  const supplierName = supplier === 'ssactivewear' ? 'S&S Activewear' : 'SanMar'

  const getPerformanceRating = () => {
    const deliveryScore = metrics.onTimeRate
    const accuracyScore = metrics.avgAccuracy
    const issueScore = Math.max(0, 100 - (metrics.issueCount * 10))
    
    return Math.round((deliveryScore + accuracyScore + issueScore) / 3)
  }

  const performanceRating = getPerformanceRating()

  const getRatingBadge = (rating: number) => {
    if (rating >= 90) return { variant: 'default' as const, label: 'Excellent' }
    if (rating >= 75) return { variant: 'secondary' as const, label: 'Good' }
    if (rating >= 60) return { variant: 'secondary' as const, label: 'Fair' }
    return { variant: 'destructive' as const, label: 'Needs Improvement' }
  }

  const ratingBadge = getRatingBadge(performanceRating)

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{supplierName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Performance Overview
          </p>
        </div>
        <Badge variant={ratingBadge.variant}>
          {ratingBadge.label}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Rating</span>
            <span className="font-semibold">{performanceRating}/100</span>
          </div>
          <Progress value={performanceRating} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <p className="text-xl font-bold">{metrics.totalOrders}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Avg Delivery</p>
            </div>
            <p className="text-xl font-bold">{metrics.avgDeliveryTime}d</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">On-Time</p>
            </div>
            <p className="text-xl font-bold">{metrics.onTimeRate}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <p className="text-xl font-bold">{metrics.avgAccuracy}%</p>
          </div>

          <div className="space-y-1 col-span-2">
            <div className="flex items-center gap-2">
              <CurrencyDollar size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <p className="text-xl font-bold">
              ${metrics.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {metrics.issueCount > 0 && (
            <div className="space-y-1 col-span-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Warning size={16} className="text-destructive" />
                <p className="text-xs text-muted-foreground">Quality Issues</p>
              </div>
              <p className="text-xl font-bold text-destructive">{metrics.issueCount}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
