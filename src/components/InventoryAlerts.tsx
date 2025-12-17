import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Warning, 
  XCircle, 
  CheckCircle,
  Package,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { InventoryAlert } from '@/lib/webhook-types'

interface InventoryAlertsProps {
  alerts: InventoryAlert[]
  onAcknowledge: (alertId: string) => void
  onDismissAll: () => void
}

export function InventoryAlerts({ alerts, onAcknowledge, onDismissAll }: InventoryAlertsProps) {
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'out_of_stock' | 'restocked'>('all')

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt)
  const acknowledgedAlerts = alerts.filter(a => a.acknowledgedAt)

  const filteredAlerts = unacknowledgedAlerts.filter(alert => {
    if (filterType === 'all') return true
    return alert.alertType === filterType
  })

  const getAlertIcon = (type: InventoryAlert['alertType']) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle size={20} weight="fill" className="text-destructive" />
      case 'low_stock':
        return <Warning size={20} weight="fill" className="text-yellow-500" />
      case 'restocked':
        return <CheckCircle size={20} weight="fill" className="text-primary" />
    }
  }

  const getAlertBadge = (type: InventoryAlert['alertType']) => {
    switch (type) {
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>
      case 'low_stock':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Low Stock</Badge>
      case 'restocked':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Restocked</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Alerts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {unacknowledgedAlerts.length} unacknowledged alert
            {unacknowledgedAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        {unacknowledgedAlerts.length > 0 && (
          <Button variant="outline" onClick={onDismissAll}>
            Dismiss All
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All ({unacknowledgedAlerts.length})
        </Button>
        <Button
          variant={filterType === 'out_of_stock' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('out_of_stock')}
        >
          Out of Stock ({unacknowledgedAlerts.filter(a => a.alertType === 'out_of_stock').length})
        </Button>
        <Button
          variant={filterType === 'low_stock' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('low_stock')}
        >
          Low Stock ({unacknowledgedAlerts.filter(a => a.alertType === 'low_stock').length})
        </Button>
        <Button
          variant={filterType === 'restocked' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('restocked')}
        >
          Restocked ({unacknowledgedAlerts.filter(a => a.alertType === 'restocked').length})
        </Button>
      </div>

      <div className="space-y-6">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Package size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterType !== 'all' 
                    ? `No ${filterType.replace('_', ' ')} alerts at the moment`
                    : 'All alerts have been acknowledged'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.styleName}</h3>
                            {getAlertBadge(alert.alertType)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">SKU:</span> {alert.sku}
                            </p>
                            <p>
                              <span className="font-medium">Color:</span> {alert.colorName} • 
                              <span className="font-medium"> Size:</span> {alert.sizeName}
                            </p>
                            <p>
                              <span className="font-medium">Current Quantity:</span> {alert.currentQuantity}
                              {alert.threshold && ` (Threshold: ${alert.threshold})`}
                            </p>
                            <p className="capitalize">
                              <span className="font-medium">Supplier:</span> {alert.supplier}
                            </p>
                            <p className="text-xs">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>

                      {(alert.affectedQuotes && alert.affectedQuotes.length > 0) && (
                        <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <p className="text-xs font-medium text-yellow-500 mb-1">
                            <Warning size={12} className="inline mr-1" />
                            Affects {alert.affectedQuotes.length} active quote
                            {alert.affectedQuotes.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}

                      {(alert.affectedJobs && alert.affectedJobs.length > 0) && (
                        <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-xs font-medium text-destructive mb-1">
                            <Warning size={12} className="inline mr-1" />
                            Affects {alert.affectedJobs.length} active job
                            {alert.affectedJobs.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {acknowledgedAlerts.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Acknowledged ({acknowledgedAlerts.length})
              </h3>
              <div className="space-y-2">
                {acknowledgedAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.alertType)}
                      <div className="text-sm">
                        <p className="font-medium">{alert.styleName}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.colorName} • {alert.sizeName} • SKU: {alert.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p>Acknowledged</p>
                      {alert.acknowledgedAt && (
                        <p>{new Date(alert.acknowledgedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {acknowledgedAlerts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  + {acknowledgedAlerts.length - 5} more acknowledged alerts
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
