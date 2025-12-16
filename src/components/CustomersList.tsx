import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, MagnifyingGlass, EnvelopeSimple, Phone, Buildings, CurrencyDollar, Clock } from '@phosphor-icons/react'
import type { Customer, Quote, Job } from '@/lib/types'

interface CustomersListProps {
  customers: Customer[]
  quotes: Quote[]
  jobs: Job[]
  onSelectCustomer: (customer: Customer) => void
  onNewCustomer: () => void
}

type SortOption = 'alphabetical' | 'revenue-high' | 'revenue-low' | 'recent-orders' | 'oldest-orders'

export function CustomersList({ customers, quotes, jobs, onSelectCustomer, onNewCustomer }: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')
  
  const customersWithStats = useMemo(() => {
    return customers.map(customer => {
      const customerQuotes = quotes.filter(q => q.customer.id === customer.id)
      const customerJobs = jobs.filter(j => j.customer.id === customer.id)
      
      const totalRevenue = customerQuotes.reduce((sum, q) => sum + q.total, 0)
      
      const allDates = [
        ...customerQuotes.map(q => new Date(q.created_at).getTime()),
        ...customerJobs.map(j => new Date(j.due_date).getTime())
      ]
      const mostRecentOrder = allDates.length > 0 ? Math.max(...allDates) : 0
      
      return {
        ...customer,
        totalRevenue,
        orderCount: customerQuotes.length + customerJobs.length,
        mostRecentOrder,
      }
    })
  }, [customers, quotes, jobs])
  
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customersWithStats.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'revenue-high':
        filtered.sort((a, b) => b.totalRevenue - a.totalRevenue)
        break
      case 'revenue-low':
        filtered.sort((a, b) => a.totalRevenue - b.totalRevenue)
        break
      case 'recent-orders':
        filtered.sort((a, b) => b.mostRecentOrder - a.mostRecentOrder)
        break
      case 'oldest-orders':
        filtered.sort((a, b) => a.mostRecentOrder - b.mostRecentOrder)
        break
    }
    
    return filtered
  }, [customersWithStats, searchQuery, sortBy])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button onClick={onNewCustomer}>
            <Plus size={18} className="mr-2" />
            New Customer
          </Button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
              <SelectItem value="revenue-high">Revenue (High to Low)</SelectItem>
              <SelectItem value="revenue-low">Revenue (Low to High)</SelectItem>
              <SelectItem value="recent-orders">Recent Orders First</SelectItem>
              <SelectItem value="oldest-orders">Oldest Orders First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-3">
            {filteredAndSortedCustomers.map((customer) => (
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
                  
                  <div className="flex items-center gap-6 ml-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <CurrencyDollar size={16} />
                        <span>Total Revenue</span>
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(customer.totalRevenue)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock size={16} />
                        <span>Last Order</span>
                      </div>
                      <div className="text-sm font-medium">
                        {formatDate(customer.mostRecentOrder)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Orders</div>
                      <div className="text-lg font-semibold">
                        {customer.orderCount}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredAndSortedCustomers.length === 0 && (
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
