import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EnvelopeSimple, Paperclip, FileText, X } from '@phosphor-icons/react'
import type { Customer, EmailNotification, EmailTemplate, EmailAttachment } from '@/lib/types'
import { toast } from 'sonner'
import { generateId } from '@/lib/data'

interface SendCustomEmailDialogProps {
  customer: Customer
  emailTemplates?: EmailTemplate[]
  onSendEmail: (notification: EmailNotification) => void
}

const defaultTemplates = [
  { 
    id: 'custom', 
    name: 'Custom Message',
    subject: '',
    body: ''
  },
  { 
    id: 'follow-up', 
    name: 'Quote Follow-up',
    subject: 'Following up on your quote',
    body: `Hi {name},\n\nI wanted to follow up on the quote we sent you. Do you have any questions or would you like to proceed with the order?\n\nPlease let me know if you need any clarification or adjustments.\n\nBest regards,\nMint Prints Team`
  },
  { 
    id: 'thank-you', 
    name: 'Thank You',
    subject: 'Thank you for your business',
    body: `Hi {name},\n\nThank you for choosing Mint Prints for your order! We appreciate your business and look forward to working with you again.\n\nIf you need anything else, please don't hesitate to reach out.\n\nBest regards,\nMint Prints Team`
  },
]

export function SendCustomEmailDialog({ customer, emailTemplates, onSendEmail }: SendCustomEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [toEmail, setToEmail] = useState(customer.email)
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<EmailAttachment[]>([])

  const availableTemplates = emailTemplates && emailTemplates.length > 0 
    ? [defaultTemplates[0], ...emailTemplates.filter(t => t.isActive)] 
    : defaultTemplates

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    const customTemplate = emailTemplates?.find(t => t.id === templateId)
    if (customTemplate) {
      const replacedSubject = customTemplate.subject
        .replace(/\{\{customer_name\}\}/g, customer.name || 'there')
        .replace(/\{\{customer_email\}\}/g, customer.email)
        .replace(/\{\{customer_company\}\}/g, customer.company || '')
      
      const replacedBody = customTemplate.body
        .replace(/\{\{customer_name\}\}/g, customer.name || 'there')
        .replace(/\{\{customer_email\}\}/g, customer.email)
        .replace(/\{\{customer_company\}\}/g, customer.company || '')
      
      setSubject(replacedSubject)
      setBody(replacedBody)
      setAttachments(customTemplate.attachments || [])
      return
    }

    const defaultTemplate = defaultTemplates.find(t => t.id === templateId)
    if (defaultTemplate) {
      const customerName = customer.name || 'there'
      setSubject(defaultTemplate.subject)
      setBody(defaultTemplate.body.replace('{name}', customerName))
      setAttachments([])
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSend = async () => {
    if (!toEmail || !subject || !body) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSending(true)

    const notification: EmailNotification = {
      id: generateId('email'),
      customerId: customer.id,
      customerEmail: toEmail,
      type: 'custom',
      subject: subject,
      body: body,
      sentAt: new Date().toISOString(),
      sentBy: 'Manual',
      status: 'sent',
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setTimeout(() => {
      onSendEmail(notification)
      toast.success(`Email sent to ${toEmail}`)
      setOpen(false)
      setSelectedTemplate('custom')
      setSubject('')
      setBody('')
      setToEmail(customer.email)
      setAttachments([])
      setIsSending(false)
    }, 500)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setToEmail(customer.email)
      setSelectedTemplate('custom')
      setSubject('')
      setBody('')
      setAttachments([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <EnvelopeSimple size={18} className="mr-2" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Custom Email</DialogTitle>
          <DialogDescription>
            Compose and send a custom email notification to {customer.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="customer@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={12}
              className="font-sans resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                id="email-attachment-upload"
                className="hidden"
                multiple
                onChange={handleFileUpload}
              />
              <label htmlFor="email-attachment-upload">
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

          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <strong>Note:</strong> This email will be recorded in the customer's email history and sent to {toEmail || 'the recipient'}.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
