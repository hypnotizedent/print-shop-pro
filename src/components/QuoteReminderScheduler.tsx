import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Eye, PaperPlaneRight, Calendar, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Quote, EmailTemplate, EmailNotification } from '@/lib/types'
import { createQuoteReminderEmailFromTemplate } from '@/lib/email-notifications'

interface QuoteReminderSchedulerProps {
  quote: Quote
  emailTemplates: EmailTemplate[]
  onSendEmail: (notification: EmailNotification) => void
}

interface ReminderSchedule {
  enabled: boolean
  intervals: number[]
  templateId?: string
}

export function QuoteReminderScheduler({ quote, emailTemplates, onSendEmail }: QuoteReminderSchedulerProps) {
  const [schedule, setSchedule] = useState<ReminderSchedule>({
    enabled: false,
    intervals: [3, 7, 14],
    templateId: undefined,
  })
  const [newInterval, setNewInterval] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const quoteReminderTemplates = emailTemplates.filter(t => t.type === 'quote-reminder' && t.isActive)
  const selectedTemplate = quoteReminderTemplates.find(t => t.id === schedule.templateId)

  const daysSinceSent = quote.created_at 
    ? Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const nextReminderDays = schedule.intervals
    .filter(interval => interval > daysSinceSent)
    .sort((a, b) => a - b)[0]

  const canSendNow = quote.status === 'sent' && quote.customer.emailPreferences?.quoteReminders !== false

  const handleAddInterval = () => {
    const days = parseInt(newInterval)
    if (days > 0 && !schedule.intervals.includes(days)) {
      setSchedule({
        ...schedule,
        intervals: [...schedule.intervals, days].sort((a, b) => a - b)
      })
      setNewInterval('')
    }
  }

  const handleRemoveInterval = (days: number) => {
    setSchedule({
      ...schedule,
      intervals: schedule.intervals.filter(d => d !== days)
    })
  }

  const handleSendNow = () => {
    if (!selectedTemplate) {
      toast.error('Please select an email template first')
      return
    }

    const notification = createQuoteReminderEmailFromTemplate(quote, selectedTemplate, 'System')
    onSendEmail(notification)
    toast.success(`Reminder email sent to ${quote.customer.email}`)
  }

  const handleSave = () => {
    toast.success('Reminder schedule saved')
  }

  const renderPreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Select a template to preview
        </div>
      )
    }

    const notification = createQuoteReminderEmailFromTemplate(quote, selectedTemplate, 'System')
    
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">To</Label>
          <div className="text-sm">{quote.customer.email}</div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Subject</Label>
          <div className="text-sm font-medium">{notification.subject}</div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground">Message</Label>
          <div className="mt-2 p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
            {notification.body}
          </div>
        </div>
        {notification.attachments && notification.attachments.length > 0 && (
          <>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Attachments</Label>
              <div className="mt-2 space-y-2">
                {notification.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{att.fileName}</Badge>
                    <span className="text-xs text-muted-foreground">
                      ({(att.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Quote Reminder Scheduling
        </CardTitle>
        <CardDescription>
          Automatically remind customers about pending quotes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Automatic Reminders</Label>
            <div className="text-sm text-muted-foreground">
              Send reminders at scheduled intervals
            </div>
          </div>
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(enabled) => setSchedule({ ...schedule, enabled })}
          />
        </div>

        {schedule.enabled && (
          <>
            <Separator />
            
            <div className="space-y-3">
              <Label>Email Template</Label>
              <Select
                value={schedule.templateId}
                onValueChange={(templateId) => setSchedule({ ...schedule, templateId })}
              >
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
                      No quote reminder templates found.
                      <br />
                      Create one in Settings → Email Templates
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Reminder Intervals (days after quote sent)</Label>
              <div className="flex gap-2">
                {schedule.intervals.map(days => (
                  <Badge key={days} variant="secondary" className="gap-1.5">
                    Day {days}
                    <button
                      onClick={() => handleRemoveInterval(days)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Days"
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddInterval()
                    }
                  }}
                  className="w-24"
                />
                <Button
                  onClick={handleAddInterval}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={16} className="mr-1" />
                  Add Interval
                </Button>
              </div>
            </div>

            {nextReminderDays && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Next Reminder Scheduled</div>
                    <div className="text-sm text-muted-foreground">
                      Day {nextReminderDays} ({nextReminderDays - daysSinceSent} days from now)
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Eye size={16} className="mr-2" />
                    Preview Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Email Preview</DialogTitle>
                    <DialogDescription>
                      Preview how this reminder will look with real customer data
                    </DialogDescription>
                  </DialogHeader>
                  {renderPreview()}
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleSendNow}
                disabled={!canSendNow || !selectedTemplate}
                className="flex-1"
              >
                <PaperPlaneRight size={16} className="mr-2" />
                Send Now
              </Button>
            </div>

            {!canSendNow && (
              <div className="text-sm text-muted-foreground">
                {quote.status !== 'sent' && '⚠️ Quote must be in "sent" status to send reminders'}
                {quote.customer.emailPreferences?.quoteReminders === false && '⚠️ Customer has disabled quote reminders'}
              </div>
            )}
          </>
        )}

        <Separator />

        <Button onClick={handleSave} className="w-full">
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  )
}
