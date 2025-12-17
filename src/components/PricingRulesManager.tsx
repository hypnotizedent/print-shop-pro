import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash, ArrowsDownUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CustomerPricingRule, CustomerTier, PricingRuleType } from '@/lib/types'

interface PricingRulesManagerProps {
  rules: CustomerPricingRule[]
  onSaveRule: (rule: CustomerPricingRule) => void
  onUpdateRule: (rule: CustomerPricingRule) => void
  onDeleteRule: (ruleId: string) => void
}

const TIER_OPTIONS: CustomerTier[] = ['bronze', 'silver', 'gold', 'platinum']
const RULE_TYPE_OPTIONS: { value: PricingRuleType; label: string }[] = [
  { value: 'tier-discount', label: 'Customer Tier Discount' },
  { value: 'volume-discount', label: 'Volume Discount' },
  { value: 'product-discount', label: 'Product Discount' },
  { value: 'category-discount', label: 'Category Discount' },
]

export function PricingRulesManager({ rules, onSaveRule, onUpdateRule, onDeleteRule }: PricingRulesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomerPricingRule | null>(null)
  const [formData, setFormData] = useState<Partial<CustomerPricingRule>>({
    name: '',
    description: '',
    type: 'tier-discount',
    isActive: true,
    priority: 1,
    conditions: {
      customerTiers: [],
    },
    discount: {
      type: 'percent',
      value: 0,
      applyTo: 'total',
    },
  })

  const handleOpenDialog = (rule?: CustomerPricingRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData(rule)
    } else {
      setEditingRule(null)
      setFormData({
        name: '',
        description: '',
        type: 'tier-discount',
        isActive: true,
        priority: rules.length + 1,
        conditions: {
          customerTiers: [],
        },
        discount: {
          type: 'percent',
          value: 0,
          applyTo: 'total',
        },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields')
      return
    }

    const rule: CustomerPricingRule = {
      id: editingRule?.id || `pr-${Date.now()}`,
      name: formData.name!,
      description: formData.description,
      type: formData.type!,
      isActive: formData.isActive ?? true,
      priority: formData.priority ?? 1,
      conditions: formData.conditions!,
      discount: formData.discount!,
      createdAt: editingRule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingRule) {
      onUpdateRule(rule)
      toast.success('Pricing rule updated')
    } else {
      onSaveRule(rule)
      toast.success('Pricing rule created')
    }

    setIsDialogOpen(false)
  }

  const handleTierToggle = (tier: CustomerTier) => {
    setFormData((prev) => {
      const currentTiers = prev.conditions?.customerTiers || []
      const newTiers = currentTiers.includes(tier)
        ? currentTiers.filter((t) => t !== tier)
        : [...currentTiers, tier]
      
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          customerTiers: newTiers,
        },
      }
    })
  }

  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Rules</h2>
          <p className="text-sm text-muted-foreground">
            Automatic discounts based on customer tier or order volume
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}</DialogTitle>
              <DialogDescription>
                Create automatic pricing rules for different customer tiers or order volumes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gold Tier 10% Discount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Rule Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: PricingRuleType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this rule"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Conditions</h3>
                
                {(formData.type === 'tier-discount' || formData.type === 'volume-discount') && (
                  <div className="space-y-3">
                    <Label>Customer Tiers</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {TIER_OPTIONS.map((tier) => (
                        <div key={tier} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tier-${tier}`}
                            checked={formData.conditions?.customerTiers?.includes(tier)}
                            onCheckedChange={() => handleTierToggle(tier)}
                          />
                          <label
                            htmlFor={`tier-${tier}`}
                            className="text-sm font-medium capitalize cursor-pointer"
                          >
                            {tier}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.type === 'volume-discount' && (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="minQuantity">Minimum Quantity</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        min="0"
                        value={formData.conditions?.minQuantity || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditions: {
                              ...formData.conditions,
                              minQuantity: parseInt(e.target.value) || undefined,
                            },
                          })
                        }
                        placeholder="e.g., 100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Minimum Order Value ($)</Label>
                      <Input
                        id="minOrderValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.conditions?.minOrderValue || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditions: {
                              ...formData.conditions,
                              minOrderValue: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        placeholder="e.g., 500.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Discount</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Type</Label>
                    <Select
                      value={formData.discount?.type}
                      onValueChange={(value: 'percent' | 'fixed') =>
                        setFormData({
                          ...formData,
                          discount: {
                            ...formData.discount!,
                            type: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Value {formData.discount?.type === 'percent' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step={formData.discount?.type === 'percent' ? '1' : '0.01'}
                      max={formData.discount?.type === 'percent' ? '100' : undefined}
                      value={formData.discount?.value || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount: {
                            ...formData.discount!,
                            value: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applyTo">Apply To</Label>
                    <Select
                      value={formData.discount?.applyTo}
                      onValueChange={(value: 'product' | 'setup' | 'total') =>
                        setFormData({
                          ...formData,
                          discount: {
                            ...formData.discount!,
                            applyTo: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger id="applyTo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Only</SelectItem>
                        <SelectItem value="setup">Setup Only</SelectItem>
                        <SelectItem value="total">Total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1 = highest)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={formData.priority || 1}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingRule ? 'Update' : 'Create'} Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sortedRules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No pricing rules yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          sortedRules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      {!rule.isActive && <Badge variant="secondary">Inactive</Badge>}
                      <Badge variant="outline" className="text-xs">
                        Priority {rule.priority}
                      </Badge>
                    </div>
                    {rule.description && (
                      <CardDescription>{rule.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this pricing rule?')) {
                          onDeleteRule(rule.id)
                          toast.success('Pricing rule deleted')
                        }
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Type:</span>
                    <Badge variant="secondary">
                      {RULE_TYPE_OPTIONS.find((opt) => opt.value === rule.type)?.label}
                    </Badge>
                  </div>

                  {rule.conditions.customerTiers && rule.conditions.customerTiers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Tiers:</span>
                      <div className="flex gap-1">
                        {rule.conditions.customerTiers.map((tier) => (
                          <Badge key={tier} variant="outline" className="capitalize">
                            {tier}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.conditions.minQuantity && (
                    <div>
                      <span className="font-semibold">Min Quantity:</span> {rule.conditions.minQuantity}
                    </div>
                  )}

                  {rule.conditions.minOrderValue && (
                    <div>
                      <span className="font-semibold">Min Order Value:</span> ${rule.conditions.minOrderValue.toFixed(2)}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Discount:</span>
                    <Badge className="bg-primary">
                      {rule.discount.type === 'percent' 
                        ? `${rule.discount.value}%` 
                        : `$${rule.discount.value.toFixed(2)}`}
                      {' '}off {rule.discount.applyTo}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
