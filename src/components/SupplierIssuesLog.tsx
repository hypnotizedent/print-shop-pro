import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import type { PurchaseOrder, SupplierType } from '@/lib/types'

interface SupplierIssuesLogProps {
  orders: PurchaseOrder[]
  supplier: SupplierType | 'all'
}

export function SupplierIssuesLog({ orders, supplier }: SupplierIssuesLogProps) {
  const issues = orders
    .filter(po => po.qualityIssues && po.qualityIssues.length > 0)
    .flatMap(po => 
      (po.qualityIssues || []).map(issue => ({
        poNumber: po.poNumber,
        supplier: po.supplier,
        issue,
        orderDate: po.orderDate,
      }))
    )
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 10)

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Issues</h3>
        <Badge variant={issues.length === 0 ? 'default' : 'secondary'}>
          {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <p className="text-sm font-medium">No issues reported</p>
          <p className="text-xs text-muted-foreground mt-1">
            All orders have been accurate and complete
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {issues.map((item, index) => {
              const supplierName = item.supplier === 'ssactivewear' ? 'S&S' : 'SanMar'
              
              return (
                <div 
                  key={index}
                  className="p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-destructive/10 flex-shrink-0">
                      <Warning size={16} className="text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">PO {item.poNumber}</p>
                        <Badge variant="secondary" className="text-xs">
                          {supplierName}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(item.orderDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm">{item.issue}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}
