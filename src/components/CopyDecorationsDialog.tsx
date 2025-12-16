import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass, Copy, Check } from '@phosphor-icons/react'
import type { Quote, LineItem, Decoration } from '@/lib/types'
import { generateId } from '@/lib/data'
import { toast } from 'sonner'

interface CopyDecorationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  previousQuotes: Quote[]
  onCopyDecorations: (decorations: Decoration[]) => void
}

export function CopyDecorationsDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  previousQuotes,
  onCopyDecorations,
}: CopyDecorationsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDecorations, setSelectedDecorations] = useState<Set<string>>(new Set())

  const filteredQuotes = previousQuotes.filter(quote => {
    const searchLower = searchQuery.toLowerCase()
    return (
      quote.quote_number.toLowerCase().includes(searchLower) ||
      quote.nickname?.toLowerCase().includes(searchLower) ||
      quote.line_items.some(item => 
        item.product_name.toLowerCase().includes(searchLower) ||
        item.product_color?.toLowerCase().includes(searchLower)
      )
    )
  })

  const getAllDecorationsFromQuote = (quote: Quote): Array<{ decoration: Decoration; lineItemIndex: number; lineItem: LineItem }> => {
    const decorations: Array<{ decoration: Decoration; lineItemIndex: number; lineItem: LineItem }> = []
    quote.line_items.forEach((item, index) => {
      if (item.decorations && item.decorations.length > 0) {
        item.decorations.forEach(dec => {
          decorations.push({ decoration: dec, lineItemIndex: index, lineItem: item })
        })
      }
    })
    return decorations
  }

  const toggleDecoration = (decorationId: string) => {
    setSelectedDecorations(prev => {
      const next = new Set(prev)
      if (next.has(decorationId)) {
        next.delete(decorationId)
      } else {
        next.add(decorationId)
      }
      return next
    })
  }

  const selectAllFromQuote = (quote: Quote) => {
    const allDecorations = getAllDecorationsFromQuote(quote)
    setSelectedDecorations(prev => {
      const next = new Set(prev)
      allDecorations.forEach(({ decoration }) => {
        next.add(decoration.id)
      })
      return next
    })
  }

  const handleCopy = () => {
    const decorationsToCopy: Decoration[] = []
    
    filteredQuotes.forEach(quote => {
      getAllDecorationsFromQuote(quote).forEach(({ decoration }) => {
        if (selectedDecorations.has(decoration.id)) {
          decorationsToCopy.push({
            ...decoration,
            id: generateId('dec'),
            artwork: decoration.artwork ? {
              ...decoration.artwork,
            } : undefined,
          })
        }
      })
    })

    if (decorationsToCopy.length === 0) {
      toast.error('No decorations selected')
      return
    }

    onCopyDecorations(decorationsToCopy)
    setSelectedDecorations(new Set())
    onOpenChange(false)
    toast.success(`Copied ${decorationsToCopy.length} decoration${decorationsToCopy.length !== 1 ? 's' : ''}`)
  }

  const getDecorationLabel = (decoration: Decoration): string => {
    const location = decoration.customLocation || decoration.location
    const method = decoration.customMethod || decoration.method
    const parts = [location, method]
    if (decoration.inkThreadColors) {
      parts.push(decoration.inkThreadColors)
    }
    if (decoration.imprintSize) {
      parts.push(decoration.imprintSize)
    }
    return parts.join(' • ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Copy Decorations from Previous Quotes</DialogTitle>
          <DialogDescription>
            Select decorations from {customerName}'s previous quotes to copy to the current line item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes by number, nickname, or product..."
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {previousQuotes.length === 0 
                  ? 'No previous quotes found for this customer'
                  : 'No quotes match your search'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuotes.map(quote => {
                  const decorations = getAllDecorationsFromQuote(quote)
                  if (decorations.length === 0) return null

                  const allSelected = decorations.every(({ decoration }) => 
                    selectedDecorations.has(decoration.id)
                  )

                  return (
                    <Card key={quote.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold">
                            {quote.nickname || 'Untitled Quote'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quote.quote_number} • {new Date(quote.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllFromQuote(quote)}
                        >
                          {allSelected ? (
                            <>
                              <Check size={16} className="mr-2" />
                              All Selected
                            </>
                          ) : (
                            <>
                              <Copy size={16} className="mr-2" />
                              Select All
                            </>
                          )}
                        </Button>
                      </div>

                      <Separator className="mb-3" />

                      <div className="space-y-2">
                        {decorations.map(({ decoration, lineItemIndex, lineItem }) => {
                          const isSelected = selectedDecorations.has(decoration.id)
                          return (
                            <button
                              key={decoration.id}
                              onClick={() => toggleDecoration(decoration.id)}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-primary/10 border-primary'
                                  : 'bg-card border-border hover:bg-secondary'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1">
                                    {getDecorationLabel(decoration)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    From: {lineItem.product_name}
                                    {lineItem.product_color && ` - ${lineItem.product_color}`}
                                  </div>
                                  {decoration.artwork && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <img
                                        src={decoration.artwork.dataUrl}
                                        alt="Artwork"
                                        className="w-12 h-12 object-cover rounded border border-border"
                                      />
                                      <div className="text-xs text-muted-foreground">
                                        {decoration.artwork.fileName}
                                        {decoration.artwork.fileSize && (
                                          <> • {(decoration.artwork.fileSize / 1024).toFixed(1)} KB</>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                      <Check size={16} weight="bold" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedDecorations.size} decoration{selectedDecorations.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCopy} disabled={selectedDecorations.size === 0}>
                <Copy size={16} className="mr-2" />
                Copy Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
