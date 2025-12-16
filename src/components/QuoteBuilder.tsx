import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { CustomerSearch } from '@/components/CustomerSearch'
import { LineItemGrid } from '@/components/LineItemGrid'
import { PricingSummary } from '@/components/PricingSummary'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, Plus, FloppyDisk, X, DotsThree, UserCircle, Tag, Truck, Copy } from '@phosphor-icons/react'
import type { Quote, Customer, DiscountType, CustomerDecorationTemplate } from '@/lib/types'
import { createEmptyLineItem, calculateQuoteTotals, generateId, generateQuoteNumber } from '@/lib/data'
import { toast } from 'sonner'

interface QuoteBuilderProps {
  quote: Quote
  customers: Customer[]
  quotes: Quote[]
  customerTemplates?: CustomerDecorationTemplate[]
  onSave: (quote: Quote) => void
  onBack: () => void
  onCreateCustomer: (customer: Customer) => void
  onSaveDecorationTemplate?: (template: CustomerDecorationTemplate) => void
  onNavigateToCustomer?: () => void
  onDuplicateQuote?: (quote: Quote) => void
  isInline?: boolean
}

export function QuoteBuilder({ 
  quote: initialQuote, 
  customers,
  quotes,
  customerTemplates = [],
  onSave, 
  onBack, 
  onCreateCustomer,
  onSaveDecorationTemplate,
  onNavigateToCustomer,
  onDuplicateQuote,
  isInline = false
}: QuoteBuilderProps) {
  const [quote, setQuote] = useState(initialQuote)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  useEffect(() => {
    const updated = calculateQuoteTotals(quote)
    if (JSON.stringify(updated) !== JSON.stringify(quote)) {
      setQuote(updated)
    }
  }, [quote.line_items, quote.discount, quote.discount_type, quote.tax_rate])
  
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (quote.customer.id) {
        onSave(quote)
        setLastSaved(new Date())
      }
    }, 30000)
    
    return () => clearInterval(autoSave)
  }, [quote, onSave])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleAddLineItem()
      }
      if (e.key === 'Escape' && isInline) {
        e.preventDefault()
        onBack()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [quote, isInline])
  
  const handleSave = () => {
    onSave(quote)
    setLastSaved(new Date())
    toast.success('Quote saved')
  }
  
  const handleAddLineItem = () => {
    setQuote({
      ...quote,
      line_items: [...quote.line_items, createEmptyLineItem()],
    })
  }
  
  const handleCreateCustomer = (name: string, email: string) => {
    const newCustomer: Customer = {
      id: generateId('c'),
      name,
      email,
    }
    onCreateCustomer(newCustomer)
    setQuote({ ...quote, customer: newCustomer })
  }
  
  const getSaveText = () => {
    if (!lastSaved) return 'Not saved'
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
    if (seconds < 60) return 'Just saved'
    if (seconds < 120) return 'Saved 1 min ago'
    return `Saved ${Math.floor(seconds / 60)} min ago`
  }
  
  const handleDuplicateQuote = () => {
    if (onDuplicateQuote) {
      const duplicatedQuote: Quote = {
        ...quote,
        id: generateId('q'),
        quote_number: generateQuoteNumber(),
        status: 'draft',
        nickname: quote.nickname ? `${quote.nickname} (Copy)` : undefined,
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        line_items: quote.line_items.map(item => ({
          ...item,
          id: generateId('li'),
          decorations: item.decorations?.map(dec => ({
            ...dec,
            id: generateId('dec'),
          }))
        }))
      }
      onDuplicateQuote(duplicatedQuote)
      toast.success('Quote duplicated')
    }
  }
  
  return (
    <div className={`h-full ${isInline ? '' : 'overflow-auto'}`}>
      <div className={`${isInline ? 'p-6' : 'max-w-6xl mx-auto p-6'} space-y-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {!isInline && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`${isInline ? 'text-xl' : 'text-2xl'} font-bold`}>
                  Quote {quote.quote_number}
                </h1>
                <StatusBadge status={quote.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {getSaveText()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isInline && (
              <Button variant="ghost" size="icon" onClick={onBack} title="Close (Esc)">
                <X size={20} />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <DotsThree size={20} weight="bold" />
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {onNavigateToCustomer && quote.customer.id && (
                  <>
                    <DropdownMenuItem onClick={onNavigateToCustomer}>
                      <UserCircle size={18} className="mr-2" />
                      View Customer Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onDuplicateQuote && (
                  <>
                    <DropdownMenuItem onClick={handleDuplicateQuote}>
                      <Copy size={18} className="mr-2" />
                      Duplicate Quote
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => toast.info('Label printing coming soon')}>
                  <Tag size={18} className="mr-2" />
                  Print Quote Labels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Shipping label coming soon')}>
                  <Truck size={18} className="mr-2" />
                  Create Shipping Label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={handleSave}
              title="Save (⌘S)"
            >
              <FloppyDisk size={16} className="mr-2" />
              Save Draft
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘S</kbd>
            </Button>
            <Button 
              onClick={() => {
                setQuote({ ...quote, status: 'sent' })
                handleSave()
              }}
              disabled={!quote.customer.id || quote.line_items.length === 0}
            >
              Send Quote
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Customer
              </div>
              <CustomerSearch
                customers={customers}
                selectedCustomer={quote.customer.id ? quote.customer : null}
                onSelect={(customer) => setQuote({ ...quote, customer })}
                onCreateNew={handleCreateCustomer}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Quote Nickname (Optional)
              </div>
              <Input
                value={quote.nickname || ''}
                onChange={(e) => setQuote({ ...quote, nickname: e.target.value })}
                placeholder="e.g., Summer Promo, Church Event..."
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Line Items
              </div>
              <Button 
                onClick={handleAddLineItem} 
                size="sm" 
                variant="outline"
                title="Add Line Item (⌘N)"
              >
                <Plus size={16} className="mr-1" />
                Add Line Item
                <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘N</kbd>
              </Button>
            </div>
            
            {quote.line_items.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <div className="text-muted-foreground mb-3">No line items yet</div>
                <Button onClick={handleAddLineItem} variant="outline">
                  <Plus size={16} className="mr-2" />
                  Add First Line Item
                </Button>
              </div>
            ) : (
              <LineItemGrid
                items={quote.line_items}
                onChange={(items) => {
                  setQuote({ ...quote, line_items: items })
                }}
                customerId={quote.customer.id}
                customerName={quote.customer.name}
                previousQuotes={quotes}
                customerTemplates={customerTemplates}
                onSaveTemplate={onSaveDecorationTemplate}
              />
            )}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Details
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={quote.due_date}
                    onChange={(e) => setQuote({ ...quote, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Customer Notes
                  </label>
                  <Textarea
                    value={quote.notes_customer}
                    onChange={(e) => setQuote({ ...quote, notes_customer: e.target.value })}
                    placeholder="Notes visible to customer..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Internal Notes
                  </label>
                  <Textarea
                    value={quote.notes_internal}
                    onChange={(e) => setQuote({ ...quote, notes_internal: e.target.value })}
                    placeholder="Staff only notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                Pricing
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <PricingSummary
                  subtotal={quote.subtotal}
                  discount={quote.discount}
                  discountType={quote.discount_type}
                  taxRate={quote.tax_rate}
                  taxAmount={quote.tax_amount}
                  total={quote.total}
                  onDiscountChange={(value) => setQuote({ ...quote, discount: value })}
                  onDiscountTypeChange={(type: DiscountType) => setQuote({ ...quote, discount_type: type })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
