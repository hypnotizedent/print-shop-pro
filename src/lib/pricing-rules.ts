import type { CustomerPricingRule, Customer, Quote } from './types'

export function calculateAutomaticDiscount(
  quote: Quote,
  pricingRules: CustomerPricingRule[]
): { discount: number; appliedRules: CustomerPricingRule[] } {
  const activeRules = pricingRules
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.priority - b.priority)

  const appliedRules: CustomerPricingRule[] = []
  let totalDiscount = 0

  for (const rule of activeRules) {
    if (isRuleApplicable(quote, rule)) {
      const discount = calculateRuleDiscount(quote, rule)
      if (discount > 0) {
        totalDiscount += discount
        appliedRules.push(rule)
      }
    }
  }

  return { discount: totalDiscount, appliedRules }
}

function isRuleApplicable(quote: Quote, rule: CustomerPricingRule): boolean {
  const { conditions } = rule

  if (conditions.customerTiers && conditions.customerTiers.length > 0) {
    if (!quote.customer.tier || !conditions.customerTiers.includes(quote.customer.tier)) {
      return false
    }
  }

  if (conditions.minQuantity) {
    const totalQuantity = quote.line_items.reduce((sum, item) => sum + item.quantity, 0)
    if (totalQuantity < conditions.minQuantity) {
      return false
    }
  }

  if (conditions.minOrderValue) {
    if (quote.subtotal < conditions.minOrderValue) {
      return false
    }
  }

  return true
}

function calculateRuleDiscount(quote: Quote, rule: CustomerPricingRule): number {
  const { discount } = rule

  switch (discount.applyTo) {
    case 'product': {
      const productTotal = quote.line_items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      )
      return discount.type === 'percent'
        ? (productTotal * discount.value) / 100
        : discount.value
    }

    case 'setup': {
      const setupTotal = quote.line_items.reduce((sum, item) => sum + item.setup_fee, 0)
      return discount.type === 'percent'
        ? (setupTotal * discount.value) / 100
        : discount.value
    }

    case 'total': {
      return discount.type === 'percent'
        ? (quote.subtotal * discount.value) / 100
        : discount.value
    }

    default:
      return 0
  }
}

export function formatDiscountDescription(rule: CustomerPricingRule): string {
  const { discount } = rule
  const value = discount.type === 'percent' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`
  return `${value} off ${discount.applyTo}`
}

export function getApplicableRulesForCustomer(
  customer: Customer,
  pricingRules: CustomerPricingRule[]
): CustomerPricingRule[] {
  return pricingRules.filter((rule) => {
    if (!rule.isActive) return false
    if (rule.conditions.customerTiers && rule.conditions.customerTiers.length > 0) {
      if (!customer.tier) return false
      return rule.conditions.customerTiers.includes(customer.tier)
    }
    return true
  })
}
