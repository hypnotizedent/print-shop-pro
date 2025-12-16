import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Warning, CurrencyDollar, Envelope, CalendarBlank, Bell } from '@phosphor-icons/react'
import type { Quote, PaymentReminder } from '@/lib/types'

interface UnpaidBalancesReportProps {
  quotes: Quote[]
  reminders: PaymentReminder[]
  onSelectQuote: (quote: Quote) => void
}

export function UnpaidBalancesReport({ quotes, reminders, onSelectQuote }: UnpaidBalancesReportProps) {
  const quotesWithBalance = quotes
    .map(quote => {
      const totalPaid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0)
      const balance = quote.total - totalPaid
      const reminder = reminders.find(r => r.quoteId === quote.id)
      
      const daysSinceSent = quote.created_at 
        ? Math.floor((new Date().getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0
      
      const daysOverdue = quote.due_date 
        ? Math.floor((new Date().getTime() - new Date(quote.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        quote,
        balance,
        totalPaid,
        reminder,
        daysSinceSent,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0
      }
    })
    .filter(item => item.balance > 0)
    .sort((a, b) => b.balance - a.balance)

  const totalUnpaid = quotesWithBalance.reduce((sum, item) => sum + item.balance, 0)
  const totalOverdue = quotesWithBalance
    .filter(item => item.daysOverdue > 0)
    .reduce((sum, item) => sum + item.balance, 0)
  const overdueCount = quotesWithBalance.filter(item => item.daysOverdue > 0).length

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <CurrencyDollar size={24} className="text-destructive" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Unpaid</div>
              <div className="text-2xl font-bold text-destructive">${totalUnpaid.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{quotesWithBalance.length} quotes with balance</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/30 rounded-lg">
              <Warning size={24} className="text-destructive" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Overdue Balance</div>
              <div className="text-2xl font-bold text-destructive">${totalOverdue.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{overdueCount} overdue quotes</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Envelope size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Reminders</div>
              <div className="text-2xl font-bold text-foreground">
                {reminders.filter(r => r.enabled).length}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {reminders.reduce((sum, r) => sum + r.emailsSent, 0)} emails sent
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Unpaid Quotes</h3>
        
        {quotesWithBalance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            All quotes are fully paid! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {quotesWithBalance.map(({ quote, balance, totalPaid, reminder, daysSinceSent, daysOverdue }) => (
              <Card 
                key={quote.id} 
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  daysOverdue > 0 ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
                onClick={() => onSelectQuote(quote)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {quote.nickname || quote.quote_number}
                      </span>
                      {daysOverdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <Warning size={12} className="mr-1" />
                          {daysOverdue} days overdue
                        </Badge>
                      )}
                      {reminder?.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Bell size={12} className="mr-1" />
                          Reminders On
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      {quote.customer.name} {quote.customer.company && `• ${quote.customer.company}`}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Quote Total</div>
                        <div className="font-medium">${quote.total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Paid</div>
                        <div className="font-medium text-primary">${totalPaid.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Balance</div>
                        <div className="font-bold text-destructive">${balance.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Due Date</div>
                        <div className={`font-medium ${daysOverdue > 0 ? 'text-destructive' : ''}`}>
                          {formatDate(quote.due_date)}
                        </div>
                      </div>
                    </div>

                    {reminder && (
                      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
                        {reminder.lastSentDate && (
                          <span>Last reminder: {formatDate(reminder.lastSentDate)}</span>
                        )}
                        {reminder.nextReminderDate && reminder.enabled && (
                          <span>Next: {formatDate(reminder.nextReminderDate)}</span>
                        )}
                        {reminder.emailsSent > 0 && (
                          <span>{reminder.emailsSent} reminder{reminder.emailsSent !== 1 ? 's' : ''} sent</span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    onSelectQuote(quote)
                  }}>
                    View Quote
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
