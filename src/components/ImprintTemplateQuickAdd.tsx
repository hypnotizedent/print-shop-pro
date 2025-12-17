import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, Sparkle, Star } from '@phosphor-icons/react'
import type { ImprintTemplate, ImprintTemplateCategory, Decoration } from '@/lib/types'
import { generateId } from '@/lib/data'

interface ImprintTemplateQuickAddProps {
  templates: ImprintTemplate[]
  onApplyTemplate: (decoration: Decoration) => void
  children?: React.ReactNode
}

const CATEGORIES: { value: ImprintTemplateCategory; label: string }[] = [
  { value: 'screen-print', label: 'Screen Print' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'dtg', label: 'DTG' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'custom', label: 'Custom' },
]

export function ImprintTemplateQuickAdd({ templates, onApplyTemplate, children }: ImprintTemplateQuickAddProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const activeTemplates = useMemo(() => {
    return templates.filter((t) => t.isActive)
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return activeTemplates

    const query = searchQuery.toLowerCase()
    return activeTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.decoration.location.toLowerCase().includes(query) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [activeTemplates, searchQuery])

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

  const popularTemplates = useMemo(() => {
    return [...filteredTemplates]
      .filter((t) => t.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
  }, [filteredTemplates])

  const handleApplyTemplate = (template: ImprintTemplate) => {
    const decoration: Decoration = {
      id: generateId('dec'),
      ...template.decoration,
    }
    onApplyTemplate(decoration)
    setOpen(false)
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

  if (activeTemplates.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Sparkle size={16} className="mr-2" />
            Use Template
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-3 pt-2">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-1">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              {popularTemplates.length > 0 && (
                <TabsTrigger value="popular" className="text-xs gap-1">
                  <Star size={12} weight="fill" />
                  Popular
                </TabsTrigger>
              )}
              {CATEGORIES.map((cat) => {
                const count = templatesByCategory[cat.value].length
                return count > 0 ? (
                  <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                    {cat.label}
                  </TabsTrigger>
                ) : null
              })}
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all" className="m-0 p-3 space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No templates found</p>
              ) : (
                filteredTemplates.map((template) => (
                  <TemplateButton key={template.id} template={template} onClick={() => handleApplyTemplate(template)} getCategoryColor={getCategoryColor} />
                ))
              )}
            </TabsContent>

            {popularTemplates.length > 0 && (
              <TabsContent value="popular" className="m-0 p-3 space-y-2">
                {popularTemplates.map((template) => (
                  <TemplateButton key={template.id} template={template} onClick={() => handleApplyTemplate(template)} getCategoryColor={getCategoryColor} />
                ))}
              </TabsContent>
            )}

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="m-0 p-3 space-y-2">
                {templatesByCategory[cat.value].map((template) => (
                  <TemplateButton key={template.id} template={template} onClick={() => handleApplyTemplate(template)} getCategoryColor={getCategoryColor} />
                ))}
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

interface TemplateButtonProps {
  template: ImprintTemplate
  onClick: () => void
  getCategoryColor: (category: ImprintTemplateCategory) => string
}

function TemplateButton({ template, onClick, getCategoryColor }: TemplateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{template.name}</h4>
            {template.usageCount > 0 && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Star size={10} weight="fill" />
                {template.usageCount}
              </Badge>
            )}
          </div>
          {template.description && <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>}
        </div>
        <Badge variant="outline" className={`${getCategoryColor(template.category)} text-xs flex-shrink-0`}>
          {template.customCategory || CATEGORIES.find((c) => c.value === template.category)?.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Location:</span>
          <span className="ml-1 font-medium">{template.decoration.customLocation || template.decoration.location}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Setup:</span>
          <span className="ml-1 font-medium">${template.decoration.setupFee.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-2 text-xs">
        <span className="text-muted-foreground">Colors:</span>
        <span className="ml-1 font-medium truncate">{template.decoration.inkThreadColors}</span>
      </div>

      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </button>
  )
}
