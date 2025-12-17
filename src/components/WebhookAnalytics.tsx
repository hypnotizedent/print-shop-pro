import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartBar,
  CheckCircle,
  XCircle,
  Clock,
  Lightning,
  TrendUp,
  TrendDown,
  Warning,
  Package,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { WebhookEvent, SupplierSource } from '@/lib/webhook-types'
import { formatDistanceToNow } from 'date-fns'

interface WebhookAnalyticsProps {
  events: WebhookEvent[]
}

interface SupplierMetrics {
  supplier: SupplierSource
  totalEvents: number
  successful: number
  failed: number
  retrying: number
  successRate: number
  avgResponseTime: number
  recentFailures: number
  uptime: number
  lastEventAt?: string
}

interface TimeRange {
  label: string
  hours: number
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Last Hour', hours: 1 },
  { label: 'Last 24 Hours', hours: 24 },
  { label: 'Last 7 Days', hours: 168 },
  { label: 'Last 30 Days', hours: 720 },
  { label: 'All Time', hours: Infinity },
]

export function WebhookAnalytics({ events }: WebhookAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<number>(24)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSource | 'all'>('all')

  const filteredEvents = useMemo(() => {
    const now = Date.now()
    const cutoff = now - (timeRange * 60 * 60 * 1000)
    
    return events.filter(event => {
      const eventTime = new Date(event.receivedAt).getTime()
      const inTimeRange = timeRange === Infinity || eventTime >= cutoff
      const matchesSupplier = selectedSupplier === 'all' || event.source === selectedSupplier
      return inTimeRange && matchesSupplier
    })
  }, [events, timeRange, selectedSupplier])

  const supplierMetrics = useMemo(() => {
    const metricsBySupplier = new Map<SupplierSource, SupplierMetrics>()
    
    const suppliers: SupplierSource[] = ['ssactivewear', 'sanmar', 'manual']
    
    suppliers.forEach(supplier => {
      const supplierEvents = filteredEvents.filter(e => e.source === supplier)
      
      const successful = supplierEvents.filter(e => e.status === 'completed').length
      const failed = supplierEvents.filter(e => e.status === 'failed').length
      const retrying = supplierEvents.filter(e => e.status === 'retrying').length
      const total = supplierEvents.length
      
      const successRate = total > 0 ? (successful / total) * 100 : 0
      
      const responseTimes = supplierEvents
        .filter(e => e.processedAt && e.receivedAt)
        .map(e => {
          const received = new Date(e.receivedAt).getTime()
          const processed = new Date(e.processedAt!).getTime()
          return processed - received
        })
      
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0
      
      const last24Hours = supplierEvents.filter(e => {
        const eventTime = new Date(e.receivedAt).getTime()
        return eventTime >= Date.now() - (24 * 60 * 60 * 1000)
      })
      const recentFailures = last24Hours.filter(e => e.status === 'failed').length
      
      const uptime = total > 0 ? ((successful + retrying) / total) * 100 : 100
      
      const sortedEvents = [...supplierEvents].sort((a, b) => 
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      )
      const lastEventAt = sortedEvents[0]?.receivedAt
      
      metricsBySupplier.set(supplier, {
        supplier,
        totalEvents: total,
        successful,
        failed,
        retrying,
        successRate,
        avgResponseTime,
        recentFailures,
        uptime,
        lastEventAt,
      })
    })
    
    return Array.from(metricsBySupplier.values())
  }, [filteredEvents])

  const overallMetrics = useMemo(() => {
    const total = filteredEvents.length
    const successful = filteredEvents.filter(e => e.status === 'completed').length
    const failed = filteredEvents.filter(e => e.status === 'failed').length
    const retrying = filteredEvents.filter(e => e.status === 'retrying').length
    
    const successRate = total > 0 ? (successful / total) * 100 : 0
    
    const responseTimes = filteredEvents
      .filter(e => e.processedAt && e.receivedAt)
      .map(e => {
        const received = new Date(e.receivedAt).getTime()
        const processed = new Date(e.processedAt!).getTime()
        return processed - received
      })
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0
    
    return {
      total,
      successful,
      failed,
      retrying,
      successRate,
      avgResponseTime,
    }
  }, [filteredEvents])

  const eventTypeBreakdown = useMemo(() => {
    const breakdown = new Map<string, number>()
    
    filteredEvents.forEach(event => {
      const count = breakdown.get(event.eventType) || 0
      breakdown.set(event.eventType, count + 1)
    })
    
    return Array.from(breakdown.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredEvents])

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getSupplierName = (supplier: SupplierSource): string => {
    switch (supplier) {
      case 'ssactivewear': return 'S&S Activewear'
      case 'sanmar': return 'SanMar'
      case 'manual': return 'Manual'
      default: return supplier
    }
  }

  const getSupplierColor = (supplier: SupplierSource): string => {
    switch (supplier) {
      case 'ssactivewear': return 'text-chart-1'
      case 'sanmar': return 'text-chart-2'
      case 'manual': return 'text-chart-3'
      default: return 'text-foreground'
    }
  }

  const getReliabilityBadge = (rate: number) => {
    if (rate >= 99) return <Badge className="bg-primary/20 text-primary border-primary/30">Excellent</Badge>
    if (rate >= 95) return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Good</Badge>
    if (rate >= 90) return <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30">Fair</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Webhook Analytics</h2>
          <p className="text-sm text-muted-foreground">Reliability metrics and performance tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedSupplier}
            onValueChange={(value) => setSelectedSupplier(value as SupplierSource | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="ssactivewear">S&S Activewear</SelectItem>
              <SelectItem value="sanmar">SanMar</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={timeRange.toString()}
            onValueChange={(value) => setTimeRange(Number(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.label} value={range.hours.toString()}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <p className="text-3xl font-bold mt-2">{overallMetrics.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Lightning size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold mt-2">{overallMetrics.successRate.toFixed(1)}%</p>
              <div className="flex items-center gap-2 mt-2">
                {overallMetrics.successRate >= 95 ? (
                  <TrendUp size={16} className="text-primary" />
                ) : (
                  <TrendDown size={16} className="text-destructive" />
                )}
                <span className="text-xs text-muted-foreground">
                  {overallMetrics.successful} / {overallMetrics.total}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <CheckCircle size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
              <p className="text-3xl font-bold mt-2">
                {formatResponseTime(overallMetrics.avgResponseTime)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-chart-2/10">
              <Clock size={24} className="text-chart-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed Events</p>
              <p className="text-3xl font-bold mt-2">{overallMetrics.failed}</p>
              {overallMetrics.retrying > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <ArrowsClockwise size={16} className="text-chart-5" />
                  <span className="text-xs text-muted-foreground">
                    {overallMetrics.retrying} retrying
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <XCircle size={24} className="text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppliers">Supplier Metrics</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {supplierMetrics.map(metrics => (
              <Card key={metrics.supplier} className="p-6 border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Package size={20} className={getSupplierColor(metrics.supplier)} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{getSupplierName(metrics.supplier)}</h3>
                      {metrics.lastEventAt && (
                        <p className="text-xs text-muted-foreground">
                          Last event {formatDistanceToNow(new Date(metrics.lastEventAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  {getReliabilityBadge(metrics.successRate)}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Events</span>
                    <span className="text-sm font-semibold">{metrics.totalEvents}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-semibold">{metrics.successRate.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${metrics.successRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Response</span>
                    <span className="text-sm font-semibold">
                      {formatResponseTime(metrics.avgResponseTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-semibold">{metrics.uptime.toFixed(2)}%</span>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-primary" />
                        <span className="text-muted-foreground">Successful</span>
                      </div>
                      <span className="font-medium">{metrics.successful}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-destructive" />
                        <span className="text-muted-foreground">Failed</span>
                      </div>
                      <span className="font-medium">{metrics.failed}</span>
                    </div>

                    {metrics.retrying > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ArrowsClockwise size={14} className="text-chart-5" />
                          <span className="text-muted-foreground">Retrying</span>
                        </div>
                        <span className="font-medium">{metrics.retrying}</span>
                      </div>
                    )}

                    {metrics.recentFailures > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Warning size={14} className="text-chart-5" />
                          <span className="text-muted-foreground">Recent Failures (24h)</span>
                        </div>
                        <span className="font-medium">{metrics.recentFailures}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="p-6 border-border bg-card">
            <h3 className="font-semibold mb-4">Event Type Distribution</h3>
            
            {eventTypeBreakdown.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ChartBar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No events in selected time range</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventTypeBreakdown.map(({ type, count }) => {
                  const percentage = (count / overallMetrics.total) * 100
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {type.replace(/\./g, ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
