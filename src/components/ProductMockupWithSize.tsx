import { ProductMockup } from './ProductMockup'
import type { ProductType, Decoration } from '@/lib/types'
import { useState } from 'react'

interface ProductMockupWithSizeProps {
  productType: ProductType
  color?: string
  decorations?: Decoration[]
  size?: 'small' | 'medium'
}

export function ProductMockupWithSize({ 
  productType, 
  color = '#94a3b8', 
  decorations,
  size = 'small'
}: ProductMockupWithSizeProps) {
  const [hoveredDecoration, setHoveredDecoration] = useState<Decoration | null>(null)
  
  const decorationsWithArtwork = decorations?.filter(d => d.artwork) || []
  const decorationsWithMockup = decorations?.filter(d => d.mockup) || []
  const hasDecorations = decorationsWithArtwork.length > 0
  const displayDecoration = hoveredDecoration || (hasDecorations ? decorationsWithArtwork[0] : null)
  
  const hasMockup = decorationsWithMockup.length > 0
  
  if (size === 'small') {
    return (
      <div className="relative group">
        <div className="w-12 h-12 flex-shrink-0">
          {hasMockup && decorationsWithMockup[0].mockup ? (
            <img 
              src={decorationsWithMockup[0].mockup.dataUrl}
              alt="Product mockup"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <ProductMockup
              productType={productType}
              color={color}
              size="small"
              showPrintArea={!!displayDecoration}
            />
          )}
        </div>
        
        {(hasDecorations || hasMockup) && (
          <div className="absolute top-0 left-14 hidden group-hover:block z-10 bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[280px]">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {hasMockup && decorationsWithMockup[0].mockup ? (
                  <img 
                    src={decorationsWithMockup[0].mockup.dataUrl}
                    alt="Product mockup"
                    className="w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <ProductMockup
                    productType={productType}
                    color={color}
                    size="medium"
                    showPrintArea={!!displayDecoration}
                    view={displayDecoration?.location.toLowerCase().includes('back') ? 'back' : 'front'}
                  />
                )}
              </div>
              <div className="flex-1 space-y-2">
                {decorationsWithArtwork.map((decoration) => (
                  <div 
                    key={decoration.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      hoveredDecoration === decoration 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onMouseEnter={() => setHoveredDecoration(decoration)}
                    onMouseLeave={() => setHoveredDecoration(null)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 border border-border rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={decoration.artwork!.dataUrl} 
                          alt={decoration.artwork!.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate capitalize">{decoration.location}</div>
                        {decoration.imprintSize && (
                          <div className="text-xs text-muted-foreground">
                            {decoration.imprintSize}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        {hasMockup && decorationsWithMockup[0].mockup ? (
          <img 
            src={decorationsWithMockup[0].mockup.dataUrl}
            alt="Product mockup"
            className="w-48 h-48 object-cover rounded"
          />
        ) : (
          <ProductMockup
            productType={productType}
            color={color}
            size={size}
            showPrintArea={!!displayDecoration}
            view={displayDecoration?.location.toLowerCase().includes('back') ? 'back' : 'front'}
          />
        )}
      </div>
      {hasDecorations && (
        <div className="flex-1 space-y-2">
          {decorationsWithArtwork.map((decoration) => (
            <div 
              key={decoration.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                hoveredDecoration === decoration 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
              onMouseEnter={() => setHoveredDecoration(decoration)}
              onMouseLeave={() => setHoveredDecoration(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 border border-border rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={decoration.artwork!.dataUrl} 
                    alt={decoration.artwork!.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate capitalize">{decoration.location}</div>
                  <div className="text-xs text-muted-foreground truncate">{decoration.method}</div>
                  {decoration.imprintSize && (
                    <div className="text-xs text-primary font-medium">
                      {decoration.imprintSize}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

