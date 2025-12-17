import { useState } from 'react'
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
import { MagnifyingGlass, Sparkle, Warning } from '@phosphor-icons/react'
import { ssActivewearAPI, type SSActivewearProduct, type SSActivewearColor } from '@/lib/ssactivewear-api'
import { toast } from 'sonner'
import type { Sizes } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SKULookupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (productName: string, color: string, sizes: Partial<Sizes>) => void
}

export function SKULookupDialog({ open, onOpenChange, onApply }: SKULookupDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SSActivewearProduct[]>([])
  const [product, setProduct] = useState<SSActivewearProduct | null>(null)
  const [selectedColor, setSelectedColor] = useState<SSActivewearColor | null>(null)

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
      const results = await ssActivewearAPI.searchProducts(searchQuery.trim())
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

  const handleSelectProduct = (selectedProduct: SSActivewearProduct) => {
    setProduct(selectedProduct)
    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
      setSelectedColor(selectedProduct.colors[0])
    }
    setSearchResults([])
  }

  const handleApply = () => {
    if (!product || !selectedColor) {
      toast.error('Please search for a product first')
      return
    }

    const productName = `${product.brandName} ${product.styleName}`
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
    const color = product?.colors.find(c => c.colorID.toString() === colorId)
    if (color) {
      setSelectedColor(color)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setProduct(null)
    setSelectedColor(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={20} className="text-primary" weight="fill" />
            SS Activewear Product Search
          </DialogTitle>
          <DialogDescription>
            Search for products by name, SKU, or style number
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
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
                        {result.styleImage && (
                          <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                            <img 
                              src={result.styleImage} 
                              alt={`${result.brandName} ${result.styleName}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{result.brandName} {result.styleName}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {result.styleID} • {result.colorCount} color{result.colorCount !== 1 ? 's' : ''}
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
                {(selectedColor?.colorFrontImage || product.styleImage) && (
                  <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                    <img 
                      src={selectedColor?.colorFrontImage || product.styleImage} 
                      alt={`${product.brandName} ${product.styleName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-muted-foreground mb-1">PRODUCT</div>
                  <div className="text-lg font-bold">{product.brandName} {product.styleName}</div>
                  <div className="text-sm text-muted-foreground">{product.categoryName}</div>
                </div>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div>
                  <Label htmlFor="color-select">Color</Label>
                  <Select value={selectedColor?.colorID.toString()} onValueChange={handleColorChange}>
                    <SelectTrigger id="color-select" className="mt-2">
                      <SelectValue placeholder="Select a color">
                        {selectedColor && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                              style={{ backgroundColor: `#${selectedColor.colorCode}` }}
                            />
                            <span>{selectedColor.colorName}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map(color => (
                        <SelectItem key={color.colorID} value={color.colorID.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                              style={{ backgroundColor: `#${color.colorCode}` }}
                            />
                            <span>{color.colorName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-2">AVAILABLE SIZES</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor.sizes.map(size => (
                      <div key={size.sizeID} className="px-3 py-1 bg-muted rounded text-sm">
                        {size.sizeName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">PRICING INFO</div>
                  <div className="text-sm">
                    First size: ${selectedColor.sizes[0]?.price?.toFixed(2) || 'N/A'}
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

          {!ssActivewearAPI.hasCredentials() && (
            <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 flex items-start gap-3">
              <Warning size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">API Not Configured</div>
                <div className="text-muted-foreground">
                  Please configure your SS Activewear API credentials in Settings &gt; Suppliers to enable SKU lookups.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
