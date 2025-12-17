import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendUp,
  TrendDown,
  Package,
  Clock,
  CheckCircle,
  Warning,
  CurrencyDollar,
  ChartLine,
  Star,
  Truck,
  CalendarBlank,
} from '@phosphor-icons/react'
import type { PurchaseOrder, SupplierType } from '@/lib/types'
import { SupplierMetricsCard } from './SupplierMetricsCard'
import { SupplierPerformanceChart } from './SupplierPerformanceChart'
import { SupplierIssuesLog } from './SupplierIssuesLog'

interface SupplierPerformanceProps {
  purchaseOrders: PurchaseOrder[]
}

export function SupplierPerformance({ purchaseOrders }: SupplierPerformanceProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | 'all'>('all')
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180' | '365' | 'all'>('90')

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()
    
    if (timeRange !== 'all') {
      cutoffDate.setDate(now.getDate() - parseInt(timeRange))
    }

    return purchaseOrders.filter(po => {
      const orderDate = new Date(po.orderDate)
      const matchesSupplier = selectedSupplier === 'all' || po.supplier === selectedSupplier
      const matchesTimeRange = timeRange === 'all' || orderDate >= cutoffDate
      
      return matchesSupplier && matchesTimeRange && po.status !== 'cancelled' && po.status !== 'draft'
    })
  }, [purchaseOrders, selectedSupplier, timeRange])

  const metrics = useMemo(() => {
    const ssOrders = filteredOrders.filter(po => po.supplier === 'ssactivewear')
    const sanMarOrders = filteredOrders.filter(po => po.supplier === 'sanmar')

    const calculateMetrics = (orders: PurchaseOrder[]) => {
      const completedOrders = orders.filter(po => po.actualDeliveryDate)
      
      const deliveryTimes = completedOrders
        .filter(po => po.expectedDeliveryDate && po.actualDeliveryDate)
        .map(po => {
          const expected = new Date(po.expectedDeliveryDate!)
          const actual = new Date(po.actualDeliveryDate!)
          const ordered = new Date(po.orderDate)
          const deliveryDays = Math.floor((actual.getTime() - ordered.getTime()) / (1000 * 60 * 60 * 24))
          const expectedDays = Math.floor((expected.getTime() - ordered.getTime()) / (1000 * 60 * 60 * 24))
          return {
            deliveryDays,
            expectedDays,
            onTime: actual <= expected,
          }
        })

      const avgDeliveryTime = deliveryTimes.length > 0
        ? Math.round(deliveryTimes.reduce((sum, d) => sum + d.deliveryDays, 0) / deliveryTimes.length)
        : 0

      const onTimeRate = deliveryTimes.length > 0
        ? Math.round((deliveryTimes.filter(d => d.onTime).length / deliveryTimes.length) * 100)
        : 0

      const accuracyRatings = orders
        .filter(po => po.accuracyRating !== undefined)
        .map(po => po.accuracyRating!)

      const avgAccuracy = accuracyRatings.length > 0
        ? Math.round(accuracyRatings.reduce((sum, r) => sum + r, 0) / accuracyRatings.length)
        : 0

      const totalSpent = orders.reduce((sum, po) => sum + po.total, 0)
      const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0

      const allIssues = orders.flatMap(po => 
        (po.qualityIssues || []).map(issue => ({ poNumber: po.poNumber, issue, orderDate: po.orderDate }))
      )

      return {
        totalOrders: orders.length,
        avgDeliveryTime,
        onTimeRate,
        avgAccuracy,
        totalSpent,
        avgOrderValue,
        issueCount: allIssues.length,
        recentIssues: allIssues.slice(-5),
      }
    }

    return {
      ssactivewear: calculateMetrics(ssOrders),
      sanmar: calculateMetrics(sanMarOrders),
      combined: calculateMetrics(filteredOrders),
    }
  }, [filteredOrders])

  const currentMetrics = selectedSupplier === 'all' 
    ? metrics.combined 
    : metrics[selectedSupplier]

  const suppliers: Array<{ value: SupplierType | 'all'; label: string }> = [
    { value: 'all', label: 'All Suppliers' },
    { value: 'ssactivewear', label: 'S&S Activewear' },
    { value: 'sanmar', label: 'SanMar' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Supplier Performance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track delivery times, order accuracy, and cost trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedSupplier} onValueChange={(v) => setSelectedSupplier(v as any)} className="w-full">
          <TabsList>
            {suppliers.map(supplier => (
              <TabsTrigger key={supplier.value} value={supplier.value}>
                {supplier.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package size={20} className="text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentMetrics.totalOrders}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{currentMetrics.totalOrders}</p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Clock size={20} className="text-accent" />
                </div>
                <Badge 
                  variant={currentMetrics.avgDeliveryTime <= 5 ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {currentMetrics.avgDeliveryTime} days
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
                <p className="text-2xl font-bold">{currentMetrics.avgDeliveryTime} days</p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle size={20} className="text-primary" />
                </div>
                <Badge 
                  variant={currentMetrics.onTimeRate >= 90 ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {currentMetrics.onTimeRate}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold">{currentMetrics.onTimeRate}%</p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Star size={20} className="text-accent" />
                </div>
                <Badge 
                  variant={currentMetrics.avgAccuracy >= 95 ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {currentMetrics.avgAccuracy}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold">{currentMetrics.avgAccuracy}%</p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CurrencyDollar size={20} className="text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${currentMetrics.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <ChartLine size={20} className="text-accent" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  ${currentMetrics.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Warning size={20} className="text-destructive" />
                </div>
                <Badge 
                  variant={currentMetrics.issueCount === 0 ? 'default' : 'destructive'} 
                  className="text-xs"
                >
                  {currentMetrics.issueCount}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Quality Issues</p>
                <p className="text-2xl font-bold">{currentMetrics.issueCount}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SupplierPerformanceChart
              title="Delivery Time Trends"
              data={filteredOrders}
              supplier={selectedSupplier}
              metricType="delivery"
            />
            
            <SupplierPerformanceChart
              title="Cost Trends"
              data={filteredOrders}
              supplier={selectedSupplier}
              metricType="cost"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SupplierPerformanceChart
              title="Order Accuracy Trends"
              data={filteredOrders}
              supplier={selectedSupplier}
              metricType="accuracy"
            />

            <SupplierIssuesLog
              orders={filteredOrders}
              supplier={selectedSupplier}
            />
          </div>

          {selectedSupplier === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SupplierMetricsCard
                supplier="ssactivewear"
                metrics={metrics.ssactivewear}
                orders={filteredOrders.filter(po => po.supplier === 'ssactivewear')}
              />
              <SupplierMetricsCard
                supplier="sanmar"
                metrics={metrics.sanmar}
                orders={filteredOrders.filter(po => po.supplier === 'sanmar')}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
