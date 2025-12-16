import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Check, Package } from '@phosphor-icons/react'
import type { LineItem, Decoration } from '@/lib/types'
import { generateId } from '@/lib/data'
import { toast } from 'sonner'

interface BulkCopyDecorationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceLineItem: LineItem
  allLineItems: LineItem[]
  onCopy: (targetLineItemIds: string[], decorations: Decoration[]) => void
}

export function BulkCopyDecorationsDialog({
  open,
  onOpenChange,
  sourceLineItem,
  allLineItems,
  onCopy,
}: BulkCopyDecorationsDialogProps) {
  const [selectedLineItems, setSelectedLineItems] = useState<Set<string>>(new Set())

  const targetLineItems = allLineItems.filter(item => item.id !== sourceLineItem.id)
  const sourceDecorations = sourceLineItem.decorations || []

  const toggleLineItem = (itemId: string) => {
    setSelectedLineItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedLineItems(new Set(targetLineItems.map(item => item.id)))
  }

  const handleCopy = () => {
    if (selectedLineItems.size === 0) {
      toast.error('Please select at least one line item')
      return
    }

    if (sourceDecorations.length === 0) {
      toast.error('No decorations to copy from source line item')
      return
    }

    const decorationsCopy = sourceDecorations.map(decoration => ({
      ...decoration,
      id: generateId('dec'),
      artwork: decoration.artwork ? {
        ...decoration.artwork,
      } : undefined,
    }))

    onCopy(Array.from(selectedLineItems), decorationsCopy)
    setSelectedLineItems(new Set())
    onOpenChange(false)
    toast.success(`Copied decorations to ${selectedLineItems.size} line item${selectedLineItems.size !== 1 ? 's' : ''}`)
  }

  const getDecorationSummary = (): string => {
    return sourceDecorations.map(d => {
      const location = d.customLocation || d.location
      const method = d.customMethod || d.method
      return `${location} (${method})`
    }).join(', ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Copy Decorations to Other Line Items</DialogTitle>
          <DialogDescription>
            Copy decorations from {sourceLineItem.product_name} to other line items in this quote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-1">Decorations to copy ({sourceDecorations.length}):</div>
            <div className="text-xs text-muted-foreground">
              {sourceDecorations.length > 0 ? getDecorationSummary() : 'No decorations on this line item'}
            </div>
          </div>

          {targetLineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No other line items in this quote
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {targetLineItems.length} other line item{targetLineItems.length !== 1 ? 's' : ''} in this quote
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
              </div>

              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-2">
                  {targetLineItems.map(item => {
                    const isSelected = selectedLineItems.has(item.id)
                    const hasDecorations = item.decorations && item.decorations.length > 0
                    
                    return (
                      <Card
                        key={item.id}
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-secondary'
                        }`}
                        onClick={() => toggleLineItem(item.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleLineItem(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{item.product_name}</div>
                            {item.product_color && (
                              <div className="text-xs text-muted-foreground">{item.product_color}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.quantity} pcs
                            </div>
                            {hasDecorations && (
                              <div className="mt-2 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                <Copy size={12} />
                                Will replace {item.decorations!.length} existing decoration{item.decorations!.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="bg-primary text-primary-foreground rounded-full p-1">
                                <Check size={16} weight="bold" />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedLineItems.size} line item{selectedLineItems.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCopy} 
                disabled={selectedLineItems.size === 0 || sourceDecorations.length === 0}
              >
                <Copy size={16} className="mr-2" />
                Copy to Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
