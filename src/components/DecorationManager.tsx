import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash, Upload, CheckCircle } from '@phosphor-icons/react'
import type { Decoration, DecorationType } from '@/lib/types'
import { generateId } from '@/lib/data'
import { toast } from 'sonner'

interface DecorationManagerProps {
  decorations: Decoration[]
  onChange: (decorations: Decoration[]) => void
}

const STANDARD_LOCATIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Hood']
const DECORATION_METHODS: { value: DecorationType; label: string }[] = [
  { value: 'screen-print', label: 'Screen Printing' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'digital-print', label: 'Digital Print' },
  { value: 'digital-transfer', label: 'Digital Transfer' },
  { value: 'dtg', label: 'DTG' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'other', label: 'Other' },
]

export function DecorationManager({ decorations, onChange }: DecorationManagerProps) {
  const [customInputs, setCustomInputs] = useState<Record<string, { location: boolean; method: boolean }>>({})

  const addDecoration = () => {
    const newDecoration: Decoration = {
      id: generateId('dec'),
      method: 'screen-print',
      location: 'Front',
      inkThreadColors: '',
      setupFee: 0,
    }
    onChange([...decorations, newDecoration])
  }

  const updateDecoration = (id: string, updates: Partial<Decoration>) => {
    onChange(decorations.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const removeDecoration = (id: string) => {
    onChange(decorations.filter(d => d.id !== id))
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
        toast.success(`Artwork uploaded - Detected size: ${imprintSize}`)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
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

  return (
    <div className="space-y-3">
      {decorations.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No decorations added yet
        </div>
      )}

      {decorations.map((decoration, index) => (
        <div key={decoration.id} className="border border-border rounded-lg p-4 bg-card/50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">
              Decoration {index + 1}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeDecoration(decoration.id)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Print Location
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
                    <SelectTrigger className="h-9">
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
                    className="h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      toggleCustomLocation(decoration.id)
                      updateDecoration(decoration.id, { location: 'Front', customLocation: undefined })
                    }}
                    className="h-9 w-9 flex-shrink-0"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Decoration Method
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
                  <SelectTrigger className="h-9">
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
                    className="h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      toggleCustomMethod(decoration.id)
                      updateDecoration(decoration.id, { method: 'screen-print', customMethod: undefined })
                    }}
                    className="h-9 w-9 flex-shrink-0"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Ink / Thread Colors
              </label>
              <Input
                value={decoration.inkThreadColors}
                onChange={(e) => updateDecoration(decoration.id, { inkThreadColors: e.target.value })}
                placeholder="e.g., White, Black"
                className="h-9"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Setup Fee
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={decoration.setupFee}
                  onChange={(e) => updateDecoration(decoration.id, { setupFee: Number(e.target.value) })}
                  className="h-9 tabular-nums"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Artwork
            </label>
            {!decoration.artwork ? (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(decoration.id, e)}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="border border-border rounded-lg p-3 bg-background">
                <div className="flex items-start gap-3">
                  <img
                    src={decoration.artwork.dataUrl}
                    alt={decoration.artwork.fileName}
                    className="w-20 h-20 object-contain bg-muted rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{decoration.artwork.fileName}</div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {decoration.artwork.fileSize && (
                        <div>{(decoration.artwork.fileSize / 1024).toFixed(1)} KB</div>
                      )}
                      {decoration.imprintSize && (
                        <div className="flex items-center gap-1 text-primary">
                          <CheckCircle size={12} weight="fill" />
                          <span>Imprint size: {decoration.imprintSize}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateDecoration(decoration.id, { artwork: undefined, imprintSize: undefined })}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addDecoration}
        className="w-full h-9 text-sm"
      >
        <Plus size={16} className="mr-2" />
        Add Decoration
      </Button>
    </div>
  )
}
