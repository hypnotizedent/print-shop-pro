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
import { BulkQuoteReminders } from '@/components/BulkQuoteReminders'
import { Plus, MagnifyingGlass, FunnelSimple, CheckSquare, FileText, Trash, EnvelopeSimple, FilePlus } from '@phosphor-icons/react'
import type { Quote, Customer, QuoteStatus, EmailTemplate, EmailNotification } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { exportInvoiceAsPDF } from '@/lib/invoice-generator'
import { sendInvoiceEmail } from '@/lib/invoice-email'
import { exportInvoicesAsZip } from '@/lib/batch-invoice-export'

interface QuotesListProps {
  quotes: Quote[]
  customers: Customer[]
  emailTemplates: EmailTemplate[]
  onSelectQuote: (quote: Quote) => void
  onNewQuote: () => void
  onSaveQuote: (quote: Quote) => void
  onCreateCustomer: (customer: Customer) => void
  onConvertToJob: (quote: Quote) => void
  onDeleteQuotes?: (quoteIds: string[]) => void
  onBulkStatusChange?: (quoteIds: string[], status: QuoteStatus) => void
  onSendEmails?: (notifications: EmailNotification[]) => void
}

export function QuotesList({ 
  quotes, 
  customers,
  emailTemplates,
  onSelectQuote, 
  onNewQuote, 
  onSaveQuote,
  onCreateCustomer,
  onConvertToJob,
  onDeleteQuotes,
  onBulkStatusChange,
  onSendEmails
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
  
  const handleBulkInvoiceExport = async () => {
    if (selectedQuotes.length === 0) return
    
    const approvedQuotes = selectedQuotes.filter(q => q.status === 'approved')
    
    if (approvedQuotes.length === 0) {
      toast.error('No approved quotes selected')
      return
    }
    
    try {
      await exportInvoicesAsZip(approvedQuotes)
      toast.success(`Exported ${approvedQuotes.length} invoice${approvedQuotes.length > 1 ? 's' : ''} as ZIP`)
      setSelectedQuoteIds(new Set())
    } catch (error) {
      toast.error('Failed to export invoices')
      console.error(error)
    }
  }
  
  const handleBulkSendInvoices = async () => {
    if (selectedQuotes.length === 0) return
    
    const approvedQuotes = selectedQuotes.filter(q => q.status === 'approved')
    
    if (approvedQuotes.length === 0) {
      toast.error('No approved quotes selected')
      return
    }
    
    for (const quote of approvedQuotes) {
      await sendInvoiceEmail(quote)
    }
    
    toast.success(`Email draft${approvedQuotes.length > 1 ? 's' : ''} opened for ${approvedQuotes.length} invoice${approvedQuotes.length > 1 ? 's' : ''}`)
    setSelectedQuoteIds(new Set())
  }
  
  const handleSingleStatusChange = (quoteId: string, status: QuoteStatus) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      onSaveQuote({ ...quote, status })
      toast.success(`Quote status updated to ${status}`)
    }
  }
  
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-border p-4 md:p-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Quotes</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {onSendEmails && (
              <BulkQuoteReminders
                quotes={quotes}
                emailTemplates={emailTemplates}
                onSendEmails={onSendEmails}
              />
            )}
            <Button onClick={onNewQuote} className="flex-1 sm:flex-none">
              <Plus size={18} className="mr-2" />
              New Quote
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes..."
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuoteStatus | 'all')}>
            <SelectTrigger className="w-full md:w-48">
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
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Date: Newest First</SelectItem>
              <SelectItem value="asc">Date: Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasSelection && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" weight="fill" />
              <span className="text-sm font-medium">
                {selectedQuoteIds.size} quote{selectedQuoteIds.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto w-full sm:w-auto">
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
                onClick={handleBulkSendInvoices}
                className="flex-1 sm:flex-none"
              >
                <EnvelopeSimple size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Send Invoices</span>
                <span className="sm:hidden">Send</span>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleBulkInvoiceExport}
                className="flex-1 sm:flex-none"
              >
                <FilePlus size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Export as ZIP</span>
                <span className="sm:hidden">Export</span>
              </Button>
              
              {onDeleteQuotes && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-none"
                >
                  <Trash size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Del</span>
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedQuoteIds(new Set())}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
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
                    onStatusChange={handleSingleStatusChange}
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
                    onStatusChange={handleSingleStatusChange}
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
                    onStatusChange={handleSingleStatusChange}
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
