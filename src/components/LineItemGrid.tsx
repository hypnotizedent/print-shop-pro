import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductMockupWithSize } from './ProductMockupWithSize'
import { DecorationManager } from './DecorationManager'
import { Trash, CaretDown, CaretRight } from '@phosphor-icons/react'
import type { LineItem, Sizes, Decoration } from '@/lib/types'
import { calculateSizesTotal, calculateLineItemTotal } from '@/lib/data'
import { useState } from 'react'

interface LineItemGridProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export function LineItemGrid({ items, onChange }: LineItemGridProps) {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    const newItems = [...items]
    const item = { ...newItems[index], ...updates }
    
    if (updates.sizes) {
      item.quantity = calculateSizesTotal(updates.sizes)
    }
    
    item.line_total = calculateLineItemTotal(item)
    
    newItems[index] = item
    onChange(newItems)
  }
  
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const toggleLocationsSection = (itemId: string) => {
    setExpandedLocations(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleDecorationsChange = (index: number, decorations: Decoration[]) => {
    updateItem(index, { decorations })
  }

  const handleSizeChange = (index: number, size: keyof Sizes, value: number) => {
    const item = items[index]
    const newSizes = { ...item.sizes, [size]: value }
    updateItem(index, { sizes: newSizes })
  }

  const getTotalDecorations = (item: LineItem): number => {
    return (item.decorations || []).length
  }

  const getTotalSetupFees = (item: LineItem): number => {
    return (item.decorations || []).reduce((sum, dec) => sum + dec.setupFee, 0)
  }
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[30%]">
              PRODUCT STYLE
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[12%]">
              COLOR
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[35%]">
              SIZES
            </th>
            <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2 w-[15%]">
              PRICE
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2 w-[8%]">
              PREVIEW
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <>
              <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2.5">
                  <Input
                    value={item.product_name}
                    onChange={(e) => updateItem(index, { product_name: e.target.value })}
                    placeholder="e.g., Gildan G500"
                    className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Input
                    value={item.product_color || ''}
                    onChange={(e) => updateItem(index, { product_color: e.target.value })}
                    placeholder="e.g., Navy"
                    className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1.5 items-center">
                    {(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map((size) => (
                      <div key={size} className="flex flex-col items-center flex-1 min-w-0">
                        <label className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                          {size}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={item.sizes[size]}
                          onChange={(e) => handleSizeChange(index, size, Number(e.target.value))}
                          className="h-7 w-full text-center text-xs tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                        />
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-muted-foreground text-xs">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                      className="h-8 w-20 text-right tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-2"
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center">
                    <ProductMockupWithSize 
                      productType={item.product_type} 
                      color={item.product_color || '#94a3b8'}
                      decorations={item.decorations}
                      size="small"
                    />
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash size={14} />
                  </Button>
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/10">
                <td colSpan={6} className="px-3 py-0">
                  <div className="py-2">
                    <button
                      onClick={() => toggleLocationsSection(item.id)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      {expandedLocations.has(item.id) ? (
                        <CaretDown size={14} weight="bold" />
                      ) : (
                        <CaretRight size={14} weight="bold" />
                      )}
                      <span className="font-medium">
                        Locations & Decoration
                      </span>
                      <span className="text-xs">
                        ({getTotalDecorations(item)} decoration{getTotalDecorations(item) !== 1 ? 's' : ''})
                      </span>
                      {getTotalSetupFees(item) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          • Setup: ${getTotalSetupFees(item).toFixed(2)}
                        </span>
                      )}
                      <div className="ml-auto text-xs font-bold text-emerald-400 tabular-nums">
                        Total: ${item.line_total.toFixed(2)} ({item.quantity} pcs)
                      </div>
                    </button>
                    
                    {expandedLocations.has(item.id) && (
                      <div className="mt-3 pb-3">
                        <DecorationManager
                          decorations={item.decorations || []}
                          onChange={(decorations) => handleDecorationsChange(index, decorations)}
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
      
      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No line items yet. Click "Add Line Item" to get started.
        </div>
      )}
    </div>
  )
}
