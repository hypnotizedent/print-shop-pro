import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowClockwise,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
  Package,
  Warning,
} from '@phosphor-icons/react'
import { WebhookEvent, WebhookStatus, SupplierSource } from '@/lib/webhook-types'

interface WebhookEventViewerProps {
  events: WebhookEvent[]
  onRetryEvent: (eventId: string) => void
}

export function WebhookEventViewer({ events, onRetryEvent }: WebhookEventViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WebhookStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<SupplierSource | 'all'>('all')
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  const filteredEvents = events.filter((event) => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false
    if (sourceFilter !== 'all' && event.source !== sourceFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesId = event.id.toLowerCase().includes(query)
      const matchesSource = event.source.toLowerCase().includes(query)
      const matchesSku = event.payload.products.some(p => 
        p.sku.toLowerCase().includes(query) || 
        p.styleName.toLowerCase().includes(query)
      )
      if (!matchesId && !matchesSource && !matchesSku) return false
    }
    return true
  })

  const getStatusBadge = (status: WebhookStatus) => {
    const variants: Record<WebhookStatus, { variant: any; icon: any; label: string }> = {
      pending: { 
        variant: 'secondary', 
        icon: <Clock size={14} />, 
        label: 'Pending' 
      },
      processing: { 
        variant: 'secondary', 
        icon: <ArrowClockwise size={14} className="animate-spin" />, 
        label: 'Processing' 
      },
      completed: { 
        variant: 'default', 
        icon: <CheckCircle size={14} />, 
        label: 'Completed' 
      },
      failed: { 
        variant: 'destructive', 
        icon: <XCircle size={14} />, 
        label: 'Failed' 
      },
      retrying: { 
        variant: 'secondary', 
        icon: <ArrowClockwise size={14} />, 
        label: 'Retrying' 
      },
    }

    const { variant, icon, label } = variants[status]
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    )
  }

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Webhook Event Log</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage incoming webhook events
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlass 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Search by ID, SKU, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val as any)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="ssactivewear">SS Activewear</SelectItem>
            <SelectItem value="sanmar">SanMar</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px] rounded-lg border border-border">
        <div className="p-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Package size={32} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No events found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Webhook events will appear here when received'}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(event.id)}
                        className="px-1"
                      >
                        {expandedEventId === event.id ? (
                          <CaretDown size={16} />
                        ) : (
                          <CaretRight size={16} />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {event.id}
                          </code>
                          {getStatusBadge(event.status)}
                          <Badge variant="outline" className="capitalize">
                            {event.source}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {event.eventType.replace('.', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {event.payload.products.length} product update
                            {event.payload.products.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs">
                            Received: {new Date(event.receivedAt).toLocaleString()}
                          </p>
                          {event.processedAt && (
                            <p className="text-xs">
                              Processed: {new Date(event.processedAt).toLocaleString()}
                            </p>
                          )}
                          {event.retryCount > 0 && (
                            <p className="text-xs flex items-center gap-1 text-yellow-500">
                              <Warning size={12} />
                              Retry count: {event.retryCount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {event.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetryEvent(event.id)}
                      >
                        <ArrowClockwise size={14} className="mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>

                  {expandedEventId === event.id && (
                    <div className="pl-8 space-y-3">
                      {event.error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-sm font-medium text-destructive mb-1">Error:</p>
                          <p className="text-xs text-destructive/80">{event.error}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Product Updates:</p>
                        <div className="space-y-2">
                          {event.payload.products.map((product, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-muted/50 border border-border"
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <p className="font-medium text-sm">{product.styleName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    SKU: {product.sku} • Color: {product.colorName}
                                  </p>
                                </div>
                                {product.discontinued && (
                                  <Badge variant="destructive">Discontinued</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                {product.sizeUpdates.map((size, sizeIdx) => (
                                  <div
                                    key={sizeIdx}
                                    className="p-2 rounded bg-background border border-border"
                                  >
                                    <p className="text-xs font-medium">{size.sizeName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty: {size.currentQuantity}
                                      {size.previousQuantity !== undefined &&
                                        ` (${size.previousQuantity > size.currentQuantity ? '-' : '+'}${Math.abs(size.currentQuantity - size.previousQuantity)})`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {event.payload.batchId && (
                        <div className="text-xs text-muted-foreground">
                          Batch ID: <code className="bg-muted px-1 py-0.5 rounded">{event.payload.batchId}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredEvents.length} of {events.length} event
          {events.length !== 1 ? 's' : ''}
        </span>
        {events.length > 0 && (
          <span>
            Latest: {new Date(events[0]?.receivedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
