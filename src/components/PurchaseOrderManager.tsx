import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Package, 
  MagnifyingGlass,
  FunnelSimple,
  Truck,
  CheckCircle,
  Clock,
  X,
  Download,
} from '@phosphor-icons/react'
import type { PurchaseOrder, Quote, Job } from '@/lib/types'
import { PurchaseOrderCard } from './PurchaseOrderCard'
import { CreatePurchaseOrderDialog } from './CreatePurchaseOrderDialog'
import { ReceiveInventoryDialog } from './ReceiveInventoryDialog'

interface PurchaseOrderManagerProps {
  purchaseOrders: PurchaseOrder[]
  quotes: Quote[]
  jobs: Job[]
  onCreatePurchaseOrder: (po: PurchaseOrder) => void
  onUpdatePurchaseOrder: (po: PurchaseOrder) => void
  onReceiveInventory: (po: PurchaseOrder) => void
}

export function PurchaseOrderManager({
  purchaseOrders,
  quotes,
  jobs,
  onCreatePurchaseOrder,
  onUpdatePurchaseOrder,
  onReceiveInventory,
}: PurchaseOrderManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled'>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)

  const approvedQuotes = quotes.filter(q => q.status === 'approved')
  const activeJobs = jobs.filter(j => j.status !== 'delivered')

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = searchQuery === '' || 
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.lineItems.some(item => 
        item.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.associatedOrders.some(order => 
          order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    ordered: purchaseOrders.filter(po => po.status === 'ordered').length,
    'partially-received': purchaseOrders.filter(po => po.status === 'partially-received').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
    cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length,
  }

  const handleReceiveInventory = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setReceiveDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage supplier orders and inventory receiving
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus size={18} weight="bold" />
            New Purchase Order
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search POs, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            <Clock size={16} className="mr-1" />
            Draft ({statusCounts.draft})
          </Button>
          <Button
            variant={statusFilter === 'ordered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ordered')}
          >
            <Truck size={16} className="mr-1" />
            Ordered ({statusCounts.ordered})
          </Button>
          <Button
            variant={statusFilter === 'partially-received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('partially-received')}
          >
            <Package size={16} className="mr-1" />
            Partially Received ({statusCounts['partially-received']})
          </Button>
          <Button
            variant={statusFilter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('received')}
          >
            <CheckCircle size={16} className="mr-1" />
            Received ({statusCounts.received})
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredPOs.length === 0 ? (
            <Card className="p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Create your first purchase order to get started'
                }
              </p>
              {searchQuery === '' && statusFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus size={18} weight="bold" />
                  Create Purchase Order
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPOs.map(po => (
                <PurchaseOrderCard
                  key={po.id}
                  purchaseOrder={po}
                  onReceiveInventory={() => handleReceiveInventory(po)}
                  onUpdate={onUpdatePurchaseOrder}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <CreatePurchaseOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        quotes={approvedQuotes}
        jobs={activeJobs}
        onCreatePurchaseOrder={onCreatePurchaseOrder}
      />

      {selectedPO && (
        <ReceiveInventoryDialog
          open={receiveDialogOpen}
          onOpenChange={setReceiveDialogOpen}
          purchaseOrder={selectedPO}
          onReceive={onReceiveInventory}
        />
      )}
    </div>
  )
}
