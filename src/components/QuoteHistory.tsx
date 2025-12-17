import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Circle, 
  CheckCircle, 
  XCircle, 
  PaperPlaneTilt,
  CurrencyDollar,
  Clock,
  User
} from '@phosphor-icons/react'
import type { Quote, Payment } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface QuoteHistoryProps {
  quote: Quote
}

type HistoryEvent = {
  id: string
  type: 'status_change' | 'payment' | 'created'
  timestamp: string
  title: string
  description?: string
  icon: typeof Circle
  iconColor: string
  amount?: number
}

export function QuoteHistory({ quote }: QuoteHistoryProps) {
  const historyEvents = useMemo(() => {
    const events: HistoryEvent[] = []
    
    events.push({
      id: 'created',
      type: 'created',
      timestamp: quote.created_at,
      title: 'Quote Created',
      description: `Quote #${quote.quote_number} was created`,
      icon: Circle,
      iconColor: 'text-muted-foreground'
    })
    
    if (quote.status === 'sent' || quote.status === 'approved' || quote.status === 'rejected') {
      const sentDate = quote.created_at
      events.push({
        id: 'sent',
        type: 'status_change',
        timestamp: sentDate,
        title: 'Quote Sent',
        description: `Sent to ${quote.customer.email || quote.customer.name}`,
        icon: PaperPlaneTilt,
        iconColor: 'text-blue-500'
      })
    }
    
    if (quote.status === 'approved') {
      const approvedDate = quote.created_at
      events.push({
        id: 'approved',
        type: 'status_change',
        timestamp: approvedDate,
        title: 'Quote Approved',
        description: `Approved by ${quote.customer.name}`,
        icon: CheckCircle,
        iconColor: 'text-primary'
      })
    }
    
    if (quote.status === 'rejected') {
      const rejectedDate = quote.created_at
      events.push({
        id: 'rejected',
        type: 'status_change',
        timestamp: rejectedDate,
        title: 'Quote Rejected',
        description: `Rejected by ${quote.customer.name}`,
        icon: XCircle,
        iconColor: 'text-destructive'
      })
    }
    
    if (quote.payments && quote.payments.length > 0) {
      quote.payments.forEach((payment: Payment) => {
        events.push({
          id: payment.id,
          type: 'payment',
          timestamp: payment.receivedDate,
          title: 'Payment Received',
          description: `${payment.method}${payment.reference ? ` - ${payment.reference}` : ''}`,
          icon: CurrencyDollar,
          iconColor: 'text-green-500',
          amount: payment.amount
        })
      })
    }
    
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [quote])
  
  const totalPaid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0)
  const balance = quote.total - totalPaid
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          History
        </div>
        {quote.payments && quote.payments.length > 0 && (
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="bg-background">
              Paid: ${totalPaid.toFixed(2)}
            </Badge>
            {balance > 0 && (
              <Badge variant="outline" className="bg-background">
                Balance: ${balance.toFixed(2)}
              </Badge>
            )}
            {balance === 0 && totalPaid > 0 && (
              <Badge className="bg-green-500 text-white">
                Paid in Full
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <Card className="p-4">
        {historyEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No history available
          </div>
        ) : (
          <div className="space-y-4">
            {historyEvents.map((event, index) => {
              const Icon = event.icon
              const isLast = index === historyEvents.length - 1
              
              return (
                <div key={event.id} className="flex gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-border" />
                  )}
                  
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center ${event.iconColor} relative z-10`}>
                    <Icon size={14} weight="bold" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.title}</div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {event.amount !== undefined && (
                          <div className="text-sm font-semibold text-green-600">
                            +${event.amount.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
