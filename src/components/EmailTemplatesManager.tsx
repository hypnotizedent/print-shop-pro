import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Pencil, Trash, Copy, FileText, Paperclip, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { EmailTemplate, EmailNotificationType, EmailAttachment } from '@/lib/types'

interface EmailTemplatesManagerProps {
  templates: EmailTemplate[]
  onSaveTemplate: (template: EmailTemplate) => void
  onDeleteTemplate: (templateId: string) => void
}

const EMAIL_TYPES: { value: EmailNotificationType; label: string }[] = [
  { value: 'quote-approval-request', label: 'Quote Approval Request' },
  { value: 'quote-approved', label: 'Quote Approved' },
  { value: 'quote-reminder', label: 'Quote Reminder' },
  { value: 'order-status-update', label: 'Order Status Update' },
  { value: 'artwork-approval-request', label: 'Artwork Approval Request' },
  { value: 'artwork-status-update', label: 'Artwork Status Update' },
  { value: 'payment-reminder', label: 'Payment Reminder' },
  { value: 'payment-confirmation', label: 'Payment Confirmation' },
  { value: 'shipping-notification', label: 'Shipping Notification' },
  { value: 'pickup-notification', label: 'Pickup Notification' },
  { value: 'invoice-reminder', label: 'Invoice Reminder' },
  { value: 'invoice-sent', label: 'Invoice Sent' },
  { value: 'marketing-message', label: 'Marketing Message' },
  { value: 'production-update', label: 'Production Update' },
  { value: 'custom', label: 'Custom' },
]

const AVAILABLE_VARIABLES = [
  '{{customer_name}}',
  '{{customer_email}}',
  '{{customer_company}}',
  '{{quote_number}}',
  '{{job_number}}',
  '{{total_amount}}',
  '{{due_date}}',
  '{{order_status}}',
  '{{tracking_number}}',
  '{{payment_amount}}',
  '{{balance_due}}',
]

export function EmailTemplatesManager({ templates, onSaveTemplate, onDeleteTemplate }: EmailTemplatesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as EmailNotificationType,
    subject: '',
    body: '',
    isActive: true,
  })
  const [attachments, setAttachments] = useState<EmailAttachment[]>([])

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    })
    setAttachments(template.attachments || [])
    setIsDialogOpen(true)
  }

  const handleDuplicate = (template: EmailTemplate) => {
    setEditingTemplate(null)
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      type: template.type,
      subject: template.subject,
      body: template.body,
      isActive: false,
    })
    setAttachments(template.attachments || [])
    setIsDialogOpen(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const attachment: EmailAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          dataUrl: event.target?.result as string,
        }
        setAttachments(prev => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!formData.subject.trim()) {
      toast.error('Email subject is required')
      return
    }
    if (!formData.body.trim()) {
      toast.error('Email body is required')
      return
    }

    const usedVariables = AVAILABLE_VARIABLES.filter(v => 
      formData.subject.includes(v) || formData.body.includes(v)
    )

    const template: EmailTemplate = {
      id: editingTemplate?.id || `tpl-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      subject: formData.subject,
      body: formData.body,
      variables: usedVariables,
      isActive: formData.isActive,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSaveTemplate(template)
    toast.success(editingTemplate ? 'Template updated' : 'Template created')
    handleClose()
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      type: 'custom',
      subject: '',
      body: '',
      isActive: true,
    })
    setAttachments([])
  }

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(templateId)
      toast.success('Template deleted')
    }
  }

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + variable,
    }))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const activeTemplates = templates.filter(t => t.isActive)
  const inactiveTemplates = templates.filter(t => !t.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">Create and manage email templates with attachments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null)
              setFormData({
                name: '',
                description: '',
                type: 'custom',
                subject: '',
                body: '',
                isActive: true,
              })
              setAttachments([])
            }}>
              <Plus className="mr-2" size={16} />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
              <DialogDescription>
                Create reusable email templates with dynamic variables and attachments
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Standard Quote Approval"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EmailNotificationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of when to use this template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Your Quote #{{quote_number}} is Ready"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Email Body</Label>
                  <div className="text-xs text-muted-foreground">Insert variables:</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {AVAILABLE_VARIABLES.map(variable => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                      className="text-xs h-7"
                    >
                      {variable}
                    </Button>
                  ))}
                </div>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={12}
                  placeholder="Hi {{customer_name}},&#10;&#10;Your quote is ready for review...&#10;&#10;Best regards,&#10;Mint Prints"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    id="attachment-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="attachment-upload">
                    <div className="flex flex-col items-center gap-2 cursor-pointer">
                      <Paperclip size={24} className="text-muted-foreground" />
                      <div className="text-sm text-muted-foreground text-center">
                        Click to upload attachments
                        <div className="text-xs">Max 10MB per file</div>
                      </div>
                    </div>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <FileText size={16} className="text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{attachment.fileName}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active template
                </Label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeTemplates.length === 0 && inactiveTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No email templates yet</p>
              <p className="text-sm">Create your first template to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTemplates.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Active Templates ({activeTemplates.length})</h4>
          {activeTemplates.map(template => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {EMAIL_TYPES.find(t => t.value === template.type)?.label}
                      </Badge>
                      {template.attachments && template.attachments.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Paperclip size={12} className="mr-1" />
                          {template.attachments.length}
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Subject</div>
                  <div className="text-sm">{template.subject}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Body Preview</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {template.body}
                  </div>
                </div>
                {template.variables.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Variables</div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs font-mono">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {inactiveTemplates.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Inactive Templates ({inactiveTemplates.length})</h4>
          {inactiveTemplates.map(template => (
            <Card key={template.id} className="opacity-60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {EMAIL_TYPES.find(t => t.value === template.type)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    </div>
                    {template.description && (
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
