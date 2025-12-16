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
import { EnvelopeSimple } from '@phosphor-icons/react'
import type { Customer, EmailNotification } from '@/lib/types'
import { toast } from 'sonner'
import { generateId } from '@/lib/data'

interface SendCustomEmailDialogProps {
  customer: Customer
  onSendEmail: (notification: EmailNotification) => void
}

const emailTemplates = [
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
  { 
    id: 'delay-notice', 
    name: 'Delay Notice',
    subject: 'Update on your order',
    body: `Hi {name},\n\nI wanted to reach out regarding your order. We're experiencing a slight delay in production, and your order will now be ready by [NEW DATE].\n\nWe apologize for any inconvenience this may cause and appreciate your patience.\n\nBest regards,\nMint Prints Team`
  },
  { 
    id: 'reorder-prompt', 
    name: 'Reorder Prompt',
    subject: 'Ready for another order?',
    body: `Hi {name},\n\nIt's been a while since your last order with us. We'd love to help you with your next project!\n\nReply to this email or give us a call if you're ready to place a new order.\n\nBest regards,\nMint Prints Team`
  },
  { 
    id: 'special-offer', 
    name: 'Special Offer',
    subject: 'Special offer just for you',
    body: `Hi {name},\n\nAs a valued customer, we'd like to offer you [DISCOUNT/OFFER] on your next order.\n\n[DETAILS ABOUT OFFER]\n\nThis offer is valid until [DATE]. Contact us to take advantage of this special pricing!\n\nBest regards,\nMint Prints Team`
  },
]

export function SendCustomEmailDialog({ customer, onSendEmail }: SendCustomEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [toEmail, setToEmail] = useState(customer.email)
  const [isSending, setIsSending] = useState(false)

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      const customerName = customer.name || 'there'
      setSubject(template.subject)
      setBody(template.body.replace('{name}', customerName))
    }
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
    }

    setTimeout(() => {
      onSendEmail(notification)
      toast.success(`Email sent to ${toEmail}`)
      setOpen(false)
      setSelectedTemplate('custom')
      setSubject('')
      setBody('')
      setToEmail(customer.email)
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
                {emailTemplates.map(template => (
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
