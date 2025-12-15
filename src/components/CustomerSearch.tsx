import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MagnifyingGlass } from '@phosphor-icons/react'
import type { Customer } from '@/lib/types'

interface CustomerSearchProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelect: (customer: Customer) => void
  onCreateNew: (name: string, email: string) => void
}

export function CustomerSearch({ customers, selectedCustomer, onSelect, onCreateNew }: CustomerSearchProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.company?.toLowerCase().includes(query.toLowerCase())
  )
  
  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setQuery('')
    setShowResults(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query && filteredCustomers.length === 0) {
      const [name, ...emailParts] = query.split(' ')
      const email = emailParts.join(' ') || `${name.toLowerCase()}@example.com`
      onCreateNew(query, email)
      setQuery('')
      setShowResults(false)
    }
  }
  
  if (selectedCustomer) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-foreground">{selectedCustomer.name}</div>
            {selectedCustomer.company && (
              <div className="text-sm text-muted-foreground">{selectedCustomer.company}</div>
            )}
            <div className="text-sm text-muted-foreground mt-1">
              {selectedCustomer.email}
              {selectedCustomer.phone && ` • ${selectedCustomer.phone}`}
            </div>
          </div>
          <button
            onClick={() => onSelect({ id: '', name: '', email: '' })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search customer or type new name..."
          className="pl-10"
        />
      </div>
      
      {showResults && query && (
        <Card className="absolute z-10 w-full mt-1 max-h-64 overflow-auto">
          {filteredCustomers.length > 0 ? (
            <div className="py-1">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors"
                >
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {customer.company && `${customer.company} • `}
                    {customer.email}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Press Enter to create new customer "{query}"
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
