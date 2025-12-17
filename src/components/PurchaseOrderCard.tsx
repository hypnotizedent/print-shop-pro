import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Package,
  CaretDown,
  Truck,
  CheckCircle,
  Clock,
  WarningCircle,
  FileText,
  Calendar,
} from '@phosphor-icons/react'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types'

interface PurchaseOrderCardProps {
  purchaseOrder: PurchaseOrder
  onReceiveInventory: () => void
  onUpdate: (po: PurchaseOrder) => void
}

const statusConfig: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: any }> = {
  draft: { label: 'Draft', variant: 'outline', icon: Clock },
  ordered: { label: 'Ordered', variant: 'secondary', icon: Truck },
  'partially-received': { label: 'Partially Received', variant: 'default', icon: Package },
  received: { label: 'Received', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: WarningCircle },
}

export function PurchaseOrderCard({
  purchaseOrder,
  onReceiveInventory,
  onUpdate,
}: PurchaseOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const config = statusConfig[purchaseOrder.status]
  const StatusIcon = config.icon

  const totalOrdered = purchaseOrder.lineItems.reduce((sum, item) => sum + item.quantityOrdered, 0)
  const totalReceived = purchaseOrder.lineItems.reduce((sum, item) => sum + item.quantityReceived, 0)
  const receiveProgress = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0

  const associatedOrdersCount = new Set(
    purchaseOrder.lineItems.flatMap(item => 
      item.associatedOrders.map(order => `${order.type}-${order.id}`)
    )
  ).size

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">PO #{purchaseOrder.poNumber}</h3>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon size={14} />
                  {config.label}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {purchaseOrder.supplier === 'ssactivewear' ? 'S&S Activewear' : 'SanMar'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Ordered: {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                </span>
                {purchaseOrder.expectedDeliveryDate && (
                  <span className="flex items-center gap-1">
                    <Truck size={16} />
                    Expected: {new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package size={16} />
                  {purchaseOrder.lineItems.length} product{purchaseOrder.lineItems.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={16} />
                  {associatedOrdersCount} order{associatedOrdersCount !== 1 ? 's' : ''}
                </span>
              </div>

              {purchaseOrder.status !== 'received' && purchaseOrder.status !== 'cancelled' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Receiving Progress</span>
                    <span className="font-medium">
                      {totalReceived} / {totalOrdered} units ({Math.round(receiveProgress)}%)
                    </span>
                  </div>
                  <Progress value={receiveProgress} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <div className="text-2xl font-bold">${purchaseOrder.total.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
              
              {purchaseOrder.status !== 'received' && purchaseOrder.status !== 'cancelled' && (
                <Button onClick={onReceiveInventory} size="sm" variant="default">
                  Receive
                </Button>
              )}
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <CaretDown 
                    size={18} 
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <Separator />
          <div className="p-4 bg-muted/30">
            <h4 className="font-semibold mb-3">Line Items</h4>
            <div className="space-y-3">
              {purchaseOrder.lineItems.map(item => {
                const itemProgress = item.quantityOrdered > 0 
                  ? (item.quantityReceived / item.quantityOrdered) * 100 
                  : 0
                
                const totalItemQty = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0)

                return (
                  <div key={item.id} className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{item.styleName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.brandName} • {item.colorName} • Style: {item.styleId}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.sizes).filter(([_, qty]) => qty > 0).map(([size, qty]) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}: {qty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.lineTotal.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.unitCost.toFixed(2)} × {totalItemQty}
                        </div>
                      </div>
                    </div>

                    {item.associatedOrders.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Associated Orders ({item.associatedOrders.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.associatedOrders.map((order, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs gap-1">
                              <FileText size={12} />
                              {order.type === 'quote' ? 'Quote' : 'Job'} {order.number} - {order.customerName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {purchaseOrder.status !== 'draft' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Received</span>
                          <span className="font-medium">
                            {item.quantityReceived} / {item.quantityOrdered} units
                          </span>
                        </div>
                        <Progress value={itemProgress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {purchaseOrder.notes && (
              <div className="mt-4 p-3 bg-card rounded-lg border border-border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                <div className="text-sm">{purchaseOrder.notes}</div>
              </div>
            )}

            {purchaseOrder.tracking && (
              <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Tracking</div>
                <div className="text-sm font-mono">{purchaseOrder.tracking}</div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
