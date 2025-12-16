import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadSimple, X, Check, Clock, Images } from '@phosphor-icons/react'
import type { LegacyArtworkFile } from '@/lib/types'
import { toast } from 'sonner'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ArtworkUploadProps {
  location: string
  artwork?: LegacyArtworkFile
  onUpload: (artwork: LegacyArtworkFile) => void
  onRemove: () => void
  canApprove?: boolean
  onApprove?: (approved: boolean) => void
  allowMultiple?: boolean
  onBulkUpload?: (artworks: LegacyArtworkFile[]) => void
}

export function ArtworkUpload({ 
  location, 
  artwork, 
  onUpload, 
  onRemove,
  canApprove = false,
  onApprove,
  allowMultiple = false,
  onBulkUpload
}: ArtworkUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      onUpload({
        location,
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        approved: false
      })
      toast.success(
        `Artwork uploaded for ${location}`,
        {
          description: `${file.name} (${formatFileSize(file.size)})`,
          duration: 3000,
        }
      )
    }
    reader.readAsDataURL(file)
  }

  const handleMultipleFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('No valid image files found')
      return
    }

    if (imageFiles.length !== files.length) {
      toast.warning(`${files.length - imageFiles.length} non-image files were skipped`)
    }

    const artworkPromises = imageFiles.map(file => {
      return new Promise<LegacyArtworkFile>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          resolve({
            location,
            dataUrl,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            approved: false
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(artworkPromises).then(artworks => {
      if (onBulkUpload) {
        onBulkUpload(artworks)
        const totalSize = artworks.reduce((sum, a) => sum + (a.fileSize || 0), 0)
        toast.success(
          `${artworks.length} file${artworks.length > 1 ? 's' : ''} uploaded`,
          {
            description: `Total size: ${formatFileSize(totalSize)}`,
            duration: 4000,
          }
        )
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (allowMultiple && e.dataTransfer.files.length > 1) {
      handleMultipleFiles(e.dataTransfer.files)
    } else {
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
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
          <div className="text-xs text-muted-foreground capitalize flex items-center justify-between">
            <span>{location.replace('-', ' ')}</span>
            {artwork.fileSize && (
              <span className="text-[10px]">{formatFileSize(artwork.fileSize)}</span>
            )}
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
        {allowMultiple ? (
          <Images size={32} className="text-muted-foreground mb-2" />
        ) : (
          <UploadSimple size={32} className="text-muted-foreground mb-2" />
        )}
        <div className="text-sm font-medium mb-1">
          {allowMultiple ? 'Upload Multiple Files' : 'Upload Artwork'}
        </div>
        <div className="text-xs text-muted-foreground capitalize mb-2">
          {location.replace('-', ' ')}
        </div>
        <div className="text-xs text-muted-foreground">
          {allowMultiple ? 'Drag & drop files or click' : 'Drag & drop or click'}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        className="hidden"
        onChange={(e) => {
          if (allowMultiple && e.target.files && e.target.files.length > 1) {
            handleMultipleFiles(e.target.files)
          } else {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file)
            }
          }
        }}
      />
    </Card>
  )
}
