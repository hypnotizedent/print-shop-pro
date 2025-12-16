import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Trash, DotsThree, Pencil, Copy, Image as ImageIcon } from '@phosphor-icons/react'
import type { CustomerArtworkFile } from '@/lib/types'
import { toast } from 'sonner'

interface CustomerArtworkLibraryProps {
  customerId: string
  artworkFiles: CustomerArtworkFile[]
  onSaveArtworkFile: (artwork: CustomerArtworkFile) => void
  onDeleteArtworkFile: (artworkId: string) => void
  onUpdateArtworkFile: (artwork: CustomerArtworkFile) => void
}

export function CustomerArtworkLibrary({
  customerId,
  artworkFiles,
  onSaveArtworkFile,
  onDeleteArtworkFile,
  onUpdateArtworkFile,
}: CustomerArtworkLibraryProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<CustomerArtworkFile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'neck-tag' as CustomerArtworkFile['category'],
    imprintSize: '',
    notes: '',
  })
  const [selectedFile, setSelectedFile] = useState<{ dataUrl: string; fileName: string; fileSize: number } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setSelectedFile({
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name for this artwork')
      return
    }

    if (!selectedFile && !editingArtwork) {
      toast.error('Please select an image file')
      return
    }

    const artworkFile: CustomerArtworkFile = {
      id: editingArtwork?.id || `caf-${Date.now()}`,
      customerId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      imprintSize: formData.imprintSize,
      notes: formData.notes,
      file: selectedFile || editingArtwork!.file,
      uploadedAt: editingArtwork?.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingArtwork) {
      onUpdateArtworkFile(artworkFile)
      toast.success('Artwork updated')
    } else {
      onSaveArtworkFile(artworkFile)
      toast.success('Artwork saved to customer library')
    }

    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false)
    setEditingArtwork(null)
    setFormData({
      name: '',
      description: '',
      category: 'neck-tag',
      imprintSize: '',
      notes: '',
    })
    setSelectedFile(null)
  }

  const handleEdit = (artwork: CustomerArtworkFile) => {
    setEditingArtwork(artwork)
    setFormData({
      name: artwork.name,
      description: artwork.description || '',
      category: artwork.category,
      imprintSize: artwork.imprintSize || '',
      notes: artwork.notes || '',
    })
    setSelectedFile(null)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (artworkId: string) => {
    if (confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      onDeleteArtworkFile(artworkId)
      toast.success('Artwork deleted')
    }
  }

  const handleCopyInfo = (artwork: CustomerArtworkFile) => {
    const info = `${artwork.name}\nCategory: ${getCategoryLabel(artwork.category)}\nSize: ${artwork.imprintSize || 'Not specified'}\n${artwork.description || ''}`
    navigator.clipboard.writeText(info)
    toast.success('Artwork info copied to clipboard')
  }

  const getCategoryLabel = (category: CustomerArtworkFile['category']) => {
    switch (category) {
      case 'neck-tag':
        return 'Neck Tag'
      case 'private-label':
        return 'Private Label'
      case 'logo':
        return 'Logo'
      case 'graphic':
        return 'Graphic'
      case 'other':
        return 'Other'
    }
  }

  const getCategoryColor = (category: CustomerArtworkFile['category']) => {
    switch (category) {
      case 'neck-tag':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'private-label':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'logo':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'graphic':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'other':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          Artwork Library ({artworkFiles.length})
        </h2>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Artwork
        </Button>
      </div>

      {artworkFiles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <ImageIcon size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No artwork files saved yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Save frequently used artwork like neck tags, private labels, or logos to quickly reuse them in quotes.
          </p>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            Add First Artwork
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artworkFiles.map((artwork) => (
            <Card key={artwork.id} className="p-4 relative group">
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DotsThree size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(artwork)}>
                      <Pencil size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyInfo(artwork)}>
                      <Copy size={16} className="mr-2" />
                      Copy Info
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(artwork.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden flex items-center justify-center">
                <img
                  src={artwork.file.dataUrl}
                  alt={artwork.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="font-semibold text-sm truncate">{artwork.name}</div>
                  {artwork.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">{artwork.description}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(artwork.category)}`}>
                    {getCategoryLabel(artwork.category)}
                  </Badge>
                  {artwork.imprintSize && (
                    <Badge variant="outline" className="text-xs">
                      {artwork.imprintSize}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {artwork.file.fileName} • {formatFileSize(artwork.file.fileSize)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingArtwork ? 'Edit Artwork' : 'Add Artwork to Library'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artwork-name">Name *</Label>
              <Input
                id="artwork-name"
                placeholder="e.g., Neck Tag - Black, Company Logo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-category">Category *</Label>
              <select
                id="artwork-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CustomerArtworkFile['category'] })}
              >
                <option value="neck-tag">Neck Tag</option>
                <option value="private-label">Private Label</option>
                <option value="logo">Logo</option>
                <option value="graphic">Graphic</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-description">Description</Label>
              <Textarea
                id="artwork-description"
                placeholder="Optional details about this artwork..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-size">Imprint Size</Label>
              <Input
                id="artwork-size"
                placeholder='e.g., 3" × 2", 4" × 4"'
                value={formData.imprintSize}
                onChange={(e) => setFormData({ ...formData, imprintSize: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-notes">Notes</Label>
              <Textarea
                id="artwork-notes"
                placeholder="Production notes, color requirements, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-file">Artwork File {!editingArtwork && '*'}</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-3">
                    <img
                      src={selectedFile.dataUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded"
                    />
                    <div className="text-sm text-muted-foreground">
                      {selectedFile.fileName} ({formatFileSize(selectedFile.fileSize)})
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Change File
                    </Button>
                  </div>
                ) : editingArtwork ? (
                  <div className="space-y-3">
                    <img
                      src={editingArtwork.file.dataUrl}
                      alt="Current"
                      className="max-h-32 mx-auto rounded"
                    />
                    <div className="text-sm text-muted-foreground">
                      Current: {editingArtwork.file.fileName}
                    </div>
                    <label htmlFor="artwork-file-input">
                      <Button variant="outline" size="sm" asChild>
                        <span>Change File</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={40} className="mx-auto mb-2 text-muted-foreground" />
                    <label htmlFor="artwork-file-input">
                      <Button variant="outline" size="sm" asChild>
                        <span>Select Image</span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, or SVG
                    </p>
                  </div>
                )}
                <input
                  id="artwork-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingArtwork ? 'Update' : 'Save'} Artwork
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
