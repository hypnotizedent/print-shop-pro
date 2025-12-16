import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, MagnifyingGlass, EnvelopeSimple, Phone, Buildings } from '@phosphor-icons/react'
import type { Customer } from '@/lib/types'

interface CustomersListProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onNewCustomer: () => void
}

export function CustomersList({ customers, onSelectCustomer, onNewCustomer }: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={onNewCustomer}>
              <Plus size={18} className="mr-2" />
              New Customer
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-3">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelectCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{customer.name}</div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      {customer.company && (
                        <div className="flex items-center gap-1">
                          <Buildings size={16} />
                          {customer.company}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <EnvelopeSimple size={16} />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={16} />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">No customers found</div>
                <Button onClick={onNewCustomer} variant="outline">
                  <Plus size={18} className="mr-2" />
                  Add Your First Customer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
