import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkle, CheckCircle, Percent, CurrencyDollar } from '@phosphor-icons/react'
import type { Quote, CustomerPricingRule, Customer } from '@/lib/types'

interface PricingRulesSuggestionsProps {
  quote: Quote
  pricingRules: CustomerPricingRule[]
  onApplyDiscount: (discount: number, discountType: 'percent' | 'fixed') => void
}

interface ApplicableRule {
  rule: CustomerPricingRule
  reason: string
  savings: number
}

export function PricingRulesSuggestions({ quote, pricingRules, onApplyDiscount }: PricingRulesSuggestionsProps) {
  const applicableRules = useMemo(() => {
    const rules: ApplicableRule[] = []
    
    const activeRules = pricingRules
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority)
    
    for (const rule of activeRules) {
      let isApplicable = false
      let reason = ''
      
      if (rule.type === 'tier-discount') {
        if (quote.customer.tier && rule.conditions.customerTiers?.includes(quote.customer.tier)) {
          isApplicable = true
          reason = `${quote.customer.tier.charAt(0).toUpperCase() + quote.customer.tier.slice(1)} tier customer`
        }
      }
      
      if (rule.type === 'volume-discount') {
        const totalQuantity = quote.line_items.reduce((sum, item) => sum + item.quantity, 0)
        if (rule.conditions.minQuantity && totalQuantity >= rule.conditions.minQuantity) {
          isApplicable = true
          reason = `Order quantity ${totalQuantity} meets minimum ${rule.conditions.minQuantity}`
        }
        
        if (rule.conditions.minOrderValue && quote.subtotal >= rule.conditions.minOrderValue) {
          isApplicable = true
          reason = `Order value $${quote.subtotal.toFixed(2)} meets minimum $${rule.conditions.minOrderValue.toFixed(2)}`
        }
      }
      
      if (rule.type === 'product-discount') {
        const hasMatchingProduct = quote.line_items.some(item => 
          rule.conditions.specificProducts?.some(product => 
            item.product_name.toLowerCase().includes(product.toLowerCase())
          )
        )
        if (hasMatchingProduct) {
          isApplicable = true
          reason = 'Contains eligible products'
        }
      }
      
      if (rule.type === 'category-discount') {
        const hasMatchingCategory = quote.line_items.some(item => 
          rule.conditions.productCategories?.includes(item.product_type)
        )
        if (hasMatchingCategory) {
          isApplicable = true
          reason = 'Contains eligible product categories'
        }
      }
      
      if (isApplicable) {
        let baseAmount = quote.subtotal
        
        if (rule.discount.applyTo === 'product') {
          baseAmount = quote.line_items.reduce((sum, item) => {
            const isEligible = 
              (rule.type === 'product-discount' && rule.conditions.specificProducts?.some(p => 
                item.product_name.toLowerCase().includes(p.toLowerCase())
              )) ||
              (rule.type === 'category-discount' && rule.conditions.productCategories?.includes(item.product_type)) ||
              (rule.type === 'tier-discount' || rule.type === 'volume-discount')
            
            return sum + (isEligible ? (item.quantity * item.unit_price) : 0)
          }, 0)
        } else if (rule.discount.applyTo === 'setup') {
          baseAmount = quote.line_items.reduce((sum, item) => {
            return sum + item.setup_fee + (item.decorations?.reduce((s, d) => s + d.setupFee, 0) || 0)
          }, 0)
        }
        
        const savings = rule.discount.type === 'percent'
          ? baseAmount * (rule.discount.value / 100)
          : rule.discount.value
        
        rules.push({
          rule,
          reason,
          savings
        })
      }
    }
    
    return rules
  }, [quote, pricingRules])
  
  const bestRule = applicableRules.length > 0 
    ? applicableRules.reduce((best, current) => current.savings > best.savings ? current : best)
    : null
  
  const currentDiscountAmount = quote.discount_type === 'percent'
    ? quote.subtotal * (quote.discount / 100)
    : quote.discount
  
  const hasExistingDiscount = quote.discount > 0
  
  if (applicableRules.length === 0) {
    return null
  }
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-primary" />
          <CardTitle className="text-base">Pricing Rule Suggestions</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {applicableRules.length} pricing rule{applicableRules.length !== 1 ? 's' : ''} available for this quote
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bestRule && (
          <Alert className="border-primary/30 bg-primary/10">
            <CheckCircle size={16} className="text-primary" />
            <AlertDescription className="text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-foreground">{bestRule.rule.name}</div>
                  <div className="text-xs text-muted-foreground">{bestRule.reason}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {bestRule.rule.discount.type === 'percent' 
                        ? `${bestRule.rule.discount.value}% off`
                        : `$${bestRule.rule.discount.value} off`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Save ${bestRule.savings.toFixed(2)}
                    </span>
                  </div>
                  {hasExistingDiscount && currentDiscountAmount >= bestRule.savings && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Current discount is better (${currentDiscountAmount.toFixed(2)})
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => onApplyDiscount(bestRule.rule.discount.value, bestRule.rule.discount.type)}
                  disabled={hasExistingDiscount && currentDiscountAmount >= bestRule.savings}
                >
                  Apply
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {applicableRules.length > 1 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Other Available Rules</div>
            {applicableRules.slice(1).map((applicable) => (
              <div 
                key={applicable.rule.id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card text-sm"
              >
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{applicable.rule.name}</div>
                  <div className="text-xs text-muted-foreground">{applicable.reason}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {applicable.rule.discount.type === 'percent' 
                        ? `${applicable.rule.discount.value}%`
                        : `$${applicable.rule.discount.value}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Save ${applicable.savings.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplyDiscount(applicable.rule.discount.value, applicable.rule.discount.type)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
