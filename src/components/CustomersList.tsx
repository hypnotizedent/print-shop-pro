import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FilterPresetManager } from '@/components/FilterPresetManager'
import { RecentSearchesDropdown, useRecentSearches } from '@/components/RecentSearchesDropdown'
import { CustomersListSkeleton } from '@/components/skeletons'
import { Plus, MagnifyingGlass, EnvelopeSimple, Phone, Buildings, CurrencyDollar, Clock, Download, FunnelSimple, X } from '@phosphor-icons/react'
import type { Customer, Quote, Job, CustomerTier, FilterPreset, RecentSearch } from '@/lib/types'
import { exportCustomersToCSV } from '@/lib/csv-export'
import { toast } from 'sonner'

interface CustomersListProps {
  customers: Customer[]
  quotes: Quote[]
  jobs: Job[]
  filterPresets?: FilterPreset[]
  recentSearches?: RecentSearch[]
  onSelectCustomer: (customer: Customer) => void
  onNewCustomer: () => void
  onSaveFilterPreset?: (preset: FilterPreset) => void
  onDeleteFilterPreset?: (presetId: string) => void
  onTogglePinPreset?: (presetId: string) => void
  onAddRecentSearch?: (search: RecentSearch) => void
  onRemoveRecentSearch?: (searchId: string) => void
  onClearRecentSearches?: () => void
  onNewQuote?: () => void
}

type SortOption = 'alphabetical' | 'revenue-high' | 'revenue-low' | 'recent-orders' | 'oldest-orders'
type GroupByOption = 'none' | 'tier'
type TierFilterOption = 'all' | CustomerTier

export function CustomersList({ 
  customers, 
  quotes, 
  jobs, 
  filterPresets = [],
  recentSearches = [],
  onSelectCustomer, 
  onNewCustomer,
  onSaveFilterPreset,
  onDeleteFilterPreset,
  onTogglePinPreset,
  onAddRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onNewQuote,
}: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')
  const [groupBy, setGroupBy] = useState<GroupByOption>('none')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])
  const [tierFilter, setTierFilter] = useState<TierFilterOption>('all')
  
  const { recordSearch } = useRecentSearches('customers', recentSearches, onAddRecentSearch || (() => {}))
  
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        recordSearch(searchQuery, filteredAndSortedCustomers.length)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery])
  
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
    let filtered = customersWithStats.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTier = tierFilter === 'all' || c.tier === tierFilter || (tierFilter === 'bronze' && !c.tier)
      
      return matchesSearch && matchesTier
    })
    
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
  }, [customersWithStats, searchQuery, sortBy, tierFilter])
  
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
  
  const getTierColor = (tier?: CustomerTier) => {
    switch (tier) {
      case 'platinum': return 'bg-slate-300 text-slate-900'
      case 'gold': return 'bg-yellow-500 text-yellow-900'
      case 'silver': return 'bg-slate-400 text-slate-900'
      case 'bronze': return 'bg-orange-600 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  const handleExportCSV = () => {
    exportCustomersToCSV(filteredAndSortedCustomers)
    toast.success('Customers exported to CSV')
  }

  const hasActiveFilters = sortBy !== 'alphabetical' || groupBy !== 'none' || tierFilter !== 'all'
  
  const clearAllFilters = () => {
    setSortBy('alphabetical')
    setGroupBy('none')
    setTierFilter('all')
  }
  
  const groupedCustomers = useMemo(() => {
    if (groupBy === 'none') {
      return { '': filteredAndSortedCustomers }
    }
    
    const tierOrder: (CustomerTier | 'none')[] = ['platinum', 'gold', 'silver', 'bronze', 'none']
    const groups: Record<string, typeof filteredAndSortedCustomers> = {}
    
    tierOrder.forEach(tier => {
      groups[tier] = filteredAndSortedCustomers.filter(c => 
        tier === 'none' ? !c.tier : c.tier === tier
      )
    })
    
    return Object.fromEntries(
      Object.entries(groups).filter(([_, customers]) => customers.length > 0)
    )
  }, [filteredAndSortedCustomers, groupBy])
  
  if (isInitialLoading) {
    return <CustomersListSkeleton />
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
              {filteredAndSortedCustomers.length} customer{filteredAndSortedCustomers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {onNewQuote && (
              <Button onClick={onNewQuote} variant="outline" className="flex-1 sm:flex-none gap-2">
                <Plus size={18} weight="bold" />
                <span className="hidden sm:inline">New Quote</span>
              </Button>
            )}
            <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button onClick={onNewCustomer} className="flex-1 sm:flex-none gap-2">
              <Plus size={18} weight="bold" />
              New Customer
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 max-w-3xl">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <MagnifyingGlass className="text-muted-foreground" size={18} />
              {onAddRecentSearch && onRemoveRecentSearch && onClearRecentSearches && (
                <RecentSearchesDropdown
                  context="customers"
                  searches={recentSearches}
                  onSelectSearch={setSearchQuery}
                  onClearSearches={onClearRecentSearches}
                  onRemoveSearch={onRemoveRecentSearch}
                  currentQuery={searchQuery}
                  onQueryChange={setSearchQuery}
                />
              )}
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="pl-16 pr-32"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="h-7 w-7 p-0"
                  title="Clear search"
                >
                  <X size={14} />
                </Button>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={hasActiveFilters ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 gap-1"
                    title="Filter options"
                  >
                    <FunnelSimple size={14} />
                    {hasActiveFilters && <span className="text-xs">•</span>}
                  </Button>
                </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-7 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Group By</label>
                    <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupByOption)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Grouping</SelectItem>
                        <SelectItem value="tier">Group by Tier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Filter by Tier</label>
                    <Select value={tierFilter} onValueChange={(value) => setTierFilter(value as TierFilterOption)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze / No Tier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            </div>
          </div>
          
          {onSaveFilterPreset && onDeleteFilterPreset && onTogglePinPreset && (
            <FilterPresetManager
              context="customers"
              currentFilters={{ sortBy, groupBy }}
              presets={filterPresets}
              onSavePreset={onSaveFilterPreset}
              onLoadPreset={(preset) => {
                if (preset.filters.sortBy) setSortBy(preset.filters.sortBy as SortOption)
                if (preset.filters.groupBy) setGroupBy(preset.filters.groupBy as GroupByOption)
              }}
              onDeletePreset={onDeleteFilterPreset}
              onTogglePin={onTogglePinPreset}
            />
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6">
            {Object.entries(groupedCustomers).map(([tier, tierCustomers]) => (
              <div key={tier}>
                {groupBy === 'tier' && tier && (
                  <div className="mb-3">
                    <Badge className={`uppercase text-xs font-bold ${getTierColor(tier as CustomerTier)}`}>
                      {tier === 'none' ? 'No Tier' : `${tier} Tier`}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {tierCustomers.length} customer{tierCustomers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                <div className="grid gap-3">
                  {tierCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onSelectCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-lg">{customer.name}</div>
                            {customer.tier && groupBy === 'none' && (
                              <Badge className={`uppercase text-xs ${getTierColor(customer.tier)}`}>
                                {customer.tier}
                              </Badge>
                            )}
                          </div>
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
                </div>
              </div>
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
