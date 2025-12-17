import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash, Copy, Sparkle, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { QuoteTemplate, QuoteTemplateCategory, Quote } from '@/lib/types'

interface QuoteTemplateManagerProps {
  templates: QuoteTemplate[]
  onSaveTemplate: (template: QuoteTemplate) => void
  onUpdateTemplate: (template: QuoteTemplate) => void
  onDeleteTemplate: (templateId: string) => void
  onUseTemplate: (template: QuoteTemplate) => void
}

const CATEGORY_OPTIONS: { value: QuoteTemplateCategory; label: string; icon: string }[] = [
  { value: 'events', label: 'Events', icon: '🎉' },
  { value: 'retail', label: 'Retail', icon: '🏪' },
  { value: 'corporate', label: 'Corporate', icon: '💼' },
  { value: 'nonprofit', label: 'Non-Profit', icon: '❤️' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'school', label: 'School', icon: '🎓' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
]

export function QuoteTemplateManager({ 
  templates, 
  onSaveTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate,
  onUseTemplate 
}: QuoteTemplateManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuoteTemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<QuoteTemplateCategory, QuoteTemplate[]>)

  const handleUseTemplate = (template: QuoteTemplate) => {
    onUseTemplate(template)
    toast.success(`Using template: ${template.name}`)
  }

  const handleDelete = (templateId: string, name: string) => {
    if (confirm(`Delete template "${name}"?`)) {
      onDeleteTemplate(templateId)
      toast.success('Template deleted')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Quote Templates</h2>
          <p className="text-sm text-muted-foreground">
            Pre-configured quote templates for common order types
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as QuoteTemplateCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {CATEGORY_OPTIONS.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {Object.entries(groupedTemplates).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No templates found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                const categoryInfo = CATEGORY_OPTIONS.find((c) => c.value === category)
                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>{categoryInfo?.icon}</span>
                      <span>{categoryInfo?.label}</span>
                      <Badge variant="secondary">{categoryTemplates.length}</Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onUse={() => handleUseTemplate(template)}
                          onEdit={() => {}}
                          onDelete={() => handleDelete(template.id, template.name)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {CATEGORY_OPTIONS.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="mt-4">
            {groupedTemplates[cat.value]?.length === 0 || !groupedTemplates[cat.value] ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No {cat.label.toLowerCase()} templates yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTemplates[cat.value].map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template)}
                    onEdit={() => {}}
                    onDelete={() => handleDelete(template.id, template.name)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface TemplateCardProps {
  template: QuoteTemplate
  onUse: () => void
  onEdit: () => void
  onDelete: () => void
}

function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const categoryInfo = CATEGORY_OPTIONS.find((c) => c.value === template.category)
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <span>{categoryInfo?.icon}</span>
              <span>{template.name}</span>
            </CardTitle>
            {template.description && (
              <CardDescription className="mt-1 text-xs line-clamp-2">
                {template.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 text-xs text-muted-foreground flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Items:</span>
            <span>{template.lineItems.length}</span>
          </div>
          {template.defaultDiscount && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Default Discount:</span>
              <Badge variant="secondary" className="text-xs">
                {template.defaultDiscount.type === 'percent' 
                  ? `${template.defaultDiscount.value}%`
                  : `$${template.defaultDiscount.value}`}
              </Badge>
            </div>
          )}
          {template.tags && template.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag size={14} className="mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {template.usageCount > 0 && (
            <div className="text-xs text-muted-foreground">
              Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button onClick={onUse} className="flex-1" size="sm">
            <Copy size={14} className="mr-1" />
            Use Template
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
