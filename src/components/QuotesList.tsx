import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuoteCard } from '@/components/QuoteCard'
import { Plus, MagnifyingGlass } from '@phosphor-icons/react'
import type { Quote, Customer } from '@/lib/types'
import { useState } from 'react'

interface QuotesListProps {
  quotes: Quote[]
  customers: Customer[]
  onSelectQuote: (quote: Quote) => void
  onNewQuote: () => void
  onSaveQuote: (quote: Quote) => void
  onCreateCustomer: (customer: Customer) => void
  onConvertToJob: (quote: Quote) => void
}

export function QuotesList({ 
  quotes, 
  customers,
  onSelectQuote, 
  onNewQuote, 
  onSaveQuote,
  onCreateCustomer,
  onConvertToJob
}: QuotesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredQuotes = quotes.filter(q =>
    q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const needsAction = filteredQuotes.filter(q => 
    q.status === 'draft' || q.status === 'sent' || q.status === 'approved'
  )
  
  const recentlySent = filteredQuotes.filter(q => 
    q.status === 'sent'
  ).slice(0, 12)
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quotes</h1>
          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes..."
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={onNewQuote}>
              <Plus size={18} className="mr-2" />
              New Quote
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {needsAction.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Needs Action ({needsAction.length})
              </div>
              <div className="grid gap-3">
                {needsAction.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onClick={() => onSelectQuote(quote)}
                    onConvertToJob={onConvertToJob}
                  />
                ))}
              </div>
            </div>
          )}
          
          {recentlySent.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Recently Sent ({recentlySent.length})
              </div>
              <div className="grid gap-3">
                {recentlySent.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onClick={() => onSelectQuote(quote)}
                    onConvertToJob={onConvertToJob}
                  />
                ))}
              </div>
            </div>
          )}
          
          {filteredQuotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No quotes found</div>
              <Button onClick={onNewQuote} variant="outline">
                <Plus size={18} className="mr-2" />
                Create Your First Quote
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
