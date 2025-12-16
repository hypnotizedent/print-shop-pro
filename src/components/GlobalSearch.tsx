import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MagnifyingGlass, FileText, Briefcase, User } from '@phosphor-icons/react'
import type { Quote, Job, Customer } from '@/lib/types'

interface GlobalSearchProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
  onSelectQuote: (quote: Quote) => void
  onSelectJob: (job: Job) => void
  onSelectCustomer: (customer: Customer) => void
}

type SearchResult = 
  | { type: 'quote'; data: Quote }
  | { type: 'job'; data: Job }
  | { type: 'customer'; data: Customer }

export function GlobalSearch({ 
  quotes, 
  jobs, 
  customers,
  onSelectQuote,
  onSelectJob,
  onSelectCustomer,
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const results = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    const searchResults: SearchResult[] = []

    customers.forEach(customer => {
      if (
        customer.name.toLowerCase().includes(term) ||
        customer.company?.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
      ) {
        searchResults.push({ type: 'customer', data: customer })
      }
    })

    quotes.forEach(quote => {
      if (
        quote.quote_number.toLowerCase().includes(term) ||
        quote.customer.name.toLowerCase().includes(term) ||
        quote.customer.company?.toLowerCase().includes(term)
      ) {
        searchResults.push({ type: 'quote', data: quote })
      }
    })

    jobs.forEach(job => {
      if (
        job.job_number.toLowerCase().includes(term) ||
        job.nickname?.toLowerCase().includes(term) ||
        job.customer.name.toLowerCase().includes(term) ||
        job.customer.company?.toLowerCase().includes(term)
      ) {
        searchResults.push({ type: 'job', data: job })
      }
    })

    return searchResults.slice(0, 10)
  }, [searchTerm, quotes, jobs, customers])

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'quote') {
      onSelectQuote(result.data)
    } else if (result.type === 'job') {
      onSelectJob(result.data)
    } else {
      onSelectCustomer(result.data)
    }
    setSearchTerm('')
    setIsFocused(false)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlass 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
        />
        <Input
          type="text"
          placeholder="Search customers, quotes, jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10"
        />
      </div>

      {isFocused && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-auto z-50 shadow-lg">
          <div className="p-2">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.data.id}-${index}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg text-left transition-colors"
              >
                {result.type === 'customer' && (
                  <>
                    <User size={20} className="text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {result.data.company || result.data.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.data.email}
                      </p>
                    </div>
                  </>
                )}
                {result.type === 'quote' && (
                  <>
                    <FileText size={20} className="text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {result.data.quote_number}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.data.customer.company || result.data.customer.name} • ${result.data.total.toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
                {result.type === 'job' && (
                  <>
                    <Briefcase size={20} className="text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {result.data.job_number} {result.data.nickname && `• ${result.data.nickname}`}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.data.customer.company || result.data.customer.name} • {result.data.status}
                      </p>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {isFocused && searchTerm && results.length === 0 && (
        <Card className="absolute top-full mt-2 w-full p-4 z-50 shadow-lg">
          <p className="text-sm text-muted-foreground text-center">No results found</p>
        </Card>
      )}
    </div>
  )
}
