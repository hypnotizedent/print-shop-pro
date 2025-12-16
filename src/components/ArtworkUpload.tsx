import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadSimple, X, Check, Clock } from '@phosphor-icons/react'
import type { ArtworkFile } from '@/lib/types'

interface ArtworkUploadProps {
  location: string
  artwork?: ArtworkFile
  onUpload: (artwork: ArtworkFile) => void
  onRemove: () => void
  canApprove?: boolean
  onApprove?: (approved: boolean) => void
}

export function ArtworkUpload({ 
  location, 
  artwork, 
  onUpload, 
  onRemove,
  canApprove = false,
  onApprove
}: ArtworkUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      onUpload({
        location,
        dataUrl,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        approved: false
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  if (artwork) {
    return (
      <Card className="relative group">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
          <img 
            src={artwork.dataUrl} 
            alt={`Artwork for ${location}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            {canApprove && onApprove && (
              <Button
                size="sm"
                variant={artwork.approved ? "default" : "secondary"}
                onClick={() => onApprove(!artwork.approved)}
                className="h-7 px-2"
              >
                {artwork.approved ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Approved
                  </>
                ) : (
                  <>
                    <Clock size={14} className="mr-1" />
                    Pending
                  </>
                )}
              </Button>
            )}
            <Button
              size="icon"
              variant="destructive"
              onClick={onRemove}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </Button>
          </div>
          {artwork.approved && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
              <Check size={12} weight="bold" />
              Approved
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="text-xs font-medium truncate" title={artwork.fileName}>
            {artwork.fileName}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {location.replace('-', ' ')}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-500/10' 
          : 'border-border hover:border-muted-foreground/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="aspect-square flex flex-col items-center justify-center p-4 text-center">
        <UploadSimple size={32} className="text-muted-foreground mb-2" />
        <div className="text-sm font-medium mb-1">Upload Artwork</div>
        <div className="text-xs text-muted-foreground capitalize mb-2">
          {location.replace('-', ' ')}
        </div>
        <div className="text-xs text-muted-foreground">
          Drag & drop or click
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
        }}
      />
    </Card>
  )
}
