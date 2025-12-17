import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { DiscountType } from '@/lib/types'

interface PricingSummaryProps {
  subtotal: number
  discount: number
  discountType: DiscountType
  taxRate?: number
  taxAmount?: number
  taxExempt?: boolean
  total: number
  onDiscountChange: (value: number) => void
  onDiscountTypeChange: (type: DiscountType) => void
  onTaxRateChange?: (value: number) => void
  onTaxExemptChange?: (value: boolean) => void
}

export function PricingSummary({
  subtotal,
  discount,
  discountType,
  taxRate = 0,
  taxAmount = 0,
  taxExempt = false,
  total,
  onDiscountChange,
  onDiscountTypeChange,
  onTaxRateChange,
  onTaxExemptChange,
}: PricingSummaryProps) {
  const discountAmount = discountType === 'percent' 
    ? (subtotal * discount / 100) 
    : discount
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center text-sm gap-4">
        <span className="text-muted-foreground">Discount</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={discount}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
            className="w-20 h-8 text-right tabular-nums"
            step="0.01"
          />
          <Select value={discountType} onValueChange={onDiscountTypeChange}>
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">%</SelectItem>
              <SelectItem value="fixed">$</SelectItem>
            </SelectContent>
          </Select>
          <span className="font-medium tabular-nums text-red-400">
            -${discountAmount.toFixed(2)}
          </span>
        </div>
      </div>
      
      {onTaxExemptChange && (
        <div className="flex items-center justify-between text-sm py-1">
          <Label htmlFor="tax-exempt" className="text-muted-foreground cursor-pointer">
            Tax Exempt
          </Label>
          <Switch
            id="tax-exempt"
            checked={taxExempt}
            onCheckedChange={onTaxExemptChange}
          />
        </div>
      )}
      
      {!taxExempt && onTaxRateChange && (
        <div className="flex justify-between items-center text-sm gap-4">
          <span className="text-muted-foreground">Tax Rate</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => onTaxRateChange(Number(e.target.value))}
              className="w-20 h-8 text-right tabular-nums"
              step="0.01"
              min="0"
              max="100"
            />
            <span className="w-4">%</span>
            <span className="font-medium tabular-nums text-blue-400">
              ${taxAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="flex justify-between items-center">
        <span className="font-semibold text-base">TOTAL</span>
        <span className="font-bold text-2xl text-emerald-400 tabular-nums">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
