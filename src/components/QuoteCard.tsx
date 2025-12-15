import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import type { Quote } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface QuoteCardProps {
  quote: Quote
  onClick: () => void
}

export function QuoteCard({ quote, onClick }: QuoteCardProps) {
  const itemCount = quote.line_items.reduce((sum, item) => sum + item.quantity, 0)
  const createdAgo = formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:border-slate-600 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{quote.quote_number}</span>
            <StatusBadge status={quote.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            {quote.customer.company || quote.customer.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg text-foreground">
            ${quote.total.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {itemCount} items
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {quote.status === 'sent' ? `Sent ${createdAgo}` : 
         quote.status === 'draft' ? 'Draft' :
         quote.status === 'approved' ? `Approved ${createdAgo}` :
         createdAgo}
      </div>
    </Card>
  )
}
