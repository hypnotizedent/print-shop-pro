import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Bell, Envelope, CalendarBlank, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Quote } from '@/lib/types'

export interface PaymentReminder {
  id: string
  quoteId: string
  enabled: boolean
  intervals: number[]
  lastSentDate?: string
  nextReminderDate?: string
  emailsSent: number
}

interface PaymentRemindersProps {
  quote: Quote
  reminder: PaymentReminder | undefined
  onUpdateReminder: (reminder: PaymentReminder) => void
  onSendManualReminder: () => void
}

export function PaymentReminders({ 
  quote, 
  reminder, 
  onUpdateReminder,
  onSendManualReminder
}: PaymentRemindersProps) {
  const totalPaid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0)
  const remainingBalance = quote.total - totalPaid
  const hasUnpaidBalance = remainingBalance > 0

  const [enabled, setEnabled] = useState(reminder?.enabled ?? true)
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>(
    reminder?.intervals ?? [3, 7, 14]
  )

  const calculateNextReminderDate = () => {
    if (!enabled || remainingBalance <= 0) return undefined

    const quoteSentDate = new Date(quote.created_at)
    const now = new Date()
    const daysSinceSent = Math.floor((now.getTime() - quoteSentDate.getTime()) / (1000 * 60 * 60 * 24))

    for (const interval of selectedIntervals.sort((a, b) => a - b)) {
      const reminderDate = new Date(quoteSentDate)
      reminderDate.setDate(reminderDate.getDate() + interval)
      
      if (reminderDate > now) {
        return reminderDate.toISOString().split('T')[0]
      }
    }

    return undefined
  }

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    const nextDate = checked ? calculateNextReminderDate() : undefined
    
    onUpdateReminder({
      id: reminder?.id ?? `rem-${Date.now()}`,
      quoteId: quote.id,
      enabled: checked,
      intervals: selectedIntervals,
      lastSentDate: reminder?.lastSentDate,
      nextReminderDate: nextDate,
      emailsSent: reminder?.emailsSent ?? 0
    })
    
    toast.success(checked ? 'Payment reminders enabled' : 'Payment reminders disabled')
  }

  const handleIntervalsChange = (intervals: number[]) => {
    setSelectedIntervals(intervals)
    const nextDate = enabled ? calculateNextReminderDate() : undefined
    
    onUpdateReminder({
      id: reminder?.id ?? `rem-${Date.now()}`,
      quoteId: quote.id,
      enabled,
      intervals,
      lastSentDate: reminder?.lastSentDate,
      nextReminderDate: nextDate,
      emailsSent: reminder?.emailsSent ?? 0
    })
  }

  const toggleInterval = (days: number) => {
    const newIntervals = selectedIntervals.includes(days)
      ? selectedIntervals.filter(d => d !== days)
      : [...selectedIntervals, days].sort((a, b) => a - b)
    
    handleIntervalsChange(newIntervals)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not scheduled'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const intervalOptions = [
    { days: 1, label: '1 day' },
    { days: 3, label: '3 days' },
    { days: 7, label: '7 days' },
    { days: 14, label: '14 days' },
    { days: 30, label: '30 days' },
    { days: 60, label: '60 days' }
  ]

  const getDaysOverdue = () => {
    if (!quote.due_date) return 0
    const dueDate = new Date(quote.due_date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const daysOverdue = getDaysOverdue()

  if (!hasUnpaidBalance) {
    return (
      <Card className="p-6 bg-primary/10 border-primary/30">
        <div className="flex items-center gap-3 text-primary">
          <CheckCircle size={32} weight="fill" />
          <div>
            <div className="font-semibold">Fully Paid</div>
            <div className="text-sm opacity-80">No payment reminders needed</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className={`p-4 ${daysOverdue > 0 ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${daysOverdue > 0 ? 'bg-destructive/20' : 'bg-primary/20'}`}>
              {daysOverdue > 0 ? (
                <Warning size={24} className="text-destructive" />
              ) : (
                <Bell size={24} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Payment Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Outstanding balance: <span className="font-bold text-destructive">${remainingBalance.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="reminders-enabled"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="reminders-enabled" className="cursor-pointer text-sm">
              {enabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>

        {daysOverdue > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <Warning size={18} />
              Payment is {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Reminder Schedule</Label>
            <div className="flex flex-wrap gap-2">
              {intervalOptions.map(({ days, label }) => {
                const isSelected = selectedIntervals.includes(days)
                return (
                  <Button
                    key={days}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleInterval(days)}
                    disabled={!enabled}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send reminders at {selectedIntervals.length > 0 ? selectedIntervals.join(', ') : 'no'} days after quote sent
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Last Reminder Sent</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <CalendarBlank size={16} className="text-muted-foreground" />
                {reminder?.lastSentDate ? formatDate(reminder.lastSentDate) : 'Never'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Next Reminder</div>
              <div className={`text-sm font-medium flex items-center gap-2 ${enabled && reminder?.nextReminderDate ? 'text-primary' : ''}`}>
                <CalendarBlank size={16} className={enabled ? 'text-primary' : 'text-muted-foreground'} />
                {enabled && reminder?.nextReminderDate ? formatDate(reminder.nextReminderDate) : 'Not scheduled'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Reminders Sent</div>
            <Badge variant="secondary" className="text-sm">
              {reminder?.emailsSent ?? 0} email{(reminder?.emailsSent ?? 0) !== 1 ? 's' : ''}
            </Badge>
          </div>

          <Separator />

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              onSendManualReminder()
              toast.success('Payment reminder email sent to customer')
            }}
          >
            <Envelope size={18} />
            Send Reminder Now
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-semibold mb-2">Email Template Preview</h4>
        <div className="text-xs text-muted-foreground space-y-2 p-3 bg-background rounded border">
          <p className="font-medium text-foreground">Subject: Payment Reminder - Quote #{quote.quote_number}</p>
          <p>Hi {quote.customer.name},</p>
          <p>This is a friendly reminder about your outstanding balance for Quote #{quote.quote_number}.</p>
          <p className="font-medium">Amount Due: ${remainingBalance.toFixed(2)}</p>
          <p>Quote Total: ${quote.total.toFixed(2)}</p>
          <p>Amount Paid: ${totalPaid.toFixed(2)}</p>
          {quote.due_date && <p>Due Date: {formatDate(quote.due_date)}</p>}
          <p>Please submit payment at your earliest convenience.</p>
          <p>Thank you!</p>
        </div>
      </Card>
    </div>
  )
}
