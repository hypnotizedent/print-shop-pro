import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlass, Sparkle, Warning, FunnelSimple, CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react'
import { ssActivewearAPI, type SSActivewearProduct, type SSActivewearColor, type SSActivewearSize } from '@/lib/ssactivewear-api'
import { sanMarAPI, type SanMarProduct, type SanMarColor, type SanMarSize } from '@/lib/sanmar-api'
import { toast } from 'sonner'
import type { Sizes } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SKULookupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (productName: string, color: string, sizes: Partial<Sizes>) => void
}

type Supplier = 'ssactivewear' | 'sanmar'
type UnifiedProduct = SSActivewearProduct | SanMarProduct
type UnifiedColor = SSActivewearColor | SanMarColor

export function SKULookupDialog({ open, onOpenChange, onApply }: SKULookupDialogProps) {
  const [supplier, setSupplier] = useState<Supplier>('ssactivewear')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<UnifiedProduct[]>([])
  const [product, setProduct] = useState<UnifiedProduct | null>(null)
  const [selectedColor, setSelectedColor] = useState<UnifiedColor | null>(null)
  const [colorFilter, setColorFilter] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setLoading(true)
    setSearchResults([])
    setProduct(null)
    setSelectedColor(null)
    
    try {
      let results: UnifiedProduct[] = []
      
      if (supplier === 'ssactivewear') {
        results = await ssActivewearAPI.searchProducts(searchQuery.trim())
      } else {
        results = await sanMarAPI.searchProducts(searchQuery.trim())
      }
      
      if (results && results.length > 0) {
        setSearchResults(results)
        
        if (results.length === 1) {
          handleSelectProduct(results[0])
          toast.success('Product found!')
        } else {
          toast.success(`Found ${results.length} products`)
        }
      } else {
        toast.error('No products found')
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          toast.error('API not configured. Please add your credentials in Settings.')
        } else {
          toast.error(`Search failed: ${error.message}`)
        }
      } else {
        toast.error('Failed to search products')
      }
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProduct = (selectedProduct: UnifiedProduct) => {
    setProduct(selectedProduct)
    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
      setSelectedColor(selectedProduct.colors[0])
    }
    setSearchResults([])
    setColorFilter('')
  }

  const filteredColors = useMemo(() => {
    if (!product?.colors) return []
    if (!colorFilter.trim()) return product.colors
    
    const filterLower = colorFilter.toLowerCase().trim()
    return product.colors.filter(color => 
      color.colorName.toLowerCase().includes(filterLower)
    )
  }, [product?.colors, colorFilter])

  const isSanMarProduct = (p: UnifiedProduct): p is SanMarProduct => {
    return supplier === 'sanmar'
  }

  const isSanMarColor = (c: UnifiedColor): c is SanMarColor => {
    return supplier === 'sanmar'
  }

  const getProductName = (p: UnifiedProduct): string => {
    if (isSanMarProduct(p)) {
      return p.productName
    }
    return (p as SSActivewearProduct).styleName
  }

  const getProductImage = (p: UnifiedProduct): string | undefined => {
    if (isSanMarProduct(p)) {
      return p.productImage
    }
    return (p as SSActivewearProduct).styleImage
  }

  const getColorImage = (c: UnifiedColor): string | undefined => {
    if (isSanMarColor(c)) {
      return c.colorImage
    }
    return (c as SSActivewearColor).colorFrontImage
  }

  const getColorCount = (p: UnifiedProduct): number => {
    return p.colors?.length || 0
  }

  const getColorStockLevel = (color: UnifiedColor): { level: 'high' | 'medium' | 'low' | 'out', totalQty: number } => {
    let totalQty = 0
    
    if (isSanMarColor(color)) {
      totalQty = color.sizes.reduce((sum, size) => sum + (size.inventory || 0), 0)
    } else {
      totalQty = (color as SSActivewearColor).sizes.reduce((sum, size) => sum + (size.qty || 0), 0)
    }
    
    if (totalQty === 0) return { level: 'out', totalQty }
    if (totalQty < 50) return { level: 'low', totalQty }
    if (totalQty < 200) return { level: 'medium', totalQty }
    return { level: 'high', totalQty }
  }

  const getStockIndicator = (level: 'high' | 'medium' | 'low' | 'out') => {
    switch (level) {
      case 'high':
        return { icon: CheckCircle, color: 'text-green-500', label: 'In Stock', bg: 'bg-green-500/10' }
      case 'medium':
        return { icon: WarningCircle, color: 'text-yellow-500', label: 'Limited', bg: 'bg-yellow-500/10' }
      case 'low':
        return { icon: WarningCircle, color: 'text-orange-500', label: 'Low Stock', bg: 'bg-orange-500/10' }
      case 'out':
        return { icon: XCircle, color: 'text-red-500', label: 'Out of Stock', bg: 'bg-red-500/10' }
    }
  }

  const handleApply = () => {
    if (!product || !selectedColor) {
      toast.error('Please search for a product first')
      return
    }

    const productName = `${product.brandName} ${getProductName(product)}`
    const colorName = selectedColor.colorName

    const sizes: Partial<Sizes> = {}
    selectedColor.sizes.forEach(size => {
      const sizeKey = size.sizeName.toUpperCase()
      if (['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].includes(sizeKey)) {
        sizes[sizeKey as keyof Sizes] = 0
      }
    })

    onApply(productName, colorName, sizes)
    
    setSearchQuery('')
    setSearchResults([])
    setProduct(null)
    setSelectedColor(null)
    onOpenChange(false)
    
    toast.success('Product details applied!')
  }

  const handleColorChange = (colorId: string) => {
    const color = product?.colors.find(c => {
      if (isSanMarColor(c)) {
        return c.colorID === colorId
      }
      return (c as SSActivewearColor).colorID.toString() === colorId
    })
    if (color) {
      setSelectedColor(color)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setProduct(null)
    setSelectedColor(null)
    setColorFilter('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={20} className="text-primary" weight="fill" />
            Product Search
          </DialogTitle>
          <DialogDescription>
            Search for products by name, SKU, or style number
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-3">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplier} onValueChange={(value) => {
                setSupplier(value as Supplier)
                setSearchQuery('')
                setSearchResults([])
                setProduct(null)
                setSelectedColor(null)
              }}>
                <SelectTrigger id="supplier" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssactivewear">SS Activewear</SelectItem>
                  <SelectItem value="sanmar">SanMar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="product-search">Product Name or SKU</Label>
                <Input
                  id="product-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Gildan Softstyle, G500, 18000"
                  className="mt-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading}>
                <MagnifyingGlass size={16} className="mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
          </div>

          {searchResults.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="text-sm font-semibold text-muted-foreground mb-2">
                SEARCH RESULTS ({searchResults.length})
              </div>
              <ScrollArea className="flex-1 border border-border rounded-lg">
                <div className="p-2 space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.styleID}
                      onClick={() => handleSelectProduct(result)}
                      className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        {getProductImage(result) && (
                          <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                            <img 
                              src={getProductImage(result)} 
                              alt={`${result.brandName} ${getProductName(result)}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{result.brandName} {getProductName(result)}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {result.styleID} • {getColorCount(result)} color{getColorCount(result) !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{result.categoryName}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {product && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex gap-4">
                {(selectedColor ? getColorImage(selectedColor) : getProductImage(product)) && (
                  <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                    <img 
                      src={selectedColor ? getColorImage(selectedColor) : getProductImage(product)} 
                      alt={`${product.brandName} ${getProductName(product)}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-muted-foreground mb-1">PRODUCT</div>
                  <div className="text-lg font-bold">{product.brandName} {getProductName(product)}</div>
                  <div className="text-sm text-muted-foreground">{product.categoryName}</div>
                  {selectedColor && (
                    <div className="mt-2 flex items-center gap-2">
                      {(() => {
                        const stockInfo = getColorStockLevel(selectedColor)
                        const indicator = getStockIndicator(stockInfo.level)
                        const Icon = indicator.icon
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${indicator.bg} ${indicator.color}`}>
                            <Icon size={14} weight="fill" />
                            <span>{indicator.label}</span>
                            <span>({stockInfo.totalQty})</span>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="color-filter">Filter Colors</Label>
                      <div className="relative mt-2">
                        <FunnelSimple 
                          size={16} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="color-filter"
                          value={colorFilter}
                          onChange={(e) => setColorFilter(e.target.value)}
                          placeholder="e.g., Black, Navy, Red..."
                          className="pl-9"
                        />
                      </div>
                    </div>
                    {colorFilter && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setColorFilter('')}
                        className="mb-0.5"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="color-select">
                      Color {colorFilter && `(${filteredColors.length} of ${product.colors.length})`}
                    </Label>
                    <Select value={selectedColor ? (isSanMarColor(selectedColor) ? selectedColor.colorID : selectedColor.colorID.toString()) : undefined} onValueChange={handleColorChange}>
                      <SelectTrigger id="color-select" className="mt-2">
                        <SelectValue placeholder="Select a color">
                          {selectedColor && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                                style={{ backgroundColor: `#${selectedColor.colorCode}` }}
                              />
                              <span className="flex-1">{selectedColor.colorName}</span>
                              {(() => {
                                const stockInfo = getColorStockLevel(selectedColor)
                                const indicator = getStockIndicator(stockInfo.level)
                                const Icon = indicator.icon
                                return (
                                  <div className="flex items-center gap-1.5">
                                    <Icon size={14} className={indicator.color} weight="fill" />
                                    <span className={`text-xs ${indicator.color}`}>
                                      {stockInfo.totalQty}
                                    </span>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {filteredColors.length > 0 ? (
                          filteredColors.map(color => {
                            const stockInfo = getColorStockLevel(color)
                            const indicator = getStockIndicator(stockInfo.level)
                            const Icon = indicator.icon
                            const colorId = isSanMarColor(color) ? color.colorID : color.colorID.toString()
                            
                            return (
                              <SelectItem key={colorId} value={colorId}>
                                <div className="flex items-center gap-2 w-full">
                                  <div 
                                    className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                                    style={{ backgroundColor: `#${color.colorCode}` }}
                                  />
                                  <span className="flex-1">{color.colorName}</span>
                                  <div className="flex items-center gap-1.5 ml-2">
                                    <Icon size={14} className={indicator.color} weight="fill" />
                                    <span className={`text-xs font-medium ${indicator.color} min-w-[2rem] text-right`}>
                                      {stockInfo.totalQty}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          })
                        ) : (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No colors match "{colorFilter}"
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-2">AVAILABLE SIZES & STOCK</div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedColor.sizes.map(size => {
                      const stockLevel = size.qty === 0 ? 'out' : size.qty < 10 ? 'low' : size.qty < 50 ? 'medium' : 'high'
                      const indicator = getStockIndicator(stockLevel)
                      const Icon = indicator.icon
                      
                      return (
                        <div 
                          key={size.sizeID} 
                          className={`px-3 py-2 rounded border ${indicator.bg} ${
                            size.qty === 0 ? 'border-red-200 opacity-60' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{size.sizeName}</span>
                            <div className="flex items-center gap-1">
                              <Icon size={12} className={indicator.color} weight="fill" />
                              <span className={`text-xs font-semibold ${indicator.color}`}>
                                {size.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {selectedColor.sizes.some(s => s.qty === 0) && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                      <WarningCircle size={14} className="flex-shrink-0 mt-0.5" weight="fill" />
                      <span>Some sizes are out of stock</span>
                    </div>
                  )}
                </div>
              )}

              {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">PRICING INFO</div>
                  <div className="text-sm">
                    {(() => {
                      const firstSize = selectedColor.sizes[0]
                      if (isSanMarColor(selectedColor)) {
                        return `First size: $${(firstSize as SanMarSize).piecePrice?.toFixed(2) || 'N/A'}`
                      }
                      return `First size: $${(firstSize as SSActivewearSize).price?.toFixed(2) || 'N/A'}`
                    })()}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleApply} className="flex-1">
                  Apply to Line Item
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {((supplier === 'ssactivewear' && !ssActivewearAPI.hasCredentials()) || 
            (supplier === 'sanmar' && !sanMarAPI.hasCredentials())) && (
            <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 flex items-start gap-3">
              <Warning size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">API Not Configured</div>
                <div className="text-muted-foreground">
                  Please configure your {supplier === 'ssactivewear' ? 'SS Activewear' : 'SanMar'} API credentials in Settings &gt; Suppliers to enable SKU lookups.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
