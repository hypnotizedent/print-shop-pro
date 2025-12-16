import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Plus, Trash, Pencil, Copy, Info } from '@phosphor-icons/react'
import type { SmsTemplate, SmsTemplateType } from '@/lib/types'
import { generateId } from '@/lib/data'

interface SmsTemplatesProps {
  templates: SmsTemplate[]
  onSaveTemplate: (template: SmsTemplate) => void
  onDeleteTemplate: (templateId: string) => void
}

const templateTypes: { value: SmsTemplateType; label: string }[] = [
  { value: 'payment-reminder', label: 'Payment Reminder' },
  { value: 'order-ready', label: 'Order Ready' },
  { value: 'order-shipped', label: 'Order Shipped' },
  { value: 'quote-approved', label: 'Quote Approved' },
  { value: 'custom', label: 'Custom' },
]

const availableVariables = [
  { key: '{customer_name}', description: 'Customer name' },
  { key: '{company_name}', description: 'Company name (if available)' },
  { key: '{quote_number}', description: 'Quote/job number' },
  { key: '{amount}', description: 'Amount due or total' },
  { key: '{balance}', description: 'Outstanding balance' },
  { key: '{due_date}', description: 'Due date' },
  { key: '{tracking_number}', description: 'Tracking number (for shipped orders)' },
  { key: '{business_name}', description: 'Your business name (Mint Prints)' },
  { key: '{phone}', description: 'Your business phone number' },
]

const defaultTemplates: Record<SmsTemplateType, string> = {
  'payment-reminder': 'Hi {customer_name}, this is a reminder from {business_name}. Your invoice {quote_number} for {amount} is due on {due_date}. Balance: {balance}. Reply STOP to opt out.',
  'order-ready': 'Hi {customer_name}, great news! Your order {quote_number} is ready for pickup at {business_name}. Reply STOP to opt out.',
  'order-shipped': 'Hi {customer_name}, your order {quote_number} has shipped! Tracking: {tracking_number}. Reply STOP to opt out.',
  'quote-approved': 'Hi {customer_name}, your quote {quote_number} has been approved! We\'ll begin production soon. Reply STOP to opt out.',
  'custom': 'Hi {customer_name}, {business_name} here. Reply STOP to opt out.',
}

export function SmsTemplates({ templates, onSaveTemplate, onDeleteTemplate }: SmsTemplatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as SmsTemplateType,
    message: '',
    isActive: true,
  })

  const handleOpenDialog = (template?: SmsTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        type: template.type,
        message: template.message,
        isActive: template.isActive,
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        type: 'custom',
        message: defaultTemplates['custom'],
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTemplate(null)
    setFormData({
      name: '',
      type: 'custom',
      message: '',
      isActive: true,
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    if (!formData.message.trim()) {
      toast.error('Template message is required')
      return
    }

    if (formData.message.length > 320) {
      toast.error('Message is too long. SMS messages should be under 320 characters.')
      return
    }

    const template: SmsTemplate = editingTemplate
      ? {
          ...editingTemplate,
          name: formData.name,
          type: formData.type,
          message: formData.message,
          isActive: formData.isActive,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: generateId('sms'),
          name: formData.name,
          type: formData.type,
          message: formData.message,
          isActive: formData.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

    onSaveTemplate(template)
    toast.success(editingTemplate ? 'Template updated' : 'Template created')
    handleCloseDialog()
  }

  const handleDuplicate = (template: SmsTemplate) => {
    const duplicated: SmsTemplate = {
      id: generateId('sms'),
      name: `${template.name} (Copy)`,
      type: template.type,
      message: template.message,
      isActive: template.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSaveTemplate(duplicated)
    toast.success('Template duplicated')
  }

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(templateId)
      toast.success('Template deleted')
    }
  }

  const handleInsertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      message: prev.message + variable,
    }))
  }

  const handleTypeChange = (type: SmsTemplateType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      message: prev.message || defaultTemplates[type],
    }))
  }

  const characterCount = formData.message.length
  const estimatedSegments = Math.ceil(characterCount / 160)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SMS Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage SMS message templates with dynamic variables
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus size={16} className="mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} SMS Template</DialogTitle>
              <DialogDescription>
                Create reusable SMS templates with dynamic variables for automated messaging
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Payment Reminder - 7 Days"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="template-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="template-message">Message</Label>
                  <div className="text-xs text-muted-foreground">
                    {characterCount} characters • {estimatedSegments} SMS segment{estimatedSegments > 1 ? 's' : ''}
                  </div>
                </div>
                <Textarea
                  id="template-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your SMS message..."
                  rows={6}
                  className="font-mono text-sm"
                />
                {characterCount > 320 && (
                  <p className="text-xs text-destructive mt-1">
                    ⚠️ Message is too long. Keep it under 320 characters for best results.
                  </p>
                )}
              </div>

              <Alert>
                <Info size={16} />
                <AlertDescription className="text-xs ml-2">
                  <strong>Required:</strong> All SMS messages must include "Reply STOP to opt out" for compliance with SMS regulations.
                </AlertDescription>
              </Alert>

              <div>
                <Label className="text-sm font-medium mb-2 block">Available Variables</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableVariables.map((variable) => (
                    <Button
                      key={variable.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                      onClick={() => handleInsertVariable(variable.key)}
                    >
                      <Copy size={12} className="mr-2" />
                      <div className="flex flex-col items-start">
                        <code className="font-mono">{variable.key}</code>
                        <span className="text-muted-foreground text-[10px]">{variable.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="template-active">Active</Label>
                  <p className="text-xs text-muted-foreground">Enable this template for use</p>
                </div>
                <Switch
                  id="template-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No SMS templates yet. Create your first template to get started.
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus size={16} className="mr-2" />
            Create Template
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant={template.isActive ? 'default' : 'secondary'} className="text-xs">
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {templateTypes.find((t) => t.value === template.type)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words">
                    {template.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{template.message.length} characters</span>
                    <span>•</span>
                    <span>{Math.ceil(template.message.length / 160)} segment{Math.ceil(template.message.length / 160) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(template)}
                    title="Edit template"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                    title="Duplicate template"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    title="Delete template"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
