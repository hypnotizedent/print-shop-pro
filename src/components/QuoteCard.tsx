import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from './StatusBadge'
import type { Quote } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, FileText } from '@phosphor-icons/react'
import { exportInvoiceAsPDF } from '@/lib/invoice-generator'
import { toast } from 'sonner'

interface QuoteCardProps {
  quote: Quote
  onClick: () => void
  onConvertToJob?: (quote: Quote) => void
  isExpanded?: boolean
  isSelected?: boolean
  onToggleSelect?: (quoteId: string) => void
}

export function QuoteCard({ quote, onClick, onConvertToJob, isExpanded, isSelected, onToggleSelect }: QuoteCardProps) {
  const itemCount = quote.line_items.reduce((sum, item) => sum + item.quantity, 0)
  const createdAgo = formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })
  
  const allArtwork = quote.line_items.flatMap(item => item.artwork || [])
  const artworkCount = allArtwork.length
  
  const handleExportInvoice = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quote.status === 'approved') {
      exportInvoiceAsPDF(quote)
      toast.success('Exporting invoice...')
    } else {
      toast.error('Only approved quotes can be exported as invoices')
    }
  }
  
  return (
    <Card 
      className={`p-4 cursor-pointer hover:border-primary/50 transition-all ${
        isExpanded ? 'border-primary' : ''
      } ${isSelected ? 'bg-primary/5 border-primary/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(quote.id)}
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{quote.quote_number}</span>
                {quote.nickname && (
                  <span className="text-sm text-muted-foreground">({quote.nickname})</span>
                )}
                <StatusBadge status={quote.status} />
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {quote.customer.company || quote.customer.name}
              </div>
              {artworkCount > 0 && (
                <div className="flex gap-1 mb-2">
                  {allArtwork.slice(0, 3).map((art, idx) => (
                    <div 
                      key={idx}
                      className="w-8 h-8 rounded border border-border overflow-hidden flex-shrink-0"
                    >
                      <img 
                        src={art.dataUrl} 
                        alt={art.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {artworkCount > 3 && (
                    <div className="w-8 h-8 rounded border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{artworkCount - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {quote.status === 'approved' && (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleExportInvoice}
                  >
                    <FileText size={16} className="mr-1" />
                    Invoice
                  </Button>
                  {onConvertToJob && (
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onConvertToJob(quote)
                      }}
                    >
                      <Briefcase size={16} className="mr-1" />
                      Convert to Job
                    </Button>
                  )}
                </>
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
        </div>
      </div>
    </Card>
  )
}
