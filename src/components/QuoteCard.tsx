import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import type { Quote } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase } from '@phosphor-icons/react'

interface QuoteCardProps {
  quote: Quote
  onClick: () => void
  onConvertToJob?: (quote: Quote) => void
  isExpanded?: boolean
}

export function QuoteCard({ quote, onClick, onConvertToJob, isExpanded }: QuoteCardProps) {
  const itemCount = quote.line_items.reduce((sum, item) => sum + item.quantity, 0)
  const createdAgo = formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })
  
  return (
    <Card 
      className={`p-4 cursor-pointer hover:border-emerald-500/50 transition-all ${
        isExpanded ? 'border-emerald-500' : ''
      }`}
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
        <div className="flex items-center gap-3">
          {quote.status === 'approved' && onConvertToJob && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onConvertToJob(quote)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Briefcase size={16} className="mr-1" />
              Convert to Job
            </Button>
          )}
          <div className="text-right">
            <div className="font-semibold text-lg text-foreground">
              ${quote.total.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {itemCount} items
            </div>
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
