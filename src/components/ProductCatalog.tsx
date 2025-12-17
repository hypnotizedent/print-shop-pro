import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  MagnifyingGlass, 
  Star, 
  Tote,
  TagSimple,
  Note,
  Trash,
  ArrowCounterClockwise,
  Package,
} from '@phosphor-icons/react'
import { ssActivewearAPI } from '@/lib/ssactivewear-api'
import { sanMarAPI } from '@/lib/sanmar-api'
import type { FavoriteProduct, SupplierType } from '@/lib/types'

interface ProductCatalogProps {
  favorites: FavoriteProduct[]
  onAddFavorite: (product: FavoriteProduct) => void
  onRemoveFavorite: (productId: string) => void
  onUpdateFavorite: (product: FavoriteProduct) => void
}

interface CatalogProduct {
  id: string
  supplier: SupplierType
  styleId: string
  styleName: string
  brandName: string
  colorName?: string
  colorCode?: string
  imageUrl?: string
  wholesalePrice?: number
  retailPrice?: number
  category?: string
  sizes?: string[]
  stock?: number
}

export function ProductCatalog({ favorites, onAddFavorite, onRemoveFavorite, onUpdateFavorite }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType>('ssactivewear')
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'brand'>('name')
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [productNotes, setProductNotes] = useState('')
  const [editingFavorite, setEditingFavorite] = useState<FavoriteProduct | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)
    try {
      let results: CatalogProduct[] = []

      if (selectedSupplier === 'ssactivewear') {
        const apiResults = await ssActivewearAPI.searchProducts(searchQuery)
        results = apiResults.map((product: any) => ({
          id: `${product.styleID}-${product.colorCode || 'default'}`,
          supplier: 'ssactivewear' as SupplierType,
          styleId: product.styleID,
          styleName: product.styleName,
          brandName: product.brandName,
          colorName: product.colorName,
          colorCode: product.colorCode,
          imageUrl: product.imageUrl || product.frontImage,
          wholesalePrice: product.wholesalePrice,
          retailPrice: product.msrp,
          category: product.categoryName,
          sizes: product.sizes || [],
        }))
      } else if (selectedSupplier === 'sanmar') {
        const apiResults = await sanMarAPI.searchProducts(searchQuery)
        results = apiResults.map((product: any) => ({
          id: `${product.styleID}-${product.colorCode || 'default'}`,
          supplier: 'sanmar' as SupplierType,
          styleId: product.styleID,
          styleName: product.styleName,
          brandName: product.brandName,
          colorName: product.colorName,
          colorCode: product.colorCode,
          imageUrl: product.imageUrl || product.frontImage,
          wholesalePrice: product.wholesalePrice,
          retailPrice: product.msrp,
          category: product.categoryName,
          sizes: product.sizes || [],
        }))
      }

      setCatalogProducts(results)
      if (results.length === 0) {
        toast.info('No products found')
      } else {
        toast.success(`Found ${results.length} products`)
      }
    } catch (error) {
      toast.error('Failed to search products')
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.some(fav => 
      `${fav.styleId}-${fav.colorCode || 'default'}` === productId
    )
  }

  const toggleFavorite = (product: CatalogProduct) => {
    const productId = product.id
    const existingFavorite = favorites.find(fav => 
      `${fav.styleId}-${fav.colorCode || 'default'}` === productId
    )

    if (existingFavorite) {
      onRemoveFavorite(existingFavorite.id)
      toast.success('Removed from favorites')
    } else {
      setSelectedProduct(product)
      setProductNotes('')
    }
  }

  const handleAddFavorite = () => {
    if (!selectedProduct) return

    const newFavorite: FavoriteProduct = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      supplier: selectedProduct.supplier,
      styleId: selectedProduct.styleId,
      styleName: selectedProduct.styleName,
      brandName: selectedProduct.brandName,
      colorName: selectedProduct.colorName,
      colorCode: selectedProduct.colorCode,
      imageUrl: selectedProduct.imageUrl,
      wholesalePrice: selectedProduct.wholesalePrice,
      retailPrice: selectedProduct.retailPrice,
      category: selectedProduct.category,
      sizes: selectedProduct.sizes,
      notes: productNotes,
      addedAt: new Date().toISOString(),
      usageCount: 0,
    }

    onAddFavorite(newFavorite)
    setSelectedProduct(null)
    setProductNotes('')
    toast.success('Added to favorites')
  }

  const handleEditFavorite = (favorite: FavoriteProduct) => {
    setEditingFavorite(favorite)
    setProductNotes(favorite.notes || '')
  }

  const handleUpdateFavorite = () => {
    if (!editingFavorite) return

    const updated: FavoriteProduct = {
      ...editingFavorite,
      notes: productNotes,
    }

    onUpdateFavorite(updated)
    setEditingFavorite(null)
    setProductNotes('')
    toast.success('Favorite updated')
  }

  const categories = useMemo(() => {
    const cats = new Set<string>()
    catalogProducts.forEach(p => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats).sort()
  }, [catalogProducts])

  const brands = useMemo(() => {
    const brs = new Set<string>()
    catalogProducts.forEach(p => {
      if (p.brandName) brs.add(p.brandName)
    })
    return Array.from(brs).sort()
  }, [catalogProducts])

  const filteredProducts = useMemo(() => {
    let filtered = [...catalogProducts]

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    if (brandFilter !== 'all') {
      filtered = filtered.filter(p => p.brandName === brandFilter)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.styleName.localeCompare(b.styleName)
        case 'price-low':
          return (a.wholesalePrice || 0) - (b.wholesalePrice || 0)
        case 'price-high':
          return (b.wholesalePrice || 0) - (a.wholesalePrice || 0)
        case 'brand':
          return a.brandName.localeCompare(b.brandName)
        default:
          return 0
      }
    })

    return filtered
  }, [catalogProducts, categoryFilter, brandFilter, sortBy])

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })
  }, [favorites])

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-2">Product Catalog</h1>
        <p className="text-sm text-muted-foreground">Browse and save your favorite supplier products</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'favorites')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse" className="gap-2">
              <Package />
              Browse Products
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Star />
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Search products by name or style..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Select value={selectedSupplier} onValueChange={(v) => setSelectedSupplier(v as SupplierType)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ssactivewear">SS Activewear</SelectItem>
                        <SelectItem value="sanmar">SanMar</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <MagnifyingGlass className="mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {catalogProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                    </SelectContent>
                  </Select>

                  {(categoryFilter !== 'all' || brandFilter !== 'all') && (
                    <Button variant="outline" onClick={() => {
                      setCategoryFilter('all')
                      setBrandFilter('all')
                    }}>
                      <ArrowCounterClockwise className="mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        {product.imageUrl && (
                          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                            <img 
                              src={product.imageUrl} 
                              alt={product.styleName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{product.styleName}</h3>
                            <p className="text-xs text-muted-foreground">{product.brandName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(product)}
                            className="flex-shrink-0 p-1 h-auto"
                          >
                            {isFavorite(product.id) ? (
                              <Star className="text-accent" size={20} weight="fill" />
                            ) : (
                              <Star size={20} />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                          {product.colorName && (
                            <Badge variant="outline" className="text-xs">
                              {product.colorName}
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs space-y-0.5">
                            <div className="text-muted-foreground">Style: {product.styleId}</div>
                            {product.wholesalePrice && (
                              <div className="font-semibold text-primary">
                                ${product.wholesalePrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {catalogProducts.length === 0 && !isSearching && (
              <div className="text-center py-12 text-muted-foreground">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>Search for products to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6 mt-6">
            {sortedFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFavorites.map((favorite) => (
                  <Card key={favorite.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      {favorite.imageUrl && (
                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                          <img 
                            src={favorite.imageUrl} 
                            alt={favorite.styleName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{favorite.styleName}</h3>
                          <p className="text-xs text-muted-foreground">{favorite.brandName}</p>
                        </div>
                        <Star className="text-accent flex-shrink-0" size={20} weight="fill" />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {favorite.supplier === 'ssactivewear' ? 'SS Activewear' : 'SanMar'}
                        </Badge>
                        {favorite.category && (
                          <Badge variant="secondary" className="text-xs">
                            {favorite.category}
                          </Badge>
                        )}
                        {favorite.colorName && (
                          <Badge variant="outline" className="text-xs">
                            {favorite.colorName}
                          </Badge>
                        )}
                      </div>

                      {favorite.notes && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {favorite.notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div className="text-xs space-y-0.5">
                          <div className="text-muted-foreground">Style: {favorite.styleId}</div>
                          {favorite.wholesalePrice && (
                            <div className="font-semibold text-primary">
                              ${favorite.wholesalePrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFavorite(favorite)}
                        className="flex-1"
                      >
                        <Note className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onRemoveFavorite(favorite.id)
                          toast.success('Removed from favorites')
                        }}
                        className="flex-1"
                      >
                        <Trash className="mr-2" />
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Star size={48} className="mx-auto mb-4 opacity-50" />
                <p>No favorites saved yet</p>
                <p className="text-sm mt-2">Browse products and click the star icon to save favorites</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Favorites</DialogTitle>
            <DialogDescription>
              Add notes to help remember why this product is useful
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selectedProduct.imageUrl && (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.styleName}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedProduct.styleName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.brandName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Style: {selectedProduct.styleId}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  placeholder="e.g., Great for corporate events, popular color..."
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddFavorite}>
              <Star className="mr-2" weight="fill" />
              Add to Favorites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingFavorite} onOpenChange={(open) => !open && setEditingFavorite(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Favorite</DialogTitle>
            <DialogDescription>
              Update your notes for this product
            </DialogDescription>
          </DialogHeader>
          {editingFavorite && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {editingFavorite.imageUrl && (
                  <img 
                    src={editingFavorite.imageUrl} 
                    alt={editingFavorite.styleName}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{editingFavorite.styleName}</h3>
                  <p className="text-sm text-muted-foreground">{editingFavorite.brandName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Style: {editingFavorite.styleId}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="e.g., Great for corporate events, popular color..."
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFavorite(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFavorite}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
