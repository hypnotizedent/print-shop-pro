import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Star, Plus, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import type { FavoriteProduct, LineItem } from '@/lib/types'
import { createEmptyLineItem, generateId } from '@/lib/data'
import { toast } from 'sonner'

interface FavoriteProductQuickAddProps {
  favorites: FavoriteProduct[]
  onAddToQuote: (item: LineItem) => void
  onUpdateFavorite: (product: FavoriteProduct) => void
}

export function FavoriteProductQuickAdd({ 
  favorites, 
  onAddToQuote,
  onUpdateFavorite 
}: FavoriteProductQuickAddProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredFavorites = favorites.filter(product => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      product.styleName.toLowerCase().includes(query) ||
      product.brandName.toLowerCase().includes(query) ||
      product.styleId.toLowerCase().includes(query) ||
      product.colorName?.toLowerCase().includes(query)
    )
  })

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount
    }
    return new Date(b.lastUsed || b.addedAt).getTime() - new Date(a.lastUsed || a.addedAt).getTime()
  })

  const handleAddProduct = (product: FavoriteProduct) => {
    const newLineItem: LineItem = {
      ...createEmptyLineItem(),
      id: generateId('li'),
      product_name: `${product.brandName} - ${product.styleName}`,
      product_color: product.colorName,
      unit_price: product.wholesalePrice || 0,
    }

    onAddToQuote(newLineItem)

    onUpdateFavorite({
      ...product,
      lastUsed: new Date().toISOString(),
      usageCount: product.usageCount + 1,
    })

    toast.success('Product added to quote', {
      description: `${product.styleName} - ${product.colorName || 'All Colors'}`
    })

    setDialogOpen(false)
  }

  if (favorites.length === 0) {
    return null
  }

  const topFavorites = sortedFavorites.slice(0, 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} weight="fill" className="text-primary" />
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Quick Add Favorites
          </span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View All ({favorites.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star size={20} weight="fill" className="text-primary" />
                Favorite Products
              </DialogTitle>
              <DialogDescription>
                Quick-add your most-used products to this quote
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search favorites..."
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="grid gap-3">
                {sortedFavorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No favorites match your search
                  </div>
                ) : (
                  sortedFavorites.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex gap-4 p-4">
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.styleName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkle size={24} className="text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {product.styleName}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {product.brandName} • {product.styleId}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              className="flex-shrink-0"
                            >
                              <Plus size={14} className="mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {product.colorName && (
                              <Badge variant="secondary" className="text-xs">
                                {product.colorName}
                              </Badge>
                            )}
                            {product.wholesalePrice && (
                              <Badge variant="outline" className="text-xs">
                                ${product.wholesalePrice.toFixed(2)}
                              </Badge>
                            )}
                            {product.usageCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Used {product.usageCount}x
                              </Badge>
                            )}
                          </div>
                          {product.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {product.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {topFavorites.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            size="sm"
            className="h-auto py-2 px-3 flex flex-col items-start gap-1 hover:bg-primary/10 hover:border-primary transition-colors"
            onClick={() => handleAddProduct(product)}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-8 h-8 bg-muted rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.styleName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkle size={14} className="text-muted-foreground/50" />
                )}
              </div>
              <Plus size={14} className="ml-auto text-primary" />
            </div>
            <div className="text-left w-full">
              <div className="text-xs font-semibold truncate">
                {product.styleName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {product.brandName}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
