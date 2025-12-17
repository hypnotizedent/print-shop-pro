import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkle, MagnifyingGlass, CheckCircle, WarningCircle, XCircle, X } from '@phosphor-icons/react'
import { ssActivewearAPI, type SSActivewearProduct, type SSActivewearColor } from '@/lib/ssactivewear-api'
import { sanMarAPI, type SanMarProduct, type SanMarColor } from '@/lib/sanmar-api'
import { toast } from 'sonner'
import type { Sizes } from '@/lib/types'

interface InlineSKUSearchProps {
  value: string
  onApply: (productName: string, color: string, sizes: Partial<Sizes>) => void
  onInputChange: (value: string) => void
}

type Supplier = 'ssactivewear' | 'sanmar'
type UnifiedProduct = SSActivewearProduct | SanMarProduct
type UnifiedColor = SSActivewearColor | SanMarColor

export function InlineSKUSearch({ value, onApply, onInputChange }: InlineSKUSearchProps) {
  const [supplier, setSupplier] = useState<Supplier>('ssactivewear')
  const [searchQuery, setSearchQuery] = useState(value)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<UnifiedProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null)
  const [selectedColor, setSelectedColor] = useState<UnifiedColor | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) return

    setLoading(true)
    setSearchResults([])
    
    try {
      let results: UnifiedProduct[] = []
      
      if (supplier === 'ssactivewear') {
        if (!ssActivewearAPI.hasCredentials()) {
          setLoading(false)
          return
        }
        results = await ssActivewearAPI.searchProducts(query)
      } else {
        if (!sanMarAPI.hasCredentials()) {
          setLoading(false)
          return
        }
        results = await sanMarAPI.searchProducts(query)
      }
      
      if (results && results.length > 0) {
        setSearchResults(results)
        setShowResults(true)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      setSearchResults([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.trim()
    debounceTimer.current = setTimeout(() => {
      handleSearch(query)
    }, 400)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery, supplier])

  const handleSelectProduct = (product: UnifiedProduct) => {
    setSelectedProduct(product)
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
    setSearchResults([])
    setShowResults(false)
    setShowColorSelector(true)
  }

  const handleApplyProduct = () => {
    if (!selectedProduct || !selectedColor) return

    const productName = `${selectedProduct.brandName} ${getProductName(selectedProduct)}`
    const colorName = selectedColor.colorName

    const sizes: Partial<Sizes> = {}
    selectedColor.sizes.forEach(size => {
      const sizeKey = size.sizeName.toUpperCase()
      if (['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].includes(sizeKey)) {
        sizes[sizeKey as keyof Sizes] = 0
      }
    })

    onApply(productName, colorName, sizes)
    
    setSelectedProduct(null)
    setSelectedColor(null)
    setShowColorSelector(false)
    setSearchQuery('')
    onInputChange('')
    
    toast.success('Product applied!')
  }

  const handleClearSelection = () => {
    setSelectedProduct(null)
    setSelectedColor(null)
    setShowColorSelector(false)
  }

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
        return { icon: CheckCircle, color: 'text-green-500' }
      case 'medium':
        return { icon: WarningCircle, color: 'text-yellow-500' }
      case 'low':
        return { icon: WarningCircle, color: 'text-orange-500' }
      case 'out':
        return { icon: XCircle, color: 'text-red-500' }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onInputChange(newValue)
  }

  const hasAPICredentials = supplier === 'ssactivewear' 
    ? ssActivewearAPI.hasCredentials() 
    : sanMarAPI.hasCredentials()

  return (
    <div className="relative">
      <div className="flex gap-1">
        <Popover open={showColorSelector} onOpenChange={setShowColorSelector}>
          <PopoverTrigger asChild>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={hasAPICredentials ? "Type to search products..." : "API not configured"}
                className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2 pr-7"
                disabled={!hasAPICredentials}
              />
              {hasAPICredentials && (
                <Sparkle 
                  size={14} 
                  weight="fill" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary pointer-events-none" 
                />
              )}
            </div>
          </PopoverTrigger>
          {selectedProduct && selectedColor && (
            <PopoverContent className="w-96 p-4" align="start">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">SELECTED PRODUCT</div>
                    <div className="font-semibold text-sm">
                      {selectedProduct.brandName} {getProductName(selectedProduct)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleClearSelection}
                  >
                    <X size={14} />
                  </Button>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">SELECT COLOR</div>
                  <Select 
                    value={selectedColor ? (isSanMarColor(selectedColor) ? selectedColor.colorID : selectedColor.colorID.toString()) : undefined} 
                    onValueChange={(colorId) => {
                      const color = selectedProduct.colors.find(c => {
                        if (isSanMarColor(c)) {
                          return c.colorID === colorId
                        }
                        return (c as SSActivewearColor).colorID.toString() === colorId
                      })
                      if (color) {
                        setSelectedColor(color)
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue>
                        {selectedColor && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                              style={{ backgroundColor: `#${selectedColor.colorCode}` }}
                            />
                            <span className="text-sm">{selectedColor.colorName}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.colors.map(color => {
                        const stockInfo = getColorStockLevel(color)
                        const indicator = getStockIndicator(stockInfo.level)
                        const Icon = indicator.icon
                        const colorId = isSanMarColor(color) ? color.colorID : color.colorID.toString()
                        
                        return (
                          <SelectItem key={colorId} value={colorId}>
                            <div className="flex items-center gap-2 w-full">
                              <div
                                className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                                style={{ backgroundColor: `#${color.colorCode}` }}
                              />
                              <span className="flex-1 text-sm">{color.colorName}</span>
                              <div className="flex items-center gap-1">
                                <Icon size={12} className={indicator.color} weight="fill" />
                                <span className={`text-xs ${indicator.color}`}>
                                  {stockInfo.totalQty}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleApplyProduct} className="w-full" size="sm">
                  Apply to Line Item
                </Button>
              </div>
            </PopoverContent>
          )}
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
              title={`Supplier: ${supplier === 'ssactivewear' ? 'SS Activewear' : 'SanMar'}`}
            >
              <span className="text-[10px] font-bold">
                {supplier === 'ssactivewear' ? 'SS' : 'SM'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">SUPPLIER</div>
            <div className="space-y-1">
              <Button
                variant={supplier === 'ssactivewear' ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSupplier('ssactivewear')
                  setSearchResults([])
                  setSelectedProduct(null)
                  setSelectedColor(null)
                  setShowColorSelector(false)
                }}
              >
                SS Activewear
              </Button>
              <Button
                variant={supplier === 'sanmar' ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSupplier('sanmar')
                  setSearchResults([])
                  setSelectedProduct(null)
                  setSelectedColor(null)
                  setShowColorSelector(false)
                }}
              >
                SanMar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
          <ScrollArea className="max-h-64">
            <div className="p-1">
              {searchResults.map((result) => (
                <button
                  key={result.styleID}
                  onClick={() => handleSelectProduct(result)}
                  className="w-full text-left p-2 rounded hover:bg-accent transition-colors flex items-center gap-2"
                >
                  {getProductImage(result) && (
                    <div className="w-10 h-10 flex-shrink-0 bg-muted rounded overflow-hidden">
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
                    <div className="font-medium text-sm truncate">
                      {result.brandName} {getProductName(result)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {result.styleID} • {result.colors?.length || 0} colors
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2">
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
