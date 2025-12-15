import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SizeInputRow } from './SizeInputRow'
import { ProductMockup } from './ProductMockup'
import { Trash } from '@phosphor-icons/react'
import type { LineItem, ProductType, DecorationType, Sizes } from '@/lib/types'
import { calculateSizesTotal, calculateLineItemTotal } from '@/lib/data'

interface LineItemGridProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export function LineItemGrid({ items, onChange }: LineItemGridProps) {
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
  
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-1 flex items-center justify-center pt-6">
              <ProductMockup 
                productType={item.product_type} 
                color={item.product_color || '#94a3b8'}
                size="small"
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Product Type
              </label>
              <Select 
                value={item.product_type} 
                onValueChange={(value: ProductType) => updateItem(index, { product_type: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tshirt">T-Shirt</SelectItem>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="polo">Polo</SelectItem>
                  <SelectItem value="hat">Hat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Product Name/Style
              </label>
              <Input
                value={item.product_name}
                onChange={(e) => updateItem(index, { product_name: e.target.value })}
                placeholder="e.g., Gildan G500"
                className="h-9"
              />
            </div>
            
            <div className="col-span-1">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Color
              </label>
              <Input
                type="color"
                value={item.product_color || '#94a3b8'}
                onChange={(e) => updateItem(index, { product_color: e.target.value })}
                className="h-9 p-1 cursor-pointer"
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Decoration
              </label>
              <Select 
                value={item.decoration} 
                onValueChange={(value: DecorationType) => updateItem(index, { decoration: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen-print">Screen Print</SelectItem>
                  <SelectItem value="dtg">DTG</SelectItem>
                  <SelectItem value="embroidery">Embroidery</SelectItem>
                  <SelectItem value="vinyl">Vinyl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Colors
              </label>
              <Input
                type="number"
                min="1"
                value={item.colors}
                onChange={(e) => updateItem(index, { colors: Number(e.target.value) })}
                className="h-9 tabular-nums"
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Unit Price
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.unit_price}
                onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                className="h-9 tabular-nums"
              />
            </div>
            
            <div className="col-span-1">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Setup
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.setup_fee}
                onChange={(e) => updateItem(index, { setup_fee: Number(e.target.value) })}
                className="h-9 tabular-nums"
              />
            </div>
            
            <div className="col-span-1 flex flex-col justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash size={18} />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Sizes
            </label>
            <SizeInputRow
              sizes={item.sizes}
              onChange={(sizes: Sizes) => updateItem(index, { sizes })}
            />
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="text-sm">
              <span className="text-muted-foreground">Quantity: </span>
              <span className="font-semibold tabular-nums">{item.quantity}</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-muted-foreground">Locations: </span>
              <Input
                value={item.print_locations.join(', ')}
                onChange={(e) => updateItem(index, { 
                  print_locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                })}
                placeholder="e.g., front, back"
                className="inline-flex w-48 h-7 text-sm"
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Line Total</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                ${item.line_total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
