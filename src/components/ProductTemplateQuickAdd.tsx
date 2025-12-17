import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MagnifyingGlass,
  Plus,
  Stack,
  Check,
  X,
} from '@phosphor-icons/react'
import type { ProductTemplate, LineItem, Sizes } from '@/lib/types'
import { generateId } from '@/lib/data'
import { toast } from 'sonner'

interface ProductTemplateQuickAddProps {
  templates: ProductTemplate[]
  onAddToQuote: (item: LineItem) => void
  onUpdateTemplate?: (template: ProductTemplate) => void
}

export function ProductTemplateQuickAdd({
  templates,
  onAddToQuote,
  onUpdateTemplate,
}: ProductTemplateQuickAddProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null)
  const [quantities, setQuantities] = useState<Sizes>({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 0,
    '3XL': 0,
  })

  const activeTemplates = useMemo(() => {
    return templates.filter(t => t.isActive)
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return activeTemplates

    const query = searchQuery.toLowerCase()
    return activeTemplates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.product.styleName.toLowerCase().includes(query) ||
      t.product.brandName.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }, [activeTemplates, searchQuery])

  const handleOpenDialog = () => {
    setShowDialog(true)
    setSearchQuery('')
  }

  const handleSelectTemplate = (template: ProductTemplate) => {
    setSelectedTemplate(template)
    if (template.defaultSizes) {
      setQuantities(template.defaultSizes)
    } else {
      setQuantities({
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        '2XL': 0,
        '3XL': 0,
      })
    }
  }

  const handleAddToQuote = () => {
    if (!selectedTemplate) return

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

    if (totalQuantity === 0) {
      toast.error('Please enter at least one quantity')
      return
    }

    const unitPrice = selectedTemplate.pricing.priceByQuantity && selectedTemplate.pricing.priceByQuantity.length > 0
      ? selectedTemplate.pricing.priceByQuantity
          .filter(tier => totalQuantity >= tier.minQty && (!tier.maxQty || totalQuantity <= tier.maxQty))
          .sort((a, b) => a.unitPrice - b.unitPrice)[0]?.unitPrice || selectedTemplate.pricing.unitPrice
      : selectedTemplate.pricing.unitPrice

    const lineTotal = (totalQuantity * unitPrice) + selectedTemplate.pricing.setupFee

    const lineItem: LineItem = {
      id: generateId('li'),
      product_type: 'other',
      product_name: `${selectedTemplate.product.brandName} - ${selectedTemplate.product.styleName}`,
      product_color: selectedTemplate.product.colorName,
      decoration: selectedTemplate.decorations[0]?.method || 'screen-print',
      print_locations: selectedTemplate.decorations.map(d => d.location),
      decorations: selectedTemplate.decorations.map(d => ({
        ...d,
        id: generateId('dec'),
      })),
      colors: selectedTemplate.decorations.reduce((max, d) => {
        const colors = d.inkThreadColors.split(',').length
        return colors > max ? colors : max
      }, 1),
      sizes: quantities,
      quantity: totalQuantity,
      unit_price: unitPrice,
      setup_fee: selectedTemplate.pricing.setupFee,
      line_total: lineTotal,
    }

    onAddToQuote(lineItem)

    if (onUpdateTemplate) {
      const updatedTemplate: ProductTemplate = {
        ...selectedTemplate,
        usageCount: selectedTemplate.usageCount + 1,
        lastUsed: new Date().toISOString(),
      }
      onUpdateTemplate(updatedTemplate)
    }

    setShowDialog(false)
    setSelectedTemplate(null)
    setQuantities({
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      '2XL': 0,
      '3XL': 0,
    })
    toast.success(`Added ${selectedTemplate.name} to quote`)
  }

  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-center gap-3">
          <Stack size={24} className="text-accent" />
          <div>
            <h3 className="font-semibold text-sm">Product Templates</h3>
            <p className="text-xs text-muted-foreground">
              {activeTemplates.length} pre-configured template{activeTemplates.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <Button onClick={handleOpenDialog} size="sm" variant="outline" className="gap-2">
          <Plus size={16} />
          Quick Add
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Product Template</DialogTitle>
            <DialogDescription>
              Select a pre-configured template to add to your quote
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search templates by name, product, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedTemplate ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {selectedTemplate.product.imageUrl && (
                        <img
                          src={selectedTemplate.product.imageUrl}
                          alt={selectedTemplate.product.styleName}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{selectedTemplate.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedTemplate.product.brandName} - {selectedTemplate.product.styleName}
                          {selectedTemplate.product.colorName && ` (${selectedTemplate.product.colorName})`}
                        </p>
                        {selectedTemplate.description && (
                          <p className="text-sm text-muted-foreground mb-2">{selectedTemplate.description}</p>
                        )}
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Unit Price:</span>
                            <span className="font-semibold">${selectedTemplate.pricing.unitPrice.toFixed(2)}</span>
                          </div>
                          {selectedTemplate.pricing.setupFee > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Setup Fee:</span>
                              <span className="font-semibold">${selectedTemplate.pricing.setupFee.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedTemplate.decorations.length > 0 && (
                            <div className="pt-2 border-t border-border">
                              <span className="font-medium">Decorations:</span>
                              <ul className="mt-1 space-y-1">
                                {selectedTemplate.decorations.map((dec, index) => (
                                  <li key={index} className="text-xs text-muted-foreground ml-2">
                                    • {dec.location} - {dec.method} ({dec.inkThreadColors || 'No colors specified'})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTemplate(null)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Size Quantities</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {(Object.keys(quantities) as Array<keyof Sizes>).map((size) => (
                        <div key={size} className="space-y-1">
                          <label className="text-xs font-medium text-center block">{size}</label>
                          <Input
                            type="number"
                            min="0"
                            value={quantities[size]}
                            onChange={(e) => setQuantities({
                              ...quantities,
                              [size]: parseInt(e.target.value) || 0
                            })}
                            className="text-center"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-sm font-medium">Total Quantity:</span>
                      <span className="text-lg font-bold">{totalQuantity}</span>
                    </div>
                    {selectedTemplate.pricing.priceByQuantity && selectedTemplate.pricing.priceByQuantity.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-xs font-medium text-muted-foreground">Volume Pricing:</span>
                        <div className="mt-1 space-y-1">
                          {selectedTemplate.pricing.priceByQuantity.map((tier, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              {tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'} units: ${tier.unitPrice.toFixed(2)} each
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Back
                  </Button>
                  <Button onClick={handleAddToQuote} disabled={totalQuantity === 0}>
                    <Check size={16} className="mr-2" />
                    Add to Quote
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Stack size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? 'No templates found' : 'No active templates available'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {template.product.imageUrl && (
                              <img
                                src={template.product.imageUrl}
                                alt={template.product.styleName}
                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate mb-1">{template.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {template.product.brandName} - {template.product.styleName}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  ${template.pricing.unitPrice.toFixed(2)}
                                </Badge>
                                {template.decorations.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.decorations.length} decoration{template.decorations.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              {template.tags && template.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {template.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {template.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{template.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
