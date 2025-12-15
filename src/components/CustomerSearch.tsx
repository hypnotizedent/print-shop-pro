import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MagnifyingGlass, Plus, User } from '@phosphor-icons/react'
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.company?.toLowerCase().includes(query.toLowerCase())
  )
  
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])
  
  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setQuery('')
    setShowResults(false)
  }
  
  const handleCreateNew = () => {
    const [name, ...emailParts] = query.split(' ')
    const email = emailParts.join(' ') || `${name.toLowerCase()}@example.com`
    onCreateNew(query, email)
    setQuery('')
    setShowResults(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCustomers.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCustomers.length > 0 && selectedIndex < filteredCustomers.length) {
        handleSelect(filteredCustomers[selectedIndex])
      } else {
        handleCreateNew()
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
      setQuery('')
    }
  }
  
  if (selectedCustomer) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <User size={20} className="text-emerald-500" />
            </div>
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
          </div>
          <button
            onClick={() => onSelect({ id: '', name: '', email: '' })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
          ref={inputRef}
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
          title="Start typing to search customers (↑↓ to navigate, Enter to select, Tab to move)"
        />
      </div>
      
      {showResults && query && (
        <Card className="absolute z-10 w-full mt-1 max-h-80 overflow-auto shadow-lg">
          {filteredCustomers.length > 0 ? (
            <div className="py-1">
              {filteredCustomers.map((customer, index) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {customer.company && `${customer.company} • `}
                    {customer.email}
                  </div>
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleCreateNew}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedIndex === filteredCustomers.length 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                    <Plus size={16} />
                    Add New Customer: "{query}"
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCreateNew}
              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                <Plus size={16} />
                Add New Customer: "{query}"
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Press Enter to create
              </div>
            </button>
          )}
        </Card>
      )}
    </div>
  )
}
