import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './StatusBadge'
import type { Quote, QuoteStatus } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, FileText, EnvelopeSimple, DotsThree, CaretDown } from '@phosphor-icons/react'
import { exportInvoiceAsPDF } from '@/lib/invoice-generator'
import { sendInvoiceEmail } from '@/lib/invoice-email'
import { toast } from 'sonner'

interface QuoteCardProps {
  quote: Quote
  onClick: () => void
  onConvertToJob?: (quote: Quote) => void
  onStatusChange?: (quoteId: string, status: QuoteStatus) => void
  isExpanded?: boolean
  isSelected?: boolean
  onToggleSelect?: (quoteId: string) => void
}

export function QuoteCard({ quote, onClick, onConvertToJob, onStatusChange, isExpanded, isSelected, onToggleSelect }: QuoteCardProps) {
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
  
  const handleSendInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quote.status === 'approved') {
      await sendInvoiceEmail(quote)
      toast.success('Email draft opened')
    } else {
      toast.error('Only approved quotes can be sent as invoices')
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
                <span className="text-xs text-muted-foreground">{quote.quote_number}</span>
                <div onClick={(e) => e.stopPropagation()}>
                  {onStatusChange ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex">
                          <StatusBadge status={quote.status} />
                          <CaretDown size={12} className="ml-1 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'draft')}>
                          Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'sent')}>
                          Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'approved')}>
                          Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'rejected')}>
                          Rejected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'expired')}>
                          Expired
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <StatusBadge status={quote.status} />
                  )}
                </div>
              </div>
              {quote.nickname && (
                <div className="font-semibold text-foreground mb-1">{quote.nickname}</div>
              )}
              <div className="text-sm text-muted-foreground">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText size={16} className="mr-1" />
                        Invoice
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleSendInvoice}>
                        <EnvelopeSimple size={16} className="mr-2" />
                        Send to Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportInvoice}>
                        <FileText size={16} className="mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
