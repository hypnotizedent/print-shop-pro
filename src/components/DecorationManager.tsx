import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash, Upload, CheckCircle, PencilSimple, CaretDown, CaretRight, Check, X, Copy, DotsSixVertical, Sparkle, Warning, BookmarkSimple, Info, Image as ImageIcon, ArrowsOutCardinal } from '@phosphor-icons/react'
import type { Decoration, DecorationType, ProductType, CustomerDecorationTemplate, CustomerArtworkFile } from '@/lib/types'
import { generateId } from '@/lib/data'
import { toast } from 'sonner'
import { getProductTemplate, validateImprintSize, createCustomerTemplate } from '@/lib/decoration-templates'
import { SaveDecorationTemplateDialog } from '@/components/SaveDecorationTemplateDialog'
import { Badge } from '@/components/ui/badge'

interface DecorationManagerProps {
  decorations: Decoration[]
  onChange: (decorations: Decoration[]) => void
  productType?: ProductType
  customerId?: string
  customerName?: string
  customerTemplates?: CustomerDecorationTemplate[]
  customerArtworkFiles?: CustomerArtworkFile[]
  onSaveTemplate?: (template: CustomerDecorationTemplate) => void
  lineItems?: import('@/lib/types').LineItem[]
  currentItemIndex?: number
  onDuplicateImprint?: (decorationIndex: number) => void
  onMoveImprintToItem?: (decorationIndex: number, toItemIndex: number) => void
  onCopyImprintToItem?: (decorationIndex: number, toItemIndex: number) => void
}

const DEFAULT_LOCATIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Hood']
const DECORATION_METHODS: { value: DecorationType; label: string }[] = [
  { value: 'screen-print', label: 'Screen Printing' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'digital-print', label: 'Digital Print' },
  { value: 'digital-transfer', label: 'Digital Transfer' },
  { value: 'dtg', label: 'DTG' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'other', label: 'Other' },
]

const DECORATION_PRESETS: { name: string; description: string; decorations: Omit<Decoration, 'id'>[] }[] = [
  {
    name: 'Front Logo Only',
    description: 'Single front chest logo',
    decorations: [{
      method: 'screen-print',
      location: 'Front',
      inkThreadColors: '',
      setupFee: 0,
    }]
  },
  {
    name: 'Front + Back',
    description: 'Front chest and full back design',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Front + Back + Left Sleeve',
    description: 'Front, back, and sleeve branding',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Front + Both Sleeves',
    description: 'Front chest with matching sleeve designs',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Right Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'All-Over (Front + Back + Sleeves)',
    description: 'Maximum coverage - 4 locations',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Right Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Embroidered Front + Back',
    description: 'Classic embroidery setup',
    decorations: [
      {
        method: 'embroidery',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'embroidery',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Premium Embroidery (3 Locations)',
    description: 'Front, back, and sleeve embroidery',
    decorations: [
      {
        method: 'embroidery',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'embroidery',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'embroidery',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Hoodie Special (Front + Back + Hood)',
    description: 'Popular hoodie decoration combo',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Hood',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Mixed Method (Screen Front + Embroidery Sleeves)',
    description: 'Combine techniques for premium look',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'embroidery',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'embroidery',
        location: 'Right Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Digital Front + Screen Back',
    description: 'Full color front, solid back',
    decorations: [
      {
        method: 'digital-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Team Jersey (Front + Back + Both Sleeves)',
    description: 'Complete team uniform setup',
    decorations: [
      {
        method: 'screen-print',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Left Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'screen-print',
        location: 'Right Sleeve',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'DTG Full Coverage',
    description: 'Direct-to-garment front and back',
    decorations: [
      {
        method: 'dtg',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'dtg',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
  {
    name: 'Vinyl Transfer (Front + Back)',
    description: 'Heat transfer vinyl setup',
    decorations: [
      {
        method: 'vinyl',
        location: 'Front',
        inkThreadColors: '',
        setupFee: 0,
      },
      {
        method: 'vinyl',
        location: 'Back',
        inkThreadColors: '',
        setupFee: 0,
      }
    ]
  },
]

export function DecorationManager({ 
  decorations, 
  onChange, 
  productType,
  customerId,
  customerName,
  customerTemplates = [],
  customerArtworkFiles = [],
  onSaveTemplate,
  lineItems = [],
  currentItemIndex,
  onDuplicateImprint,
  onMoveImprintToItem,
  onCopyImprintToItem,
}: DecorationManagerProps) {
  const [customInputs, setCustomInputs] = useState<Record<string, { location: boolean; method: boolean }>>({})
  const [collapsedDecorations, setCollapsedDecorations] = useState<Set<string>>(new Set())
  const [editingDecoration, setEditingDecoration] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
  const [artworkLibraryOpen, setArtworkLibraryOpen] = useState(false)
  const [selectingArtworkForDecoration, setSelectingArtworkForDecoration] = useState<string | null>(null)

  const productTemplate = productType ? getProductTemplate(productType) : null
  const STANDARD_LOCATIONS = productTemplate?.suggestedLocations || DEFAULT_LOCATIONS

  const addDecoration = () => {
    const defaultLocation = STANDARD_LOCATIONS[0] || 'Front'
    const newDecoration: Decoration = {
      id: generateId('dec'),
      method: 'screen-print',
      location: defaultLocation,
      inkThreadColors: '',
      setupFee: 0,
    }
    onChange([...decorations, newDecoration])
    setEditingDecoration(newDecoration.id)
  }

  const applyCustomerTemplate = (template: CustomerDecorationTemplate) => {
    const newDecorations = template.decorations.map(d => ({
      ...d,
      id: generateId('dec'),
    }))
    onChange([...decorations, ...newDecorations])
    toast.success(`Applied "${template.name}" template`)
  }

  const handleSaveTemplate = (name: string, description: string) => {
    if (!customerId || !customerName || !onSaveTemplate) return
    
    const template = createCustomerTemplate(customerId, name, decorations, description)
    onSaveTemplate(template)
    toast.success(`Template "${name}" saved`)
  }

  const duplicateDecoration = (decoration: Decoration) => {
    const duplicated: Decoration = {
      ...decoration,
      id: generateId('dec'),
      artwork: decoration.artwork ? {
        ...decoration.artwork,
      } : undefined,
    }
    onChange([...decorations, duplicated])
    toast.success('Decoration duplicated')
  }

  const applyPreset = (preset: typeof DECORATION_PRESETS[0]) => {
    const newDecorations = preset.decorations.map(d => ({
      ...d,
      id: generateId('dec'),
    }))
    onChange([...decorations, ...newDecorations])
    toast.success(`Applied "${preset.name}" preset`)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newDecorations = [...decorations]
    const draggedItem = newDecorations[draggedIndex]
    newDecorations.splice(draggedIndex, 1)
    newDecorations.splice(index, 0, draggedItem)
    
    onChange(newDecorations)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const toggleCollapse = (id: string) => {
    setCollapsedDecorations(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const updateDecoration = (id: string, updates: Partial<Decoration>) => {
    const decoration = decorations.find(d => d.id === id)
    const displayLocation = decoration?.customLocation || decoration?.location || 'Unknown location'
    
    onChange(decorations.map(d => d.id === id ? { ...d, ...updates } : d))
    
    if (updates.artwork === undefined && decoration?.artwork) {
      toast.success(
        `Artwork removed from ${displayLocation}`,
        {
          description: decoration.artwork.fileName,
          duration: 3000,
        }
      )
    }
    
    if (updates.artwork && updates.imprintSize && productType) {
      if (decoration) {
        const validation = validateImprintSize(
          productType,
          decoration.location,
          updates.imprintSize
        )
        if (!validation.valid && validation.warning) {
          toast.warning(validation.warning, { duration: 5000 })
        }
      }
    }
    
    const hasSignificantUpdate = 
      updates.location || 
      updates.method || 
      updates.inkThreadColors !== undefined ||
      updates.setupFee !== undefined
    
    if (hasSignificantUpdate && Object.keys(updates).length === 1) {
      const fieldName = updates.location ? 'Location' : 
                       updates.method ? 'Method' : 
                       updates.inkThreadColors !== undefined ? 'Colors' : 
                       'Setup Fee'
    }
  }

  const removeDecoration = (id: string) => {
    const decoration = decorations.find(d => d.id === id)
    onChange(decorations.filter(d => d.id !== id))
    if (decoration) {
      const displayLocation = decoration.customLocation || decoration.location
      toast.success(
        `Decoration removed`,
        {
          description: `${displayLocation} decoration deleted`,
          duration: 3000,
        }
      )
    }
  }

  const handleFileUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const widthInches = (img.width / 300).toFixed(1)
        const heightInches = (img.height / 300).toFixed(1)
        const imprintSize = `${widthInches}" × ${heightInches}"`
        
        const decoration = decorations.find(d => d.id === id)
        const displayLocation = decoration?.customLocation || decoration?.location || 'Unknown location'

        updateDecoration(id, {
          artwork: {
            dataUrl: e.target?.result as string,
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
            uploadedAt: new Date().toISOString(),
          },
          imprintSize,
        })
        
        const fileSize = file.size < 1024 * 1024 
          ? `${(file.size / 1024).toFixed(1)} KB` 
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        
        toast.success(
          `Artwork uploaded for ${displayLocation}`,
          {
            description: `${file.name} - ${imprintSize} (${fileSize})`,
            duration: 4000,
          }
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const getDecorationSummary = (decoration: Decoration): string => {
    const parts: string[] = []
    const displayLocation = decoration.customLocation || decoration.location
    const displayMethod = decoration.customMethod || DECORATION_METHODS.find(m => m.value === decoration.method)?.label || decoration.method
    
    parts.push(displayLocation)
    parts.push(displayMethod)
    
    if (decoration.inkThreadColors) {
      parts.push(decoration.inkThreadColors)
    }
    
    if (decoration.imprintSize) {
      parts.push(decoration.imprintSize)
    }
    
    return parts.join(' • ')
  }

  const getSingleLineSummary = (decoration: Decoration): string => {
    const displayLocation = decoration.customLocation || decoration.location
    const displayMethod = decoration.customMethod || DECORATION_METHODS.find(m => m.value === decoration.method)?.label || decoration.method
    
    let summary = `${displayLocation} | ${displayMethod}`
    
    if (decoration.inkThreadColors) {
      summary += ` | ${decoration.inkThreadColors}`
    }
    
    if (decoration.artwork) {
      summary += ' | ✓ Art'
    }
    
    return summary
  }

  const isDecorationComplete = (decoration: Decoration): boolean => {
    return !!(
      decoration.location &&
      decoration.method &&
      decoration.inkThreadColors &&
      decoration.artwork
    )
  }

  const toggleCustomLocation = (id: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], location: !prev[id]?.location }
    }))
  }

  const toggleCustomMethod = (id: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], method: !prev[id]?.method }
    }))
  }

  const handleSelectLibraryArtwork = (artwork: CustomerArtworkFile) => {
    if (!selectingArtworkForDecoration) return
    
    updateDecoration(selectingArtworkForDecoration, {
      artwork: {
        dataUrl: artwork.file.dataUrl,
        fileName: artwork.file.fileName,
        fileSize: artwork.file.fileSize,
        uploadedAt: new Date().toISOString(),
      },
      imprintSize: artwork.imprintSize || undefined,
    })
    
    setArtworkLibraryOpen(false)
    setSelectingArtworkForDecoration(null)
    toast.success(`Applied "${artwork.name}" from artwork library`)
  }

  const openArtworkLibrary = (decorationId: string) => {
    setSelectingArtworkForDecoration(decorationId)
    setArtworkLibraryOpen(true)
  }

  const getCategoryLabel = (category: CustomerArtworkFile['category']) => {
    switch (category) {
      case 'neck-tag':
        return 'Neck Tag'
      case 'private-label':
        return 'Private Label'
      case 'logo':
        return 'Logo'
      case 'graphic':
        return 'Graphic'
      case 'other':
        return 'Other'
    }
  }

  const getCategoryColor = (category: CustomerArtworkFile['category']) => {
    switch (category) {
      case 'neck-tag':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'private-label':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'logo':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'graphic':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'other':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const customerArtwork = customerArtworkFiles.filter(af => af.customerId === customerId)


  return (
    <div className="space-y-3">
      {decorations.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No decorations added yet
        </div>
      )}

      {decorations.map((decoration, index) => {
        const isCollapsed = collapsedDecorations.has(decoration.id)
        const isComplete = isDecorationComplete(decoration)
        
        return (
          <div 
            key={decoration.id} 
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg bg-card/50 transition-all ${
              isComplete ? 'border-primary/30' : 'border-border'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleCollapse(decoration.id)}>
              <button 
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing p-1"
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  handleDragStart(index)
                }}
              >
                <DotsSixVertical size={16} weight="bold" />
              </button>
              
              <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
                {isCollapsed ? (
                  <CaretRight size={14} weight="bold" />
                ) : (
                  <CaretDown size={14} weight="bold" />
                )}
              </button>

              <div className="flex-1 min-w-0 text-xs text-foreground font-medium truncate">
                {getSingleLineSummary(decoration)}
              </div>

              {decoration.artwork && (
                <img
                  src={decoration.artwork.dataUrl}
                  alt="Preview"
                  className="w-8 h-8 object-contain bg-muted rounded flex-shrink-0"
                />
              )}

              <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {onDuplicateImprint && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateImprint(index)
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Duplicate imprint"
                  >
                    <Copy size={14} />
                  </Button>
                )}
                
                {!onDuplicateImprint && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateDecoration(decoration)
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Duplicate decoration"
                  >
                    <Copy size={14} />
                  </Button>
                )}
                
                {(onMoveImprintToItem || onCopyImprintToItem) && lineItems.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        title="Move/Copy to another item"
                      >
                        <CaretDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Move or copy to another SKU
                      </div>
                      <DropdownMenuSeparator />
                      {lineItems.map((item, itemIndex) => {
                        if (itemIndex === currentItemIndex) return null
                        return (
                          <div key={item.id}>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              #{itemIndex + 1}: {item.product_name || 'Untitled'}
                            </div>
                            {onCopyImprintToItem && (
                              <DropdownMenuItem onClick={() => onCopyImprintToItem(index, itemIndex)}>
                                <Copy size={14} className="mr-2" />
                                Copy to this item
                              </DropdownMenuItem>
                            )}
                            {onMoveImprintToItem && (
                              <DropdownMenuItem onClick={() => onMoveImprintToItem(index, itemIndex)}>
                                <ArrowsOutCardinal size={14} className="mr-2" />
                                Move to this item
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </div>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeDecoration(decoration.id)
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Delete decoration"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                {productType && productTemplate?.sizeRestrictions[decoration.location] && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 flex items-start gap-2">
                    <Info size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-primary">
                      <strong>Size Limit:</strong> Max {productTemplate.sizeRestrictions[decoration.location].maxWidth} × {productTemplate.sizeRestrictions[decoration.location].maxHeight}
                      {productTemplate.sizeRestrictions[decoration.location].notes && (
                        <span className="text-primary/80"> — {productTemplate.sizeRestrictions[decoration.location].notes}</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Location
                    </label>
                    {!customInputs[decoration.id]?.location ? (
                      <div className="flex gap-1">
                        <Select
                          value={decoration.location}
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              toggleCustomLocation(decoration.id)
                            } else {
                              updateDecoration(decoration.id, { location: value, customLocation: undefined })
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STANDARD_LOCATIONS.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                            <SelectItem value="custom">Other (specify)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Input
                          value={decoration.customLocation || ''}
                          onChange={(e) => updateDecoration(decoration.id, { customLocation: e.target.value, location: e.target.value })}
                          placeholder="Enter custom location"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toggleCustomLocation(decoration.id)
                            updateDecoration(decoration.id, { location: 'Front', customLocation: undefined })
                          }}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Method
                    </label>
                    {!customInputs[decoration.id]?.method ? (
                      <Select
                        value={decoration.method}
                        onValueChange={(value: DecorationType) => {
                          if (value === 'other') {
                            toggleCustomMethod(decoration.id)
                          } else {
                            updateDecoration(decoration.id, { method: value, customMethod: undefined })
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DECORATION_METHODS.map(method => (
                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input
                          value={decoration.customMethod || ''}
                          onChange={(e) => updateDecoration(decoration.id, { customMethod: e.target.value })}
                          placeholder="Enter custom method"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toggleCustomMethod(decoration.id)
                            updateDecoration(decoration.id, { method: 'screen-print', customMethod: undefined })
                          }}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Colors
                    </label>
                    <Input
                      value={decoration.inkThreadColors}
                      onChange={(e) => updateDecoration(decoration.id, { inkThreadColors: e.target.value })}
                      placeholder="e.g., White, Black"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    Artwork {decoration.imprintSize && <span className="text-primary ml-1">({decoration.imprintSize})</span>}
                  </label>
                  {!decoration.artwork ? (
                    <div className="space-y-2">
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-3 py-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <Upload size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Drag & drop or click to upload
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(decoration.id, e)}
                          className="hidden"
                        />
                      </label>
                      {customerId && customerArtwork.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openArtworkLibrary(decoration.id)}
                          className="w-full h-8 text-xs"
                        >
                          <ImageIcon size={14} className="mr-1.5" />
                          Use from Library ({customerArtwork.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-2 bg-background">
                      <div className="flex items-start gap-2">
                        <img
                          src={decoration.artwork.dataUrl}
                          alt={decoration.artwork.fileName}
                          className="w-16 h-16 object-contain bg-muted rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{decoration.artwork.fileName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                            {decoration.artwork.fileSize && (
                              <div>{(decoration.artwork.fileSize / 1024).toFixed(1)} KB</div>
                            )}
                            {decoration.imprintSize && (
                              <div className="flex items-center gap-1 text-primary">
                                <CheckCircle size={11} weight="fill" />
                                <span>{decoration.imprintSize}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="cursor-pointer">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <div>
                                <Upload size={12} />
                              </div>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(decoration.id, e)}
                              className="hidden"
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateDecoration(decoration.id, { artwork: undefined, imprintSize: undefined })}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={addDecoration}
          className="flex-1 h-8 text-xs"
        >
          <Plus size={14} className="mr-1.5" />
          Add Decoration
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-xs px-3">
              <Sparkle size={14} className="mr-1.5" />
              Templates
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {customerId && customerTemplates.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {customerName}'s Templates
                </div>
                {customerTemplates.map((template) => (
                  <DropdownMenuItem 
                    key={template.id} 
                    onClick={() => applyCustomerTemplate(template)}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="font-medium text-xs">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Standard Templates
            </div>
            {DECORATION_PRESETS.map((preset) => (
              <DropdownMenuItem 
                key={preset.name} 
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <div className="font-medium text-xs">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {customerId && onSaveTemplate && decorations.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowSaveTemplateDialog(true)}
            className="h-8 text-xs px-3"
            title="Save current decorations as a custom template"
          >
            <BookmarkSimple size={14} className="mr-1.5" weight="fill" />
            Save
          </Button>
        )}
      </div>

      {customerId && customerName && onSaveTemplate && (
        <SaveDecorationTemplateDialog
          open={showSaveTemplateDialog}
          onOpenChange={setShowSaveTemplateDialog}
          decorations={decorations}
          customerId={customerId}
          customerName={customerName}
          onSave={handleSaveTemplate}
        />
      )}

      <Dialog open={artworkLibraryOpen} onOpenChange={setArtworkLibraryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Artwork from {customerName}'s Library</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            {customerArtwork.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <ImageIcon size={48} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No artwork files saved for this customer yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add artwork to the customer's library from their profile page.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {customerArtwork.map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => handleSelectLibraryArtwork(artwork)}
                    className="border rounded-lg p-3 hover:border-primary hover:bg-primary/5 transition-colors text-left group"
                  >
                    <div className="aspect-square rounded bg-muted mb-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={artwork.file.dataUrl}
                        alt={artwork.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-sm truncate group-hover:text-primary">
                        {artwork.name}
                      </div>
                      {artwork.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {artwork.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(artwork.category)}`}>
                          {getCategoryLabel(artwork.category)}
                        </Badge>
                        {artwork.imprintSize && (
                          <Badge variant="outline" className="text-xs">
                            {artwork.imprintSize}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(artwork.file.fileSize)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
