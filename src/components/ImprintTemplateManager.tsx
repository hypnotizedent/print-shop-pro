import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Pencil, Trash, Copy, Star, MagnifyingGlass, Tag, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ImprintTemplate, ImprintTemplateCategory, DecorationType } from '@/lib/types'
import { generateId } from '@/lib/data'

interface ImprintTemplateManagerProps {
  templates: ImprintTemplate[]
  onSaveTemplate: (template: ImprintTemplate) => void
  onUpdateTemplate: (template: ImprintTemplate) => void
  onDeleteTemplate: (templateId: string) => void
}

const DECORATION_METHODS: { value: DecorationType; label: string }[] = [
  { value: 'screen-print', label: 'Screen Print' },
  { value: 'dtg', label: 'DTG' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'digital-print', label: 'Digital Print' },
  { value: 'digital-transfer', label: 'Digital Transfer' },
  { value: 'other', label: 'Other' },
]

const CATEGORIES: { value: ImprintTemplateCategory; label: string }[] = [
  { value: 'screen-print', label: 'Screen Print' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'dtg', label: 'DTG' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'custom', label: 'Custom' },
]

const COMMON_LOCATIONS = [
  'Front',
  'Back',
  'Left Chest',
  'Right Chest',
  'Left Sleeve',
  'Right Sleeve',
  'Pocket',
  'Hood',
  'Front Panel',
  'Back Panel',
  'Custom',
]

export function ImprintTemplateManager({
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: ImprintTemplateManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ImprintTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ImprintTemplateCategory | 'all'>('all')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'screen-print' as ImprintTemplateCategory,
    customCategory: '',
    method: 'screen-print' as DecorationType,
    customMethod: '',
    location: 'Front',
    customLocation: '',
    inkThreadColors: '',
    imprintSize: '',
    setupFee: 0,
    tags: '',
  })

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.decoration.location.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => {
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [templates, selectedCategory, searchQuery])

  const templatesByCategory = useMemo(() => {
    const grouped: Record<ImprintTemplateCategory, ImprintTemplate[]> = {
      'screen-print': [],
      embroidery: [],
      dtg: [],
      vinyl: [],
      specialty: [],
      custom: [],
    }

    filteredTemplates.forEach((template) => {
      grouped[template.category].push(template)
    })

    return grouped
  }, [filteredTemplates])

  const handleOpenDialog = (template?: ImprintTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category,
        customCategory: template.customCategory || '',
        method: template.decoration.method,
        customMethod: template.decoration.customMethod || '',
        location: template.decoration.location,
        customLocation: template.decoration.customLocation || '',
        inkThreadColors: template.decoration.inkThreadColors,
        imprintSize: template.decoration.imprintSize || '',
        setupFee: template.decoration.setupFee,
        tags: template.tags?.join(', ') || '',
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        description: '',
        category: 'screen-print',
        customCategory: '',
        method: 'screen-print',
        customMethod: '',
        location: 'Front',
        customLocation: '',
        inkThreadColors: '',
        imprintSize: '',
        setupFee: 0,
        tags: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    if (!formData.inkThreadColors.trim()) {
      toast.error('Colors/threads are required')
      return
    }

    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const templateData: ImprintTemplate = {
      id: editingTemplate?.id || generateId('imprint'),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      customCategory: formData.category === 'custom' ? formData.customCategory : undefined,
      decoration: {
        method: formData.method,
        customMethod: formData.method === 'other' ? formData.customMethod : undefined,
        location: formData.location,
        customLocation: formData.location === 'Custom' ? formData.customLocation : undefined,
        inkThreadColors: formData.inkThreadColors.trim(),
        imprintSize: formData.imprintSize.trim() || undefined,
        setupFee: formData.setupFee,
      },
      tags: tags.length > 0 ? tags : undefined,
      isActive: editingTemplate?.isActive ?? true,
      usageCount: editingTemplate?.usageCount || 0,
      lastUsed: editingTemplate?.lastUsed,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingTemplate) {
      onUpdateTemplate(templateData)
      toast.success('Template updated')
    } else {
      onSaveTemplate(templateData)
      toast.success('Template created')
    }

    setIsDialogOpen(false)
  }

  const handleDuplicate = (template: ImprintTemplate) => {
    const duplicated: ImprintTemplate = {
      ...template,
      id: generateId('imprint'),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSaveTemplate(duplicated)
    toast.success('Template duplicated')
  }

  const handleDelete = (template: ImprintTemplate) => {
    if (confirm(`Delete template "${template.name}"?`)) {
      onDeleteTemplate(template.id)
      toast.success('Template deleted')
    }
  }

  const getCategoryColor = (category: ImprintTemplateCategory) => {
    const colors: Record<ImprintTemplateCategory, string> = {
      'screen-print': 'bg-blue-500/20 text-blue-400',
      embroidery: 'bg-purple-500/20 text-purple-400',
      dtg: 'bg-green-500/20 text-green-400',
      vinyl: 'bg-yellow-500/20 text-yellow-400',
      specialty: 'bg-pink-500/20 text-pink-400',
      custom: 'bg-gray-500/20 text-gray-400',
    }
    return colors[category] || colors.custom
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ImprintTemplateCategory | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus size={18} className="mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Imprint Template</DialogTitle>
              <DialogDescription>Save frequently used decoration settings for quick reuse</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Full Front Logo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ImprintTemplateCategory })}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.category === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customCategory">Custom Category</Label>
                    <Input
                      id="customCategory"
                      placeholder="Enter custom category"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional notes about this template..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium text-sm">Decoration Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method">Decoration Method</Label>
                      <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v as DecorationType })}>
                        <SelectTrigger id="method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DECORATION_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.method === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="customMethod">Custom Method</Label>
                        <Input
                          id="customMethod"
                          placeholder="Enter custom method"
                          value={formData.customMethod}
                          onChange={(e) => setFormData({ ...formData, customMethod: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                        <SelectTrigger id="location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.location === 'Custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customLocation">Custom Location</Label>
                      <Input
                        id="customLocation"
                        placeholder="Enter custom location"
                        value={formData.customLocation}
                        onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="colors">Ink/Thread Colors *</Label>
                      <Input
                        id="colors"
                        placeholder="e.g., PMS 186, White, Black"
                        value={formData.inkThreadColors}
                        onChange={(e) => setFormData({ ...formData, inkThreadColors: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Imprint Size</Label>
                      <Input
                        id="size"
                        placeholder='e.g., 12" × 14"'
                        value={formData.imprintSize}
                        onChange={(e) => setFormData({ ...formData, imprintSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setupFee">Setup Fee ($)</Label>
                    <Input
                      id="setupFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.setupFee}
                      onChange={(e) => setFormData({ ...formData, setupFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., logo, corporate, standard"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' ? 'No templates match your filters' : 'No imprint templates yet. Create your first template to get started!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredTemplates.length})</TabsTrigger>
            {CATEGORIES.map((cat) => {
              const count = templatesByCategory[cat.value].length
              return count > 0 ? (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label} ({count})
                </TabsTrigger>
              ) : null
            })}
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleOpenDialog(template)}
                onDuplicate={() => handleDuplicate(template)}
                onDelete={() => handleDelete(template)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </TabsContent>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-3">
              {templatesByCategory[cat.value].map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleOpenDialog(template)}
                  onDuplicate={() => handleDuplicate(template)}
                  onDelete={() => handleDelete(template)}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: ImprintTemplate
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  getCategoryColor: (category: ImprintTemplateCategory) => string
}

function TemplateCard({ template, onEdit, onDuplicate, onDelete, getCategoryColor }: TemplateCardProps) {
  const decorationMethod = DECORATION_METHODS.find((m) => m.value === template.decoration.method)?.label || template.decoration.customMethod || template.decoration.method

  return (
    <Card className="hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{template.name}</h3>
                  <Badge variant="outline" className={getCategoryColor(template.category)}>
                    {template.customCategory || CATEGORIES.find((c) => c.value === template.category)?.label}
                  </Badge>
                  {template.usageCount > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Star size={12} weight="fill" />
                      {template.usageCount}
                    </Badge>
                  )}
                </div>
                {template.description && <p className="text-sm text-muted-foreground mb-2">{template.description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Method:</span>
                <p className="font-medium">{decorationMethod}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p className="font-medium">{template.decoration.customLocation || template.decoration.location}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Colors:</span>
                <p className="font-medium truncate" title={template.decoration.inkThreadColors}>
                  {template.decoration.inkThreadColors}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Setup Fee:</span>
                <p className="font-medium">${template.decoration.setupFee.toFixed(2)}</p>
              </div>
            </div>

            {template.decoration.imprintSize && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2 font-medium">{template.decoration.imprintSize}</span>
              </div>
            )}

            {template.tags && template.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Tag size={14} className="text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onEdit} title="Edit template">
              <Pencil size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate template">
              <Copy size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="Delete template" className="text-destructive hover:text-destructive">
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
