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
import { Plus, Trash, DotsThree, Pencil, Copy, Image as ImageIcon, ClockCounterClockwise, Upload, CheckCircle, Circle } from '@phosphor-icons/react'
import type { CustomerArtworkFile, ArtworkVersion } from '@/lib/types'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface CustomerArtworkLibraryProps {
  customerId: string
  artworkFiles: CustomerArtworkFile[]
  onSaveArtworkFile: (artwork: CustomerArtworkFile) => void
  onDeleteArtworkFile: (artworkId: string) => void
  onUpdateArtworkFile: (artwork: CustomerArtworkFile) => void
  hideWrapper?: boolean
}

export function CustomerArtworkLibrary({
  customerId,
  artworkFiles,
  onSaveArtworkFile,
  onDeleteArtworkFile,
  onUpdateArtworkFile,
  hideWrapper = false,
}: CustomerArtworkLibraryProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<CustomerArtworkFile | null>(null)
  const [viewingVersionHistory, setViewingVersionHistory] = useState<CustomerArtworkFile | null>(null)
  const [filterProductionReady, setFilterProductionReady] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'neck-tag' as CustomerArtworkFile['category'],
    imprintSize: '',
    notes: '',
    changeNotes: '',
    productionReady: false,
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

    const now = new Date().toISOString()
    const isNewVersion = editingArtwork && selectedFile

    if (editingArtwork && isNewVersion) {
      const previousVersion: ArtworkVersion = {
        versionNumber: editingArtwork.currentVersion,
        file: editingArtwork.file,
        uploadedAt: editingArtwork.updatedAt,
        imprintSize: editingArtwork.imprintSize,
        changeNotes: undefined,
        productionReady: editingArtwork.productionReady,
        productionReadyDate: editingArtwork.productionReadyDate,
      }

      const artworkFile: CustomerArtworkFile = {
        ...editingArtwork,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imprintSize: formData.imprintSize,
        notes: formData.notes,
        file: selectedFile!,
        updatedAt: now,
        currentVersion: editingArtwork.currentVersion + 1,
        versionHistory: [
          ...(editingArtwork.versionHistory || []),
          previousVersion,
        ],
        productionReady: formData.productionReady,
        productionReadyDate: formData.productionReady ? now : undefined,
      }

      const newVersion: ArtworkVersion = {
        versionNumber: artworkFile.currentVersion,
        file: selectedFile!,
        uploadedAt: now,
        imprintSize: formData.imprintSize,
        changeNotes: formData.changeNotes,
        productionReady: formData.productionReady,
        productionReadyDate: formData.productionReady ? now : undefined,
      }
      
      artworkFile.versionHistory = [...(artworkFile.versionHistory || []).slice(-9), newVersion]

      onUpdateArtworkFile(artworkFile)
      toast.success(
        `Artwork updated to version ${artworkFile.currentVersion}`,
        {
          description: formData.changeNotes || `${formData.name} - ${selectedFile!.fileName}`,
          duration: 4000,
        }
      )
    } else if (editingArtwork) {
      const artworkFile: CustomerArtworkFile = {
        ...editingArtwork,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imprintSize: formData.imprintSize,
        notes: formData.notes,
        updatedAt: now,
        productionReady: formData.productionReady,
        productionReadyDate: formData.productionReady ? (editingArtwork.productionReadyDate || now) : undefined,
      }

      onUpdateArtworkFile(artworkFile)
      const statusChange = formData.productionReady !== editingArtwork.productionReady
      if (statusChange && formData.productionReady) {
        toast.success(
          'Artwork marked as production-ready',
          {
            description: formData.name,
            duration: 4000,
          }
        )
      } else if (statusChange && !formData.productionReady) {
        toast.warning(
          'Artwork marked as not production-ready',
          {
            description: formData.name,
            duration: 4000,
          }
        )
      } else {
        toast.success('Artwork updated')
      }
    } else {
      const artworkFile: CustomerArtworkFile = {
        id: `caf-${Date.now()}`,
        customerId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imprintSize: formData.imprintSize,
        notes: formData.notes,
        file: selectedFile!,
        uploadedAt: now,
        updatedAt: now,
        currentVersion: 1,
        versionHistory: [],
        productionReady: formData.productionReady,
        productionReadyDate: formData.productionReady ? now : undefined,
      }

      onSaveArtworkFile(artworkFile)
      const fileSize = selectedFile!.fileSize < 1024 * 1024 
        ? `${(selectedFile!.fileSize / 1024).toFixed(1)} KB` 
        : `${(selectedFile!.fileSize / (1024 * 1024)).toFixed(1)} MB`
      toast.success(
        'Artwork saved to customer library',
        {
          description: `${formData.name} - ${selectedFile!.fileName} (${fileSize})`,
          duration: 4000,
        }
      )
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
      changeNotes: '',
      productionReady: false,
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
      changeNotes: '',
      productionReady: artwork.productionReady || false,
    })
    setSelectedFile(null)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (artworkId: string) => {
    const artwork = artworkFiles.find(a => a.id === artworkId)
    if (confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      onDeleteArtworkFile(artworkId)
      toast.success(
        'Artwork deleted',
        {
          description: artwork?.name || 'Artwork removed from library',
          duration: 3000,
        }
      )
    }
  }

  const handleCopyInfo = (artwork: CustomerArtworkFile) => {
    const info = `${artwork.name}\nCategory: ${getCategoryLabel(artwork.category)}\nSize: ${artwork.imprintSize || 'Not specified'}\n${artwork.description || ''}`
    navigator.clipboard.writeText(info)
    toast.success('Artwork info copied to clipboard')
  }

  const handleToggleProductionReady = (artwork: CustomerArtworkFile) => {
    const now = new Date().toISOString()
    const updatedArtwork: CustomerArtworkFile = {
      ...artwork,
      productionReady: !artwork.productionReady,
      productionReadyDate: !artwork.productionReady ? now : undefined,
      updatedAt: now,
    }
    onUpdateArtworkFile(updatedArtwork)
    toast.success(updatedArtwork.productionReady ? 'Marked as production ready' : 'Production ready status removed')
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

  const filteredArtworkFiles = filterProductionReady
    ? artworkFiles.filter((artwork) => artwork.productionReady)
    : artworkFiles

  const content = (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        {!hideWrapper && (
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Artwork Library ({filteredArtworkFiles.length})
            </h2>
            <div className="flex items-center gap-2">
              <Switch
                id="filter-production-ready"
                checked={filterProductionReady}
                onCheckedChange={setFilterProductionReady}
              />
              <Label htmlFor="filter-production-ready" className="text-xs text-muted-foreground cursor-pointer">
                Production Ready Only
              </Label>
            </div>
          </div>
        )}
        {hideWrapper && (
          <div className="flex items-center gap-2">
            <Switch
              id="filter-production-ready"
              checked={filterProductionReady}
              onCheckedChange={setFilterProductionReady}
            />
            <Label htmlFor="filter-production-ready" className="text-xs text-muted-foreground cursor-pointer">
              Production Ready Only
            </Label>
          </div>
        )}
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Artwork
        </Button>
      </div>

      {filteredArtworkFiles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <ImageIcon size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {filterProductionReady ? 'No production-ready artwork files' : 'No artwork files saved yet'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {filterProductionReady
              ? 'Mark artwork as production ready to see it here.'
              : 'Save frequently used artwork like neck tags, private labels, or logos to quickly reuse them in quotes.'}
          </p>
          {!filterProductionReady && (
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add First Artwork
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArtworkFiles.map((artwork) => (
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
                    <DropdownMenuItem onClick={() => handleToggleProductionReady(artwork)}>
                      {artwork.productionReady ? (
                        <>
                          <Circle size={16} className="mr-2" />
                          Remove Production Ready
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Mark Production Ready
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(artwork)}>
                      <Pencil size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewingVersionHistory(artwork)}>
                      <ClockCounterClockwise size={16} className="mr-2" />
                      Version History ({artwork.currentVersion})
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

              <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden flex items-center justify-center relative">
                {artwork.productionReady && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-emerald-500 text-white border-emerald-600 shadow-lg">
                      <CheckCircle size={14} className="mr-1" weight="fill" />
                      Production Ready
                    </Badge>
                  </div>
                )}
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
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    v{artwork.currentVersion}
                  </Badge>
                  {artwork.productionReady && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle size={12} className="mr-1" weight="fill" />
                      Ready
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {artwork.file.fileName} • {formatFileSize(artwork.file.fileSize)}
                </div>
                
                {artwork.versionHistory && artwork.versionHistory.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {artwork.versionHistory.length} previous version{artwork.versionHistory.length !== 1 ? 's' : ''}
                  </div>
                )}
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

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="production-ready" className="cursor-pointer font-semibold">
                    Production Ready
                  </Label>
                  {formData.productionReady && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle size={12} className="mr-1" weight="fill" />
                      Ready
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mark this artwork as approved and ready for production use
                </p>
              </div>
              <Switch
                id="production-ready"
                checked={formData.productionReady}
                onCheckedChange={(checked) => setFormData({ ...formData, productionReady: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-file">Artwork File {!editingArtwork && '*'}</Label>
              {editingArtwork && selectedFile && (
                <p className="text-xs text-amber-500 mb-2">
                  Uploading a new file will create version {editingArtwork.currentVersion + 1}
                </p>
              )}
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

            {editingArtwork && selectedFile && (
              <div className="space-y-2">
                <Label htmlFor="change-notes">Version Change Notes</Label>
                <Textarea
                  id="change-notes"
                  placeholder="What changed in this version? (optional)"
                  value={formData.changeNotes}
                  onChange={(e) => setFormData({ ...formData, changeNotes: e.target.value })}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  These notes will help you track what changed between versions
                </p>
              </div>
            )}
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

      <Dialog open={!!viewingVersionHistory} onOpenChange={(open) => !open && setViewingVersionHistory(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History - {viewingVersionHistory?.name}</DialogTitle>
          </DialogHeader>

          {viewingVersionHistory && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={viewingVersionHistory.file.dataUrl}
                    alt="Current version"
                    className="w-32 h-32 object-contain rounded border border-border bg-background"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground">
                        Current - v{viewingVersionHistory.currentVersion}
                      </Badge>
                      {viewingVersionHistory.productionReady && (
                        <Badge className="bg-emerald-500 text-white border-emerald-600">
                          <CheckCircle size={12} className="mr-1" weight="fill" />
                          Production Ready
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">File:</span>{' '}
                        {viewingVersionHistory.file.fileName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>{' '}
                        {formatFileSize(viewingVersionHistory.file.fileSize)}
                      </div>
                      {viewingVersionHistory.imprintSize && (
                        <div>
                          <span className="text-muted-foreground">Imprint Size:</span>{' '}
                          {viewingVersionHistory.imprintSize}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Updated:</span>{' '}
                        {new Date(viewingVersionHistory.updatedAt).toLocaleString()}
                      </div>
                      {viewingVersionHistory.productionReady && viewingVersionHistory.productionReadyDate && (
                        <div>
                          <span className="text-muted-foreground">Production Ready Since:</span>{' '}
                          {new Date(viewingVersionHistory.productionReadyDate).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {viewingVersionHistory.versionHistory && viewingVersionHistory.versionHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Previous Versions</h3>
                  <div className="space-y-3">
                    {[...viewingVersionHistory.versionHistory].reverse().map((version, index) => (
                      <div key={version.versionNumber} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={version.file.dataUrl}
                            alt={`Version ${version.versionNumber}`}
                            className="w-24 h-24 object-contain rounded border border-border bg-background"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline">v{version.versionNumber}</Badge>
                              {version.productionReady && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  <CheckCircle size={12} className="mr-1" weight="fill" />
                                  Production Ready
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-muted-foreground">File:</span>{' '}
                                {version.file.fileName}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Size:</span>{' '}
                                {formatFileSize(version.file.fileSize)}
                              </div>
                              {version.imprintSize && (
                                <div>
                                  <span className="text-muted-foreground">Imprint Size:</span>{' '}
                                  {version.imprintSize}
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Date:</span>{' '}
                                {new Date(version.uploadedAt).toLocaleString()}
                              </div>
                              {version.productionReady && version.productionReadyDate && (
                                <div>
                                  <span className="text-muted-foreground">Production Ready Since:</span>{' '}
                                  {new Date(version.productionReadyDate).toLocaleString()}
                                </div>
                              )}
                              {version.changeNotes && (
                                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                  <span className="text-muted-foreground">Notes:</span> {version.changeNotes}
                                </div>
                              )}
                            </div>
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const restoredArtwork: CustomerArtworkFile = {
                                    ...viewingVersionHistory,
                                    file: version.file,
                                    imprintSize: version.imprintSize,
                                    currentVersion: viewingVersionHistory.currentVersion + 1,
                                    updatedAt: new Date().toISOString(),
                                    versionHistory: [
                                      ...(viewingVersionHistory.versionHistory || []),
                                      {
                                        versionNumber: viewingVersionHistory.currentVersion,
                                        file: viewingVersionHistory.file,
                                        uploadedAt: viewingVersionHistory.updatedAt,
                                        imprintSize: viewingVersionHistory.imprintSize,
                                        changeNotes: `Restored from v${version.versionNumber}`,
                                      },
                                    ].slice(-10),
                                  }
                                  onUpdateArtworkFile(restoredArtwork)
                                  setViewingVersionHistory(null)
                                  toast.success(`Restored to version ${version.versionNumber}`)
                                }}
                              >
                                <Upload size={16} className="mr-2" />
                                Restore This Version
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!viewingVersionHistory.versionHistory || viewingVersionHistory.versionHistory.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockCounterClockwise size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No previous versions yet</p>
                  <p className="text-sm mt-1">Upload a new file when editing to create version history</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingVersionHistory(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  if (hideWrapper) {
    return content
  }

  return <Card className="p-6">{content}</Card>
}
