import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BookmarkSimple } from '@phosphor-icons/react'
import type { Decoration } from '@/lib/types'
import { toast } from 'sonner'

interface SaveDecorationTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  decorations: Decoration[]
  customerId: string
  customerName: string
  onSave: (name: string, description: string) => void
}

export function SaveDecorationTemplateDialog({
  open,
  onOpenChange,
  decorations,
  customerId,
  customerName,
  onSave,
}: SaveDecorationTemplateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }

    onSave(name.trim(), description.trim())
    setName('')
    setDescription('')
    onOpenChange(false)
  }

  const getDecorationSummary = (): string => {
    return decorations.map(d => {
      const location = d.customLocation || d.location
      const method = d.customMethod || d.method
      return `${location} (${method})`
    }).join(', ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkSimple size={24} className="text-primary" weight="fill" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save this decoration setup as a reusable template for {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-1">Decorations to save:</div>
            <div className="text-xs text-muted-foreground">
              {getDecorationSummary()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Team Jersey Setup"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Front logo + back number + sleeve badges"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <BookmarkSimple size={16} className="mr-2" weight="fill" />
              Save Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
