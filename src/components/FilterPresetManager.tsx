import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Bookmark, BookmarkSimple, Plus, Trash, PushPin, PushPinSimple } from '@phosphor-icons/react'
import type { FilterPreset, FilterPresetContext } from '@/lib/types'
import { toast } from 'sonner'
import { generateId } from '@/lib/data'

interface FilterPresetManagerProps {
  context: FilterPresetContext
  currentFilters: {
    statusFilter?: string
    dateSort?: 'asc' | 'desc'
    sortBy?: string
    groupBy?: string
    tierFilter?: string
    customFilters?: Record<string, any>
  }
  presets: FilterPreset[]
  onSavePreset: (preset: FilterPreset) => void
  onLoadPreset: (preset: FilterPreset) => void
  onDeletePreset: (presetId: string) => void
  onTogglePin: (presetId: string) => void
}

export function FilterPresetManager({
  context,
  currentFilters,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onTogglePin,
}: FilterPresetManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  
  const contextPresets = presets.filter(p => p.context === context)
  const pinnedPresets = contextPresets.filter(p => p.isPinned)
  const otherPresets = contextPresets.filter(p => !p.isPinned)
  
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a name for the preset')
      return
    }
    
    const newPreset: FilterPreset = {
      id: generateId('fp'),
      name: presetName.trim(),
      context,
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    }
    
    onSavePreset(newPreset)
    setPresetName('')
    setShowSaveDialog(false)
    toast.success(`Filter preset "${newPreset.name}" saved`)
  }
  
  const handleLoadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset)
    toast.success(`Loaded filter preset: ${preset.name}`)
  }
  
  const handleDeletePreset = (preset: FilterPreset) => {
    if (confirm(`Delete filter preset "${preset.name}"?`)) {
      onDeletePreset(preset.id)
      toast.success(`Deleted filter preset: ${preset.name}`)
    }
  }
  
  const handleTogglePin = (preset: FilterPreset, e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePin(preset.id)
  }
  
  const hasActiveFilters = Object.values(currentFilters).some(v => 
    v !== undefined && v !== 'all' && v !== 'none'
  )
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <BookmarkSimple size={16} />
            Presets
            {contextPresets.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {contextPresets.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filter Presets</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowSaveDialog(true)}
              disabled={!hasActiveFilters}
            >
              <Plus size={14} className="mr-1" />
              Save
            </Button>
          </DropdownMenuLabel>
          
          {contextPresets.length === 0 ? (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No saved presets
              <p className="mt-1 text-xs">Apply filters, then save as preset</p>
            </div>
          ) : (
            <>
              {pinnedPresets.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                    Pinned
                  </DropdownMenuLabel>
                  {pinnedPresets.map(preset => (
                    <DropdownMenuItem
                      key={preset.id}
                      className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <PushPinSimple size={14} weight="fill" className="flex-shrink-0 text-primary" />
                        <span className="truncate text-sm">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleTogglePin(preset, e)}
                        >
                          <PushPin size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePreset(preset)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {otherPresets.length > 0 && <DropdownMenuSeparator />}
                </>
              )}
              
              {otherPresets.length > 0 && (
                <>
                  {pinnedPresets.length > 0 && (
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                      Other Presets
                    </DropdownMenuLabel>
                  )}
                  {otherPresets.map(preset => (
                    <DropdownMenuItem
                      key={preset.id}
                      className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Bookmark size={14} className="flex-shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleTogglePin(preset, e)}
                        >
                          <PushPinSimple size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePreset(preset)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filters as a preset for quick access later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Name</label>
              <Input
                placeholder="e.g., Pending Quotes This Week"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset()
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Filters:</p>
              {Object.entries(currentFilters).map(([key, value]) => {
                if (value === undefined || value === 'all' || value === 'none') return null
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">
                      {key}
                    </Badge>
                    <span className="text-muted-foreground">=</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              <Bookmark size={16} className="mr-2" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
