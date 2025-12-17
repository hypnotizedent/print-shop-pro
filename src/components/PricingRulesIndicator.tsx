import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Percent, Sparkle } from '@phosphor-icons/react'
import type { Quote, CustomerPricingRule } from '@/lib/types'
import { calculateAutomaticDiscount, formatDiscountDescription } from '@/lib/pricing-rules'

interface PricingRulesIndicatorProps {
  quote: Quote
  pricingRules: CustomerPricingRule[]
}

export function PricingRulesIndicator({ quote, pricingRules }: PricingRulesIndicatorProps) {
  const { discount, appliedRules } = calculateAutomaticDiscount(quote, pricingRules)

  if (appliedRules.length === 0) {
    return null
  }

  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Sparkle size={18} className="text-primary" />
      <AlertDescription className="ml-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              Automatic discounts available: ${discount.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {appliedRules.map((rule) => (
              <Badge key={rule.id} variant="secondary" className="text-xs">
                {rule.name}: {formatDiscountDescription(rule)}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            These discounts can be applied automatically based on customer tier and order volume
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface PricingRulesSummaryProps {
  quote: Quote
  pricingRules: CustomerPricingRule[]
}

export function PricingRulesSummary({ quote, pricingRules }: PricingRulesSummaryProps) {
  const { discount, appliedRules } = calculateAutomaticDiscount(quote, pricingRules)

  if (appliedRules.length === 0 && !quote.customer.tier) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Percent size={18} />
            Pricing Rules
          </CardTitle>
          <CardDescription className="text-xs">
            No customer tier selected - set a tier to enable automatic discounts
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Percent size={18} />
          Pricing Rules
        </CardTitle>
        <CardDescription className="text-xs">
          {appliedRules.length > 0
            ? `${appliedRules.length} rule${appliedRules.length > 1 ? 's' : ''} applicable`
            : 'No applicable pricing rules'}
        </CardDescription>
      </CardHeader>
      {appliedRules.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            {appliedRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between text-sm p-2 bg-primary/5 rounded">
                <div className="flex-1">
                  <div className="font-medium">{rule.name}</div>
                  {rule.description && (
                    <div className="text-xs text-muted-foreground">{rule.description}</div>
                  )}
                </div>
                <Badge variant="secondary">
                  {formatDiscountDescription(rule)}
                </Badge>
              </div>
            ))}
            <div className="pt-2 border-t flex items-center justify-between font-semibold">
              <span>Total Suggested Discount:</span>
              <span className="text-primary">${discount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
