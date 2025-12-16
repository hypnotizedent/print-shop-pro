import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuoteCard } from '@/components/QuoteCard'
import { Plus, MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
import type { Quote, Customer, QuoteStatus } from '@/lib/types'
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
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
  
  const filteredAndSortedQuotes = quotes
    .filter(q => {
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter
      const matchesSearch = 
        q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateSort === 'asc' ? dateA - dateB : dateB - dateA
    })
  
  const needsAction = filteredAndSortedQuotes.filter(q => 
    q.status === 'draft' || q.status === 'sent' || q.status === 'approved'
  )
  
  const recentlySent = filteredAndSortedQuotes.filter(q => 
    q.status === 'sent'
  ).slice(0, 12)
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quotes</h1>
          <Button onClick={onNewQuote}>
            <Plus size={18} className="mr-2" />
            New Quote
          </Button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes by number, customer, or company..."
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuoteStatus | 'all')}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <FunnelSimple size={16} />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateSort} onValueChange={(value) => setDateSort(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Date: Newest First</SelectItem>
              <SelectItem value="asc">Date: Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {needsAction.length > 0 && statusFilter === 'all' && (
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
          
          {statusFilter !== 'all' && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Quotes ({filteredAndSortedQuotes.length})
              </div>
              <div className="grid gap-3">
                {filteredAndSortedQuotes.map((quote) => (
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
          
          {recentlySent.length > 0 && statusFilter === 'all' && (
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
          
          {filteredAndSortedQuotes.length === 0 && (
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
