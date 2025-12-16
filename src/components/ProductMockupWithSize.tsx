import { ProductMockup } from './ProductMockup'
import type { ProductType, ArtworkFile } from '@/lib/types'
import { useState } from 'react'

interface ProductMockupWithSizeProps {
  productType: ProductType
  color?: string
  artwork?: ArtworkFile[]
  size?: 'small' | 'medium'
}

export function ProductMockupWithSize({ 
  productType, 
  color = '#94a3b8', 
  artwork,
  size = 'small'
}: ProductMockupWithSizeProps) {
  const [hoveredArtwork, setHoveredArtwork] = useState<ArtworkFile | null>(null)
  
  const hasArtwork = artwork && artwork.length > 0
  const displayArtwork = hoveredArtwork || (hasArtwork ? artwork[0] : null)
  
  if (size === 'small') {
    return (
      <div className="relative group">
        <div className="w-12 h-12 flex-shrink-0">
          <ProductMockup
            productType={productType}
            color={color}
            size="small"
            showPrintArea={!!displayArtwork}
          />
        </div>
        
        {hasArtwork && (
          <div className="absolute top-0 left-14 hidden group-hover:block z-10 bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[280px]">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <ProductMockup
                  productType={productType}
                  color={color}
                  size="medium"
                  showPrintArea={!!displayArtwork}
                  view={displayArtwork?.location.includes('back') ? 'back' : 'front'}
                />
              </div>
              <div className="flex-1 space-y-2">
                {artwork.map((art, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      hoveredArtwork === art 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onMouseEnter={() => setHoveredArtwork(art)}
                    onMouseLeave={() => setHoveredArtwork(null)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 border border-border rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={art.dataUrl} 
                          alt={art.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate capitalize">{art.location}</div>
                        {art.fileSize && (
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(art.fileSize)}
                          </div>
                        )}
                      </div>
                    </div>
                    {art.fileSize && (
                      <ImprintSize fileSize={art.fileSize} />
                    )}
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
        <ProductMockup
          productType={productType}
          color={color}
          size={size}
          showPrintArea={!!displayArtwork}
          view={displayArtwork?.location.includes('back') ? 'back' : 'front'}
        />
      </div>
      {hasArtwork && (
        <div className="flex-1 space-y-2">
          {artwork.map((art, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                hoveredArtwork === art 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
              onMouseEnter={() => setHoveredArtwork(art)}
              onMouseLeave={() => setHoveredArtwork(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 border border-border rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={art.dataUrl} 
                    alt={art.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate capitalize">{art.location}</div>
                  <div className="text-xs text-muted-foreground truncate">{art.fileName}</div>
                  {art.fileSize && (
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(art.fileSize)}
                    </div>
                  )}
                </div>
              </div>
              {art.fileSize && (
                <ImprintSize fileSize={art.fileSize} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ImprintSize({ fileSize }: { fileSize: number }) {
  const dimensions = estimateImprintSize(fileSize)
  
  return (
    <div className="bg-muted rounded p-2 space-y-1">
      <div className="text-xs font-medium text-muted-foreground">Estimated Imprint Size</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">{dimensions.width}"</span>
          <span className="text-xs text-muted-foreground">W</span>
        </div>
        <span className="text-muted-foreground">×</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">{dimensions.height}"</span>
          <span className="text-xs text-muted-foreground">H</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {dimensions.area} sq in
      </div>
    </div>
  )
}

function estimateImprintSize(fileSize: number): { width: number; height: number; area: number } {
  const sizeInMB = fileSize / (1024 * 1024)
  
  let width: number
  let height: number
  
  if (sizeInMB < 0.5) {
    width = 4
    height = 4
  } else if (sizeInMB < 1) {
    width = 8
    height = 6
  } else if (sizeInMB < 2) {
    width = 10
    height = 8
  } else if (sizeInMB < 5) {
    width = 12
    height = 10
  } else {
    width = 14
    height = 12
  }
  
  return {
    width,
    height,
    area: width * height
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
