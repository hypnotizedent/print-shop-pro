import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneRight, CheckCircle, WarningCircle, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Quote, EmailTemplate, EmailNotification } from '@/lib/types'
import { createQuoteReminderEmailFromTemplate } from '@/lib/email-notifications'

interface BulkQuoteRemindersProps {
  quotes: Quote[]
  emailTemplates: EmailTemplate[]
  onSendEmails: (notifications: EmailNotification[]) => void
}

export function BulkQuoteReminders({ quotes, emailTemplates, onSendEmails }: BulkQuoteRemindersProps) {
  const [open, setOpen] = useState(false)
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set())
  const [templateId, setTemplateId] = useState<string>()
  const [previewQuoteId, setPreviewQuoteId] = useState<string>()
  const [filterDays, setFilterDays] = useState<string>('all')

  const sentQuotes = quotes.filter(q => q.status === 'sent')
  
  const getQuoteDaysSinceSent = (quote: Quote) => {
    if (!quote.created_at) return 0
    return Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))
  }

  const filteredQuotes = sentQuotes.filter(quote => {
    if (!quote.customer.email) return false
    if (quote.customer.emailPreferences?.quoteReminders === false) return false
    
    const days = getQuoteDaysSinceSent(quote)
    
    if (filterDays === 'all') return true
    if (filterDays === '3+') return days >= 3
    if (filterDays === '7+') return days >= 7
    if (filterDays === '14+') return days >= 14
    if (filterDays === '30+') return days >= 30
    
    return true
  })

  const quoteReminderTemplates = emailTemplates.filter(t => t.type === 'quote-reminder' && t.isActive)
  const selectedTemplate = quoteReminderTemplates.find(t => t.id === templateId)

  const handleToggleQuote = (quoteId: string) => {
    const newSelected = new Set(selectedQuoteIds)
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId)
    } else {
      newSelected.add(quoteId)
    }
    setSelectedQuoteIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedQuoteIds.size === filteredQuotes.length) {
      setSelectedQuoteIds(new Set())
    } else {
      setSelectedQuoteIds(new Set(filteredQuotes.map(q => q.id)))
    }
  }

  const handleSend = () => {
    if (!selectedTemplate) {
      toast.error('Please select an email template')
      return
    }

    if (selectedQuoteIds.size === 0) {
      toast.error('Please select at least one quote')
      return
    }

    const quotesToSend = filteredQuotes.filter(q => selectedQuoteIds.has(q.id))
    const notifications = quotesToSend.map(quote => 
      createQuoteReminderEmailFromTemplate(quote, selectedTemplate, 'System')
    )

    onSendEmails(notifications)
    toast.success(`Sent ${notifications.length} reminder email${notifications.length > 1 ? 's' : ''}`)
    setOpen(false)
    setSelectedQuoteIds(new Set())
  }

  const previewQuote = filteredQuotes.find(q => q.id === previewQuoteId)
  const previewNotification = previewQuote && selectedTemplate
    ? createQuoteReminderEmailFromTemplate(previewQuote, selectedTemplate, 'System')
    : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PaperPlaneRight size={16} className="mr-2" />
          Bulk Send Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Quote Reminders</DialogTitle>
          <DialogDescription>
            Send reminder emails to multiple pending quotes at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {quoteReminderTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                  {quoteReminderTemplates.length === 0 && (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No quote reminder templates found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Age</Label>
              <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pending Quotes</SelectItem>
                  <SelectItem value="3+">3+ days old</SelectItem>
                  <SelectItem value="7+">7+ days old</SelectItem>
                  <SelectItem value="14+">14+ days old</SelectItem>
                  <SelectItem value="30+">30+ days old</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedQuoteIds.size === filteredQuotes.length ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="text-sm text-muted-foreground">
                {selectedQuoteIds.size} of {filteredQuotes.length} selected
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
            <div className="space-y-2 flex flex-col min-h-0">
              <Label>Select Quotes</Label>
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-3 space-y-2">
                  {filteredQuotes.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No pending quotes found matching the filter
                    </div>
                  ) : (
                    filteredQuotes.map(quote => {
                      const days = getQuoteDaysSinceSent(quote)
                      const isSelected = selectedQuoteIds.has(quote.id)
                      
                      return (
                        <div
                          key={quote.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleToggleQuote(quote.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleQuote(quote.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {quote.quote_number}
                              {quote.nickname && ` - ${quote.nickname}`}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {quote.customer.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                ${quote.total.toFixed(0)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {days} day{days !== 1 ? 's' : ''} ago
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewQuoteId(quote.id)
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2 flex flex-col min-h-0">
              <Label>Email Preview</Label>
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-4">
                  {!previewQuote ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Select a quote to preview the email
                    </div>
                  ) : !selectedTemplate ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Select a template to preview
                    </div>
                  ) : previewNotification ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">To</div>
                        <div className="text-sm">{previewNotification.customerEmail}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Subject</div>
                        <div className="text-sm font-medium">{previewNotification.subject}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Message</div>
                        <div className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                          {previewNotification.body}
                        </div>
                      </div>
                      {previewNotification.attachments && previewNotification.attachments.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2">Attachments</div>
                            <div className="space-y-1">
                              {previewNotification.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline">{att.fileName}</Badge>
                                  <span className="text-muted-foreground">
                                    ({(att.fileSize / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </div>

          {selectedQuoteIds.size > 0 && (
            <div className="p-4 bg-muted/50 border rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={18} className="text-primary" />
                <span>
                  Ready to send <strong>{selectedQuoteIds.size}</strong> reminder email{selectedQuoteIds.size > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {!selectedTemplate && selectedQuoteIds.size > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <WarningCircle size={18} />
                <span>Please select an email template to continue</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedQuoteIds.size === 0 || !selectedTemplate}
          >
            <PaperPlaneRight size={16} className="mr-2" />
            Send {selectedQuoteIds.size > 0 && `(${selectedQuoteIds.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
