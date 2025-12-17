import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Plus, 
  MagnifyingGlass,
  Package,
  Copy,
  Pencil,
  Trash,
  Tag,
  CurrencyDollar,
  Palette,
  Star,
  X,
  Check,
} from '@phosphor-icons/react'
import type { ProductTemplate, Decoration, DecorationType, FavoriteProduct, Sizes, SupplierType } from '@/lib/types'
import { generateId } from '@/lib/data'

interface ProductTemplateManagerProps {
  templates: ProductTemplate[]
  favorites: FavoriteProduct[]
  onSaveTemplate: (template: ProductTemplate) => void
  onUpdateTemplate: (template: ProductTemplate) => void
  onDeleteTemplate: (templateId: string) => void
  onApplyTemplate?: (template: ProductTemplate) => void
}

const defaultSizes: Sizes = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  '2XL': 0,
  '3XL': 0,
}

const decorationMethods: { value: DecorationType; label: string }[] = [
  { value: 'screen-print', label: 'Screen Print' },
  { value: 'dtg', label: 'DTG' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'digital-print', label: 'Digital Print' },
  { value: 'digital-transfer', label: 'Digital Transfer' },
  { value: 'other', label: 'Other' },
]

const decorationLocations = [
  'Front Center',
  'Back Center',
  'Left Chest',
  'Right Chest',
  'Left Sleeve',
  'Right Sleeve',
  'Full Front',
  'Full Back',
  'Custom',
]

export function ProductTemplateManager({
  templates,
  favorites,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onApplyTemplate,
}: ProductTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all')
  
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteProduct | null>(null)
  const [defaultSizesConfig, setDefaultSizesConfig] = useState<Sizes>(defaultSizes)
  const [decorations, setDecorations] = useState<Omit<Decoration, 'id'>[]>([])
  const [unitPrice, setUnitPrice] = useState('')
  const [setupFee, setSetupFee] = useState('')
  const [priceByQty, setPriceByQty] = useState<Array<{ minQty: number; maxQty?: number; unitPrice: number }>>([])
  const [templateNotes, setTemplateNotes] = useState('')
  const [templateTags, setTemplateTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isActive, setIsActive] = useState(true)

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    if (activeTab === 'active') {
      filtered = filtered.filter(t => t.isActive)
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(t => !t.isActive)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.product.styleName.toLowerCase().includes(query) ||
        t.product.brandName.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [templates, searchQuery, activeTab])

  const resetForm = () => {
    setTemplateName('')
    setTemplateDescription('')
    setSelectedFavorite(null)
    setDefaultSizesConfig(defaultSizes)
    setDecorations([])
    setUnitPrice('')
    setSetupFee('')
    setPriceByQty([])
    setTemplateNotes('')
    setTemplateTags([])
    setTagInput('')
    setIsActive(true)
  }

  const loadTemplate = (template: ProductTemplate) => {
    setTemplateName(template.name)
    setTemplateDescription(template.description || '')
    setDefaultSizesConfig(template.defaultSizes || defaultSizes)
    setDecorations([...template.decorations])
    setUnitPrice(template.pricing.unitPrice.toString())
    setSetupFee(template.pricing.setupFee.toString())
    setPriceByQty(template.pricing.priceByQuantity || [])
    setTemplateNotes(template.notes || '')
    setTemplateTags(template.tags || [])
    setIsActive(template.isActive)
  }

  const handleCreateTemplate = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const handleEditTemplate = (template: ProductTemplate) => {
    setSelectedTemplate(template)
    loadTemplate(template)
    setShowEditDialog(true)
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Template name is required')
      return
    }

    if (!selectedFavorite) {
      toast.error('Please select a product')
      return
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast.error('Unit price is required')
      return
    }

    const newTemplate: ProductTemplate = {
      id: generateId('pt'),
      name: templateName,
      description: templateDescription,
      product: {
        supplier: selectedFavorite.supplier,
        styleId: selectedFavorite.styleId,
        styleName: selectedFavorite.styleName,
        brandName: selectedFavorite.brandName,
        colorName: selectedFavorite.colorName,
        colorCode: selectedFavorite.colorCode,
        imageUrl: selectedFavorite.imageUrl,
        wholesalePrice: selectedFavorite.wholesalePrice,
        retailPrice: selectedFavorite.retailPrice,
      },
      defaultSizes: defaultSizesConfig,
      decorations,
      pricing: {
        unitPrice: parseFloat(unitPrice),
        setupFee: parseFloat(setupFee) || 0,
        priceByQuantity: priceByQty.length > 0 ? priceByQty : undefined,
      },
      notes: templateNotes,
      tags: templateTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive,
    }

    onSaveTemplate(newTemplate)
    setShowCreateDialog(false)
    resetForm()
    toast.success('Template created successfully')
  }

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return

    if (!templateName.trim()) {
      toast.error('Template name is required')
      return
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast.error('Unit price is required')
      return
    }

    const updatedTemplate: ProductTemplate = {
      ...selectedTemplate,
      name: templateName,
      description: templateDescription,
      defaultSizes: defaultSizesConfig,
      decorations,
      pricing: {
        unitPrice: parseFloat(unitPrice),
        setupFee: parseFloat(setupFee) || 0,
        priceByQuantity: priceByQty.length > 0 ? priceByQty : undefined,
      },
      notes: templateNotes,
      tags: templateTags,
      updatedAt: new Date().toISOString(),
      isActive,
    }

    onUpdateTemplate(updatedTemplate)
    setShowEditDialog(false)
    setSelectedTemplate(null)
    resetForm()
    toast.success('Template updated successfully')
  }

  const handleDeleteTemplate = (template: ProductTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      onDeleteTemplate(template.id)
      toast.success('Template deleted')
    }
  }

  const handleDuplicateTemplate = (template: ProductTemplate) => {
    const duplicate: ProductTemplate = {
      ...template,
      id: generateId('pt'),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: undefined,
    }
    onSaveTemplate(duplicate)
    toast.success('Template duplicated')
  }

  const handleAddDecoration = () => {
    setDecorations([
      ...decorations,
      {
        method: 'screen-print',
        location: 'Front Center',
        inkThreadColors: '',
        setupFee: 0,
      },
    ])
  }

  const handleRemoveDecoration = (index: number) => {
    setDecorations(decorations.filter((_, i) => i !== index))
  }

  const handleUpdateDecoration = (index: number, field: string, value: any) => {
    setDecorations(
      decorations.map((dec, i) =>
        i === index ? { ...dec, [field]: value } : dec
      )
    )
  }

  const handleAddPriceTier = () => {
    setPriceByQty([
      ...priceByQty,
      { minQty: 0, unitPrice: 0 },
    ])
  }

  const handleRemovePriceTier = (index: number) => {
    setPriceByQty(priceByQty.filter((_, i) => i !== index))
  }

  const handleUpdatePriceTier = (index: number, field: string, value: any) => {
    setPriceByQty(
      priceByQty.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    )
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !templateTags.includes(tagInput.trim())) {
      setTemplateTags([...templateTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTemplateTags(templateTags.filter(t => t !== tag))
  }

  const totalQuantity = Object.values(defaultSizesConfig).reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Product Templates</h1>
            <p className="text-sm text-muted-foreground">
              Pre-configured products with decorations and pricing
            </p>
          </div>
          <Button onClick={handleCreateTemplate} className="gap-2">
            <Plus />
            New Template
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, product, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({templates.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({templates.filter(t => t.isActive).length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({templates.filter(t => !t.isActive).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first product template to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateTemplate} className="gap-2">
                <Plus />
                Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className={!template.isActive ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{template.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {template.product.brandName} - {template.product.styleName}
                      </p>
                    </div>
                    {!template.isActive && (
                      <Badge variant="secondary" className="flex-shrink-0">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  {template.product.imageUrl && (
                    <img 
                      src={template.product.imageUrl} 
                      alt={template.product.styleName}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-semibold">${template.pricing.unitPrice.toFixed(2)}</span>
                    </div>
                    
                    {template.pricing.setupFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Setup Fee:</span>
                        <span className="font-semibold">${template.pricing.setupFee.toFixed(2)}</span>
                      </div>
                    )}

                    {template.decorations.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Decorations:</span>
                        <span className="font-semibold">{template.decorations.length}</span>
                      </div>
                    )}

                    {template.pricing.priceByQuantity && template.pricing.priceByQuantity.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-muted-foreground text-xs">Volume Pricing</span>
                      </div>
                    )}
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {template.usageCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2 pt-0">
                  {onApplyTemplate && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => onApplyTemplate(template)}
                    >
                      <Check size={16} />
                      Apply
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Product Template</DialogTitle>
            <DialogDescription>
              Create a reusable template with pre-configured decorations and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Standard Left Chest Logo T-Shirt"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Optional description of this template"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Product *</Label>
              <Select
                value={selectedFavorite?.id || ''}
                onValueChange={(value) => {
                  const favorite = favorites.find(f => f.id === value)
                  setSelectedFavorite(favorite || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose from favorites" />
                </SelectTrigger>
                <SelectContent>
                  {favorites.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No favorite products yet
                    </div>
                  ) : (
                    favorites.map((fav) => (
                      <SelectItem key={fav.id} value={fav.id}>
                        {fav.brandName} - {fav.styleName}
                        {fav.colorName && ` (${fav.colorName})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Decorations</Label>
                <Button size="sm" variant="outline" onClick={handleAddDecoration} className="gap-1">
                  <Plus size={16} />
                  Add Decoration
                </Button>
              </div>

              {decorations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No decorations added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {decorations.map((decoration, index) => (
                    <div key={index} className="border border-border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Decoration {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveDecoration(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Method</Label>
                          <Select
                            value={decoration.method}
                            onValueChange={(value) => handleUpdateDecoration(index, 'method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {decorationMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Select
                            value={decoration.location}
                            onValueChange={(value) => handleUpdateDecoration(index, 'location', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {decorationLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Ink/Thread Colors</Label>
                          <Input
                            placeholder="e.g., Black, White, Red"
                            value={decoration.inkThreadColors}
                            onChange={(e) => handleUpdateDecoration(index, 'inkThreadColors', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Setup Fee</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={decoration.setupFee}
                            onChange={(e) => handleUpdateDecoration(index, 'setupFee', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label>Imprint Size</Label>
                          <Input
                            placeholder="e.g., 4x4 inches"
                            value={decoration.imprintSize || ''}
                            onChange={(e) => handleUpdateDecoration(index, 'imprintSize', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <Label className="text-base font-semibold">Pricing</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="unit-price">Unit Price *</Label>
                  <Input
                    id="unit-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-fee">Total Setup Fee</Label>
                  <Input
                    id="setup-fee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume Pricing (Optional)</Label>
                  <Button size="sm" variant="outline" onClick={handleAddPriceTier} className="gap-1">
                    <Plus size={16} />
                    Add Tier
                  </Button>
                </div>

                {priceByQty.length > 0 && (
                  <div className="space-y-2">
                    {priceByQty.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min Qty"
                          value={tier.minQty}
                          onChange={(e) => handleUpdatePriceTier(index, 'minQty', parseInt(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max Qty (optional)"
                          value={tier.maxQty || ''}
                          onChange={(e) => handleUpdatePriceTier(index, 'maxQty', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">@</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={tier.unitPrice}
                          onChange={(e) => handleUpdatePriceTier(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePriceTier(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-notes">Notes</Label>
              <Textarea
                id="template-notes"
                placeholder="Additional notes about this template"
                value={templateNotes}
                onChange={(e) => setTemplateNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag (e.g., promotional, corporate)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag} variant="outline">
                  <Plus />
                </Button>
              </div>
              {templateTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {templateTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Active (visible in quick-add)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product Template</DialogTitle>
            <DialogDescription>
              Update the template configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Template Name *</Label>
              <Input
                id="edit-template-name"
                placeholder="e.g., Standard Left Chest Logo T-Shirt"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-description">Description</Label>
              <Textarea
                id="edit-template-description"
                placeholder="Optional description of this template"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>

            {selectedTemplate && (
              <div className="border border-border rounded-lg p-3 bg-muted/50">
                <p className="text-sm font-medium mb-1">Product</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.product.brandName} - {selectedTemplate.product.styleName}
                  {selectedTemplate.product.colorName && ` (${selectedTemplate.product.colorName})`}
                </p>
              </div>
            )}

            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Decorations</Label>
                <Button size="sm" variant="outline" onClick={handleAddDecoration} className="gap-1">
                  <Plus size={16} />
                  Add Decoration
                </Button>
              </div>

              {decorations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No decorations added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {decorations.map((decoration, index) => (
                    <div key={index} className="border border-border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Decoration {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveDecoration(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Method</Label>
                          <Select
                            value={decoration.method}
                            onValueChange={(value) => handleUpdateDecoration(index, 'method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {decorationMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Select
                            value={decoration.location}
                            onValueChange={(value) => handleUpdateDecoration(index, 'location', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {decorationLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Ink/Thread Colors</Label>
                          <Input
                            placeholder="e.g., Black, White, Red"
                            value={decoration.inkThreadColors}
                            onChange={(e) => handleUpdateDecoration(index, 'inkThreadColors', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Setup Fee</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={decoration.setupFee}
                            onChange={(e) => handleUpdateDecoration(index, 'setupFee', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label>Imprint Size</Label>
                          <Input
                            placeholder="e.g., 4x4 inches"
                            value={decoration.imprintSize || ''}
                            onChange={(e) => handleUpdateDecoration(index, 'imprintSize', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <Label className="text-base font-semibold">Pricing</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit-price">Unit Price *</Label>
                  <Input
                    id="edit-unit-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-setup-fee">Total Setup Fee</Label>
                  <Input
                    id="edit-setup-fee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume Pricing (Optional)</Label>
                  <Button size="sm" variant="outline" onClick={handleAddPriceTier} className="gap-1">
                    <Plus size={16} />
                    Add Tier
                  </Button>
                </div>

                {priceByQty.length > 0 && (
                  <div className="space-y-2">
                    {priceByQty.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min Qty"
                          value={tier.minQty}
                          onChange={(e) => handleUpdatePriceTier(index, 'minQty', parseInt(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max Qty (optional)"
                          value={tier.maxQty || ''}
                          onChange={(e) => handleUpdatePriceTier(index, 'maxQty', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">@</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={tier.unitPrice}
                          onChange={(e) => handleUpdatePriceTier(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePriceTier(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-notes">Notes</Label>
              <Textarea
                id="edit-template-notes"
                placeholder="Additional notes about this template"
                value={templateNotes}
                onChange={(e) => setTemplateNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag (e.g., promotional, corporate)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag} variant="outline">
                  <Plus />
                </Button>
              </div>
              {templateTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {templateTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="edit-is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-is-active">Active (visible in quick-add)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
