import { useState, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Trash,
  Package,
  FileText,
  ShoppingCart,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { PurchaseOrder, PurchaseOrderLineItem, Quote, Job, SupplierType, Sizes } from '@/lib/types'
import { generateId } from '@/lib/data'

interface CreatePurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotes: Quote[]
  jobs: Job[]
  onCreatePurchaseOrder: (po: PurchaseOrder) => void
}

interface SelectedOrder {
  type: 'quote' | 'job'
  id: string
  number: string
  customerName: string
  lineItems: any[]
}

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  quotes,
  jobs,
  onCreatePurchaseOrder,
}: CreatePurchaseOrderDialogProps) {
  const [supplier, setSupplier] = useState<SupplierType>('ssactivewear')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [tracking, setTracking] = useState('')
  const [shipping, setShipping] = useState('0')
  const [tax, setTax] = useState('0')

  const allOrders: SelectedOrder[] = useMemo(() => {
    return [
      ...quotes.map(q => ({
        type: 'quote' as const,
        id: q.id,
        number: q.quote_number,
        customerName: q.customer.name,
        lineItems: q.line_items,
      })),
      ...jobs.map(j => ({
        type: 'job' as const,
        id: j.id,
        number: j.job_number,
        customerName: j.customer.name,
        lineItems: j.line_items,
      })),
    ]
  }, [quotes, jobs])

  const consolidatedLineItems = useMemo(() => {
    const itemsMap = new Map<string, PurchaseOrderLineItem>()

    selectedOrders.forEach(orderKey => {
      const [type, id] = orderKey.split('-')
      const order = allOrders.find(o => o.type === type && o.id === id)
      
      if (!order) return

      order.lineItems.forEach(lineItem => {
        const key = `${lineItem.product_name}-${lineItem.product_color}`
        
        if (itemsMap.has(key)) {
          const existingItem = itemsMap.get(key)!
          
          Object.keys(lineItem.sizes).forEach(size => {
            existingItem.sizes[size as keyof Sizes] += lineItem.sizes[size as keyof Sizes]
          })
          existingItem.quantityOrdered += lineItem.quantity
          existingItem.lineTotal = existingItem.quantityOrdered * existingItem.unitCost
          
          existingItem.associatedOrders.push({
            type: order.type,
            id: order.id,
            number: order.number,
            customerName: order.customerName,
            sizes: { ...lineItem.sizes },
          })
        } else {
          itemsMap.set(key, {
            id: generateId('poli'),
            supplier: supplier,
            styleId: lineItem.product_name.split(' ')[0] || 'UNKNOWN',
            styleName: lineItem.product_name,
            brandName: lineItem.product_type.toUpperCase(),
            colorName: lineItem.product_color || 'Unknown',
            colorCode: '',
            sizes: { ...lineItem.sizes },
            quantityOrdered: lineItem.quantity,
            quantityReceived: 0,
            unitCost: lineItem.unit_price || 0,
            lineTotal: lineItem.quantity * (lineItem.unit_price || 0),
            associatedOrders: [{
              type: order.type,
              id: order.id,
              number: order.number,
              customerName: order.customerName,
              sizes: { ...lineItem.sizes },
            }],
          })
        }
      })
    })

    return Array.from(itemsMap.values())
  }, [selectedOrders, allOrders, supplier])

  const subtotal = consolidatedLineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const shippingAmount = parseFloat(shipping) || 0
  const taxAmount = parseFloat(tax) || 0
  const total = subtotal + shippingAmount + taxAmount

  const handleToggleOrder = (order: SelectedOrder) => {
    const key = `${order.type}-${order.id}`
    const newSet = new Set(selectedOrders)
    
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    
    setSelectedOrders(newSet)
  }

  const handleCreate = () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one quote or job')
      return
    }

    const poNumber = `PO-${Date.now().toString().slice(-8)}`
    
    const purchaseOrder: PurchaseOrder = {
      id: generateId('po'),
      poNumber,
      supplier,
      status: 'draft',
      orderDate,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      lineItems: consolidatedLineItems,
      subtotal,
      shipping: shippingAmount,
      tax: taxAmount,
      total,
      notes: notes || undefined,
      tracking: tracking || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onCreatePurchaseOrder(purchaseOrder)
    toast.success(`Purchase Order ${poNumber} created`)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setSupplier('ssactivewear')
    setSelectedOrders(new Set())
    setOrderDate(new Date().toISOString().split('T')[0])
    setExpectedDeliveryDate('')
    setNotes('')
    setTracking('')
    setShipping('0')
    setTax('0')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart size={24} />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplier} onValueChange={(value: SupplierType) => setSupplier(value)}>
              <SelectTrigger id="supplier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssactivewear">S&S Activewear</SelectItem>
                <SelectItem value="sanmar">SanMar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="order-date">Order Date</Label>
            <Input
              id="order-date"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expected-delivery">Expected Delivery (Optional)</Label>
            <Input
              id="expected-delivery"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tracking">Tracking # (Optional)</Label>
            <Input
              id="tracking"
              placeholder="Tracking number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-2" />

        <div>
          <Label className="mb-2 block">Select Quotes/Jobs to Include</Label>
          <ScrollArea className="h-64 rounded-lg border border-border p-3">
            {allOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No approved quotes or active jobs found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allOrders.map(order => {
                  const key = `${order.type}-${order.id}`
                  const isSelected = selectedOrders.has(key)
                  
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleToggleOrder(order)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => handleToggleOrder(order)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={order.type === 'quote' ? 'secondary' : 'default'} className="gap-1">
                            <FileText size={12} />
                            {order.type === 'quote' ? 'Quote' : 'Job'} {order.number}
                          </Badge>
                          <span className="text-sm font-medium">{order.customerName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''} • {
                            order.lineItems.reduce((sum, item) => sum + item.quantity, 0)
                          } units
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {consolidatedLineItems.length > 0 && (
          <>
            <Separator />
            <div>
              <Label className="mb-2 block">Consolidated Order Summary</Label>
              <ScrollArea className="h-48 rounded-lg border border-border p-3 bg-muted/30">
                <div className="space-y-2">
                  {consolidatedLineItems.map(item => {
                    const totalQty = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0)
                    
                    return (
                      <div key={item.id} className="bg-card p-3 rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.styleName}</div>
                            <div className="text-xs text-muted-foreground">{item.colorName}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.sizes).filter(([_, qty]) => qty > 0).map(([size, qty]) => (
                                <Badge key={size} variant="outline" className="text-xs">
                                  {size}: {qty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">${item.lineTotal.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{totalQty} units</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          For {item.associatedOrders.length} order{item.associatedOrders.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="shipping">Shipping</Label>
            <Input
              id="shipping"
              type="number"
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="tax">Tax</Label>
            <Input
              id="tax"
              type="number"
              step="0.01"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">${total.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={selectedOrders.size === 0}>
            Create Purchase Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
