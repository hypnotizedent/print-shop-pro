import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuoteCard } from '@/components/QuoteCard'
import { Plus, MagnifyingGlass, FunnelSimple, CheckSquare, FileText, Trash } from '@phosphor-icons/react'
import type { Quote, Customer, QuoteStatus } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { exportInvoiceAsPDF } from '@/lib/invoice-generator'

interface QuotesListProps {
  quotes: Quote[]
  customers: Customer[]
  onSelectQuote: (quote: Quote) => void
  onNewQuote: () => void
  onSaveQuote: (quote: Quote) => void
  onCreateCustomer: (customer: Customer) => void
  onConvertToJob: (quote: Quote) => void
  onDeleteQuotes?: (quoteIds: string[]) => void
  onBulkStatusChange?: (quoteIds: string[], status: QuoteStatus) => void
}

export function QuotesList({ 
  quotes, 
  customers,
  onSelectQuote, 
  onNewQuote, 
  onSaveQuote,
  onCreateCustomer,
  onConvertToJob,
  onDeleteQuotes,
  onBulkStatusChange
}: QuotesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set())
  
  const filteredAndSortedQuotes = quotes
    .filter(q => {
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter
      const matchesSearch = 
        q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  
  const hasSelection = selectedQuoteIds.size > 0
  const selectedQuotes = quotes.filter(q => selectedQuoteIds.has(q.id))
  
  const toggleQuoteSelection = (quoteId: string) => {
    const newSelection = new Set(selectedQuoteIds)
    if (newSelection.has(quoteId)) {
      newSelection.delete(quoteId)
    } else {
      newSelection.add(quoteId)
    }
    setSelectedQuoteIds(newSelection)
  }
  
  const toggleSelectAll = () => {
    if (hasSelection) {
      setSelectedQuoteIds(new Set())
    } else {
      setSelectedQuoteIds(new Set(filteredAndSortedQuotes.map(q => q.id)))
    }
  }
  
  const handleBulkDelete = () => {
    if (onDeleteQuotes && selectedQuoteIds.size > 0) {
      if (confirm(`Delete ${selectedQuoteIds.size} quote${selectedQuoteIds.size > 1 ? 's' : ''}?`)) {
        onDeleteQuotes(Array.from(selectedQuoteIds))
        setSelectedQuoteIds(new Set())
        toast.success(`Deleted ${selectedQuoteIds.size} quote${selectedQuoteIds.size > 1 ? 's' : ''}`)
      }
    }
  }
  
  const handleBulkStatusChange = (status: QuoteStatus) => {
    if (onBulkStatusChange && selectedQuoteIds.size > 0) {
      onBulkStatusChange(Array.from(selectedQuoteIds), status)
      setSelectedQuoteIds(new Set())
      toast.success(`Updated ${selectedQuoteIds.size} quote${selectedQuoteIds.size > 1 ? 's' : ''} to ${status}`)
    }
  }
  
  const handleBulkInvoiceExport = () => {
    if (selectedQuotes.length === 0) return
    
    selectedQuotes.forEach(quote => {
      if (quote.status === 'approved') {
        exportInvoiceAsPDF(quote)
      }
    })
    
    const approvedCount = selectedQuotes.filter(q => q.status === 'approved').length
    if (approvedCount > 0) {
      toast.success(`Exporting ${approvedCount} invoice${approvedCount > 1 ? 's' : ''}`)
    } else {
      toast.error('No approved quotes selected')
    }
  }
  
  
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
        
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes by number, nickname, customer, or company..."
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
        
        {hasSelection && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <CheckSquare size={18} className="text-primary" weight="fill" />
            <span className="text-sm font-medium">
              {selectedQuoteIds.size} quote{selectedQuoteIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('draft')}>
                    Mark as Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('sent')}>
                    Mark as Sent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('approved')}>
                    Mark as Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('rejected')}>
                    Mark as Rejected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('expired')}>
                    Mark as Expired
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleBulkInvoiceExport}
              >
                <FileText size={16} className="mr-2" />
                Export Invoices
              </Button>
              
              {onDeleteQuotes && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedQuoteIds(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox 
              checked={hasSelection && selectedQuoteIds.size === filteredAndSortedQuotes.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select All ({filteredAndSortedQuotes.length})
            </span>
          </div>
          
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
                    isSelected={selectedQuoteIds.has(quote.id)}
                    onToggleSelect={toggleQuoteSelection}
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
                    isSelected={selectedQuoteIds.has(quote.id)}
                    onToggleSelect={toggleQuoteSelection}
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
                    isSelected={selectedQuoteIds.has(quote.id)}
                    onToggleSelect={toggleQuoteSelection}
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
