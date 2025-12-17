import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Package,
  CheckCircle,
  WarningCircle,
  FileText,
  User,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { PurchaseOrder, PurchaseOrderLineItem, Sizes } from '@/lib/types'
import { generateId } from '@/lib/data'

interface ReceiveInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrder
  onReceive: (po: PurchaseOrder) => void
}

interface ReceivingItem {
  lineItemId: string
  sizes: Sizes
  assignedTo?: {
    type: 'quote' | 'job'
    id: string
    number: string
  }
}

export function ReceiveInventoryDialog({
  open,
  onOpenChange,
  purchaseOrder,
  onReceive,
}: ReceiveInventoryDialogProps) {
  const [receivingItems, setReceivingItems] = useState<ReceivingItem[]>([])
  const [receivedBy, setReceivedBy] = useState('')
  const [actualDeliveryDate, setActualDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    if (open) {
      const items: ReceivingItem[] = purchaseOrder.lineItems.map(item => ({
        lineItemId: item.id,
        sizes: {
          XS: 0,
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          '2XL': 0,
          '3XL': 0,
        },
      }))
      setReceivingItems(items)
    }
  }, [open, purchaseOrder])

  const handleSizeChange = (lineItemId: string, size: keyof Sizes, value: string) => {
    const qty = parseInt(value) || 0
    setReceivingItems(prev =>
      prev.map(item =>
        item.lineItemId === lineItemId
          ? { ...item, sizes: { ...item.sizes, [size]: qty } }
          : item
      )
    )
  }

  const handleAssignTo = (lineItemId: string, orderKey: string) => {
    if (orderKey === 'none') {
      setReceivingItems(prev =>
        prev.map(item =>
          item.lineItemId === lineItemId
            ? { ...item, assignedTo: undefined }
            : item
        )
      )
      return
    }

    const [type, id, number] = orderKey.split('|')
    setReceivingItems(prev =>
      prev.map(item =>
        item.lineItemId === lineItemId
          ? {
              ...item,
              assignedTo: {
                type: type as 'quote' | 'job',
                id,
                number,
              },
            }
          : item
      )
    )
  }

  const handleQuickFill = (lineItemId: string, orderId: string) => {
    const lineItem = purchaseOrder.lineItems.find(item => item.id === lineItemId)
    if (!lineItem) return

    const order = lineItem.associatedOrders.find(o => o.id === orderId)
    if (!order) return

    setReceivingItems(prev =>
      prev.map(item =>
        item.lineItemId === lineItemId
          ? {
              ...item,
              sizes: { ...order.sizes },
              assignedTo: {
                type: order.type,
                id: order.id,
                number: order.number,
              },
            }
          : item
      )
    )

    toast.success(`Filled quantities for ${order.number}`)
  }

  const handleReceiveAll = (lineItemId: string) => {
    const lineItem = purchaseOrder.lineItems.find(item => item.id === lineItemId)
    if (!lineItem) return

    const remaining: Sizes = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 }
    Object.keys(lineItem.sizes).forEach(size => {
      const sizeKey = size as keyof Sizes
      const ordered = lineItem.sizes[sizeKey]
      const received = lineItem.quantityReceived || 0
      remaining[sizeKey] = Math.max(0, ordered - (lineItem.receivedItems?.reduce(
        (sum, ri) => sum + (ri.sizes[sizeKey] || 0), 0
      ) || 0))
    })

    setReceivingItems(prev =>
      prev.map(item =>
        item.lineItemId === lineItemId
          ? { ...item, sizes: remaining }
          : item
      )
    )
  }

  const handleReceive = () => {
    if (!receivedBy.trim()) {
      toast.error('Please enter who received the inventory')
      return
    }

    const hasAnyQuantity = receivingItems.some(item =>
      Object.values(item.sizes).some(qty => qty > 0)
    )

    if (!hasAnyQuantity) {
      toast.error('Please enter at least one quantity to receive')
      return
    }

    const updatedLineItems = purchaseOrder.lineItems.map(lineItem => {
      const receivingItem = receivingItems.find(ri => ri.lineItemId === lineItem.id)
      if (!receivingItem) return lineItem

      const receivingQty = Object.values(receivingItem.sizes).reduce((sum, qty) => sum + qty, 0)
      if (receivingQty === 0) return lineItem

      const newReceivedItem = {
        id: generateId('ri'),
        sizes: receivingItem.sizes,
        receivedDate: actualDeliveryDate,
        receivedBy,
        assignedTo: receivingItem.assignedTo,
      }

      return {
        ...lineItem,
        quantityReceived: lineItem.quantityReceived + receivingQty,
        receivedItems: [...(lineItem.receivedItems || []), newReceivedItem],
      }
    })

    const totalOrdered = purchaseOrder.lineItems.reduce((sum, item) => sum + item.quantityOrdered, 0)
    const totalReceived = updatedLineItems.reduce((sum, item) => sum + item.quantityReceived, 0)

    const newStatus = totalReceived >= totalOrdered 
      ? 'received' as const
      : totalReceived > 0 
        ? 'partially-received' as const
        : purchaseOrder.status

    const updatedPO: PurchaseOrder = {
      ...purchaseOrder,
      lineItems: updatedLineItems,
      status: newStatus,
      actualDeliveryDate,
      receivedBy,
      updatedAt: new Date().toISOString(),
    }

    onReceive(updatedPO)
    toast.success(`Inventory received for PO ${purchaseOrder.poNumber}`)
    onOpenChange(false)
  }

  const getTotalReceiving = () => {
    return receivingItems.reduce((sum, item) => 
      sum + Object.values(item.sizes).reduce((s, qty) => s + qty, 0), 0
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={24} />
            Receive Inventory - PO #{purchaseOrder.poNumber}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <WarningCircle className="h-4 w-4" />
          <AlertDescription>
            Enter the quantities received for each product and assign them to specific orders.
            This helps the team know which garments belong to which customer order.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="received-by">Received By *</Label>
            <Input
              id="received-by"
              placeholder="Your name"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="delivery-date">Delivery Date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={actualDeliveryDate}
              onChange={(e) => setActualDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 max-h-96">
          <div className="space-y-6 pr-4">
            {purchaseOrder.lineItems.map(lineItem => {
              const receivingItem = receivingItems.find(ri => ri.lineItemId === lineItem.id)
              if (!receivingItem) return null

              const remainingToReceive = Object.keys(lineItem.sizes).reduce((acc, size) => {
                const sizeKey = size as keyof Sizes
                const ordered = lineItem.sizes[sizeKey]
                const alreadyReceived = (lineItem.receivedItems || []).reduce(
                  (sum, ri) => sum + (ri.sizes[sizeKey] || 0), 0
                )
                acc[sizeKey] = Math.max(0, ordered - alreadyReceived)
                return acc
              }, {} as Sizes)

              const totalRemaining = Object.values(remainingToReceive).reduce((sum, qty) => sum + qty, 0)
              const currentlyReceiving = Object.values(receivingItem.sizes).reduce((sum, qty) => sum + qty, 0)

              return (
                <div key={lineItem.id} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="font-semibold">{lineItem.styleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {lineItem.brandName} • {lineItem.colorName} • {lineItem.styleId}
                      </div>
                      {totalRemaining > 0 && (
                        <Badge variant="outline" className="mt-2">
                          {totalRemaining} units remaining to receive
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReceiveAll(lineItem.id)}
                      disabled={totalRemaining === 0}
                    >
                      Fill All Remaining
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map(size => {
                      const ordered = lineItem.sizes[size]
                      const alreadyReceived = (lineItem.receivedItems || []).reduce(
                        (sum, ri) => sum + (ri.sizes[size] || 0), 0
                      )
                      const remaining = Math.max(0, ordered - alreadyReceived)

                      return (
                        <div key={size}>
                          <Label className="text-xs">{size}</Label>
                          <Input
                            type="number"
                            min="0"
                            max={remaining}
                            value={receivingItem.sizes[size] || ''}
                            onChange={(e) => handleSizeChange(lineItem.id, size, e.target.value)}
                            className="text-center"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground text-center mt-1">
                            / {remaining}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {lineItem.associatedOrders.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Quick Fill from Order:</Label>
                      <div className="flex flex-wrap gap-2">
                        {lineItem.associatedOrders.map((order, idx) => {
                          const orderQty = Object.values(order.sizes).reduce((sum, qty) => sum + qty, 0)
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickFill(lineItem.id, order.id)}
                              className="text-xs gap-1"
                            >
                              <FileText size={12} />
                              {order.type === 'quote' ? 'Quote' : 'Job'} {order.number} ({orderQty} units)
                            </Button>
                          )
                        })}
                      </div>

                      {currentlyReceiving > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs mb-2 block">Assign to Order (Optional):</Label>
                          <Select
                            value={
                              receivingItem.assignedTo
                                ? `${receivingItem.assignedTo.type}|${receivingItem.assignedTo.id}|${receivingItem.assignedTo.number}`
                                : 'none'
                            }
                            onValueChange={(value) => handleAssignTo(lineItem.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Unassigned</SelectItem>
                              {lineItem.associatedOrders.map((order, idx) => (
                                <SelectItem
                                  key={idx}
                                  value={`${order.type}|${order.id}|${order.number}`}
                                >
                                  {order.type === 'quote' ? 'Quote' : 'Job'} {order.number} - {order.customerName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package size={16} />
            <span>Total Receiving: <strong>{getTotalReceiving()} units</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleReceive} disabled={getTotalReceiving() === 0 || !receivedBy.trim()}>
              <CheckCircle size={18} className="mr-2" />
              Receive Inventory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
