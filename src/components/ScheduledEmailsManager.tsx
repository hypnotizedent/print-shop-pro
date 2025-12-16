import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Clock, CheckCircle, XCircle, Prohibit, Paperclip, FileText, X, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { ScheduledEmail, Customer, EmailTemplate, EmailAttachment } from '@/lib/types'

interface ScheduledEmailsManagerProps {
  scheduledEmails: ScheduledEmail[]
  customers: Customer[]
  templates: EmailTemplate[]
  onScheduleEmail: (email: ScheduledEmail) => void
  onCancelEmail: (emailId: string) => void
  onDeleteEmail: (emailId: string) => void
}

export function ScheduledEmailsManager({
  scheduledEmails,
  customers,
  templates,
  onScheduleEmail,
  onCancelEmail,
  onDeleteEmail,
}: ScheduledEmailsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    templateId: '',
    subject: '',
    body: '',
    scheduledFor: '',
  })
  const [attachments, setAttachments] = useState<EmailAttachment[]>([])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        body: template.body,
      }))
      setAttachments(template.attachments || [])
    }
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

  const handleSchedule = () => {
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }
    if (!formData.subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!formData.body.trim()) {
      toast.error('Email body is required')
      return
    }
    if (!formData.scheduledFor) {
      toast.error('Schedule date and time is required')
      return
    }

    const scheduledDate = new Date(formData.scheduledFor)
    if (scheduledDate <= new Date()) {
      toast.error('Scheduled time must be in the future')
      return
    }

    const customer = customers.find(c => c.id === formData.customerId)
    if (!customer) return

    const email: ScheduledEmail = {
      id: `sch-${Date.now()}`,
      customerId: customer.id,
      customerEmail: customer.email,
      templateId: formData.templateId || undefined,
      subject: formData.subject,
      body: formData.body,
      attachments: attachments.length > 0 ? attachments : undefined,
      scheduledFor: scheduledDate.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    onScheduleEmail(email)
    toast.success(`Email scheduled for ${scheduledDate.toLocaleString()}`)
    handleClose()
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setFormData({
      customerId: '',
      templateId: '',
      subject: '',
      body: '',
      scheduledFor: '',
    })
    setAttachments([])
  }

  const handleCancel = (emailId: string) => {
    if (confirm('Cancel this scheduled email?')) {
      onCancelEmail(emailId)
      toast.success('Email cancelled')
    }
  }

  const handleDelete = (emailId: string) => {
    if (confirm('Delete this email record?')) {
      onDeleteEmail(emailId)
      toast.success('Email deleted')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusBadge = (status: ScheduledEmail['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock size={12} className="mr-1" />Pending</Badge>
      case 'sent':
        return <Badge variant="default" className="bg-green-600"><CheckCircle size={12} className="mr-1" />Sent</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle size={12} className="mr-1" />Failed</Badge>
      case 'cancelled':
        return <Badge variant="outline"><Prohibit size={12} className="mr-1" />Cancelled</Badge>
    }
  }

  const pendingEmails = scheduledEmails.filter(e => e.status === 'pending')
  const sentEmails = scheduledEmails.filter(e => e.status === 'sent')
  const failedEmails = scheduledEmails.filter(e => e.status === 'failed')
  const cancelledEmails = scheduledEmails.filter(e => e.status === 'cancelled')

  const activeTemplates = templates.filter(t => t.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Emails</h3>
          <p className="text-sm text-muted-foreground">Queue emails for later delivery</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} />
              Schedule Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Email</DialogTitle>
              <DialogDescription>
                Schedule an email to be sent at a specific time
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {activeTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledFor">Send Date & Time</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  placeholder="Email message"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    id="schedule-attachment-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="schedule-attachment-upload">
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

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSchedule}>
                  Schedule Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {scheduledEmails.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No scheduled emails</p>
              <p className="text-sm">Schedule an email to send later</p>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingEmails.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Pending ({pendingEmails.length})</h4>
          {pendingEmails.map(email => {
            const customer = customers.find(c => c.id === email.customerId)
            const scheduledDate = new Date(email.scheduledFor)
            
            return (
              <Card key={email.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(email.status)}
                        {email.attachments && email.attachments.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Paperclip size={12} className="mr-1" />
                            {email.attachments.length}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mb-1">{email.subject}</CardTitle>
                      <CardDescription>
                        To: {customer?.name} ({email.customerEmail})
                      </CardDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        Scheduled: {scheduledDate.toLocaleString()} ({formatDistanceToNow(scheduledDate, { addSuffix: true })})
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(email.id)}>
                        <Prohibit size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {email.body}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {sentEmails.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Sent ({sentEmails.length})</h4>
          {sentEmails.map(email => {
            const customer = customers.find(c => c.id === email.customerId)
            
            return (
              <Card key={email.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(email.status)}
                      </div>
                      <CardTitle className="text-base mb-1">{email.subject}</CardTitle>
                      <CardDescription>
                        To: {customer?.name} ({email.customerEmail})
                      </CardDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sent: {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(email.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {failedEmails.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Failed ({failedEmails.length})</h4>
          {failedEmails.map(email => {
            const customer = customers.find(c => c.id === email.customerId)
            
            return (
              <Card key={email.id} className="border-destructive">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(email.status)}
                      </div>
                      <CardTitle className="text-base mb-1">{email.subject}</CardTitle>
                      <CardDescription>
                        To: {customer?.name} ({email.customerEmail})
                      </CardDescription>
                      {email.errorMessage && (
                        <div className="text-xs text-destructive mt-1">
                          Error: {email.errorMessage}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(email.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {cancelledEmails.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Cancelled ({cancelledEmails.length})</h4>
          {cancelledEmails.map(email => {
            const customer = customers.find(c => c.id === email.customerId)
            
            return (
              <Card key={email.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(email.status)}
                      </div>
                      <CardTitle className="text-base mb-1">{email.subject}</CardTitle>
                      <CardDescription>
                        To: {customer?.name} ({email.customerEmail})
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(email.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
