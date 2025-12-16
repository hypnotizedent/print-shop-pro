import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { JobCard } from '@/components/JobCard'
import { JobDetail } from '@/components/JobDetail'
import { ProductionCalendar } from '@/components/ProductionCalendar'
import { FilterPresetManager } from '@/components/FilterPresetManager'
import { RecentSearchesDropdown, useRecentSearches } from '@/components/RecentSearchesDropdown'
import type { Job, JobStatus, ArtworkFile, Customer, Expense, FilterPreset, RecentSearch } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, FunnelSimple, CheckSquare, Trash, CalendarBlank, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface JobsBoardProps {
  jobs: Job[]
  customers: Customer[]
  filterPresets?: FilterPreset[]
  recentSearches?: RecentSearch[]
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void
  onUpdateJobArtwork: (jobId: string, itemId: string, artwork: ArtworkFile[]) => void
  onNavigateToCustomer: (customerId: string) => void
  onUpdateJobNickname?: (jobId: string, nickname: string) => void
  onUpdateJobExpenses?: (jobId: string, expenses: Expense[]) => void
  onDeleteJobs?: (jobIds: string[]) => void
  onBulkStatusChange?: (jobIds: string[], status: JobStatus) => void
  onSaveFilterPreset?: (preset: FilterPreset) => void
  onDeleteFilterPreset?: (presetId: string) => void
  onTogglePinPreset?: (presetId: string) => void
  onAddRecentSearch?: (search: RecentSearch) => void
  onRemoveRecentSearch?: (searchId: string) => void
  onClearRecentSearches?: () => void
}

export function JobsBoard({ 
  jobs, 
  customers, 
  filterPresets = [],
  recentSearches = [],
  onUpdateJobStatus, 
  onUpdateJobArtwork, 
  onNavigateToCustomer,
  onUpdateJobNickname,
  onUpdateJobExpenses,
  onDeleteJobs,
  onBulkStatusChange,
  onSaveFilterPreset,
  onDeleteFilterPreset,
  onTogglePinPreset,
  onAddRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
}: JobsBoardProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
  const [showCalendar, setShowCalendar] = useState(false)
  
  const handleJobClick = (job: Job) => {
    if (expandedJobId === job.id) {
      setExpandedJobId(null)
    } else {
      setExpandedJobId(job.id)
    }
  }

  const filteredAndSortedJobs = jobs
    .filter(job => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      const matchesSearch = !searchTerm || 
        job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      const dateA = new Date(a.due_date).getTime()
      const dateB = new Date(b.due_date).getTime()
      return dateSort === 'asc' ? dateA - dateB : dateB - dateA
    })
  
  const hasSelection = selectedJobIds.size > 0
  
  const toggleJobSelection = (jobId: string) => {
    const newSelection = new Set(selectedJobIds)
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId)
    } else {
      newSelection.add(jobId)
    }
    setSelectedJobIds(newSelection)
  }
  
  const toggleSelectAll = () => {
    if (hasSelection) {
      setSelectedJobIds(new Set())
    } else {
      setSelectedJobIds(new Set(filteredAndSortedJobs.map(j => j.id)))
    }
  }
  
  const handleBulkDelete = () => {
    if (onDeleteJobs && selectedJobIds.size > 0) {
      if (confirm(`Delete ${selectedJobIds.size} job${selectedJobIds.size > 1 ? 's' : ''}?`)) {
        onDeleteJobs(Array.from(selectedJobIds))
        setSelectedJobIds(new Set())
        toast.success(`Deleted ${selectedJobIds.size} job${selectedJobIds.size > 1 ? 's' : ''}`)
      }
    }
  }
  
  const handleBulkStatusChange = (status: JobStatus) => {
    if (onBulkStatusChange && selectedJobIds.size > 0) {
      onBulkStatusChange(Array.from(selectedJobIds), status)
      setSelectedJobIds(new Set())
      toast.success(`Updated ${selectedJobIds.size} job${selectedJobIds.size > 1 ? 's' : ''} to ${status}`)
    }
  }
  
  const handleSingleStatusChange = (jobId: string, status: JobStatus) => {
    onUpdateJobStatus(jobId, status)
    toast.success(`Job status updated to ${status}`)
  }

  const hasActiveFilters = statusFilter !== 'all' || dateSort !== 'desc'
  
  const clearAllFilters = () => {
    setStatusFilter('all')
    setDateSort('desc')
  }

  const handleLoadPreset = (preset: FilterPreset) => {
    if (preset.filters.statusFilter) {
      setStatusFilter(preset.filters.statusFilter as JobStatus | 'all')
    }
    if (preset.filters.dateSort) {
      setDateSort(preset.filters.dateSort)
    }
  }

  const currentFilters = {
    statusFilter,
    dateSort,
  }

  const { recordSearch } = useRecentSearches('jobs', recentSearches, onAddRecentSearch || (() => {}))
  
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        recordSearch(searchTerm, filteredAndSortedJobs.length)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])
  
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-border p-4 md:p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Jobs</h1>
          <Button
            variant={showCalendar ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarBlank size={16} className="mr-2" />
            {showCalendar ? 'Hide' : 'Show'} Calendar
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <MagnifyingGlass className="text-muted-foreground" size={18} />
              {onAddRecentSearch && onRemoveRecentSearch && onClearRecentSearches && (
                <RecentSearchesDropdown
                  context="jobs"
                  searches={recentSearches}
                  onSelectSearch={setSearchTerm}
                  onClearSearches={onClearRecentSearches}
                  onRemoveSearch={onRemoveRecentSearch}
                  currentQuery={searchTerm}
                  onQueryChange={setSearchTerm}
                />
              )}
            </div>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs..."
              className="pl-16 pr-32"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
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
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobStatus | 'all')}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="art-approval">Art Approval</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="printing">Printing</SelectItem>
                        <SelectItem value="finishing">Finishing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Sort by Date</label>
                    <Select value={dateSort} onValueChange={(value) => setDateSort(value as 'asc' | 'desc')}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
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
              context="jobs"
              currentFilters={currentFilters}
              presets={filterPresets}
              onSavePreset={onSaveFilterPreset}
              onLoadPreset={handleLoadPreset}
              onDeletePreset={onDeleteFilterPreset}
              onTogglePin={onTogglePinPreset}
            />
          )}
        </div>
        
        {hasSelection && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" weight="fill" />
              <span className="text-sm font-medium">
                {selectedJobIds.size} job{selectedJobIds.size > 1 ? 's' : ''} selected
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
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('pending')}>
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('art-approval')}>
                    Mark as Art Approval
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('scheduled')}>
                    Mark as Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('printing')}>
                    Mark as Printing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('finishing')}>
                    Mark as Finishing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('ready')}>
                    Mark as Ready
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('shipped')}>
                    Mark as Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('delivered')}>
                    Mark as Delivered
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {onDeleteJobs && (
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
                onClick={() => setSelectedJobIds(new Set())}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {showCalendar && (
            <ProductionCalendar 
              jobs={jobs}
              onSelectJob={(job) => {
                setExpandedJobId(job.id)
                setShowCalendar(false)
              }}
            />
          )}
          
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={hasSelection && selectedJobIds.size === filteredAndSortedJobs.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select All ({filteredAndSortedJobs.length})
            </span>
          </div>
          
          {filteredAndSortedJobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                onClick={() => handleJobClick(job)}
                onStatusChange={handleSingleStatusChange}
                isExpanded={expandedJobId === job.id}
                isSelected={selectedJobIds.has(job.id)}
                onToggleSelect={toggleJobSelection}
              />
              <AnimatePresence>
                {expandedJobId === job.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-l-2 border-r-2 border-b-2 border-primary rounded-b-lg bg-card/50 mt-1">
                      <JobDetail
                        job={job}
                        onBack={() => setExpandedJobId(null)}
                        onUpdateStatus={(status) => onUpdateJobStatus(job.id, status)}
                        onUpdateArtwork={(itemId, artwork) => onUpdateJobArtwork(job.id, itemId, artwork)}
                        onNavigateToCustomer={() => onNavigateToCustomer(job.customer.id)}
                        onUpdateNickname={onUpdateJobNickname ? (nickname) => onUpdateJobNickname(job.id, nickname) : undefined}
                        onUpdateExpenses={onUpdateJobExpenses ? (expenses) => onUpdateJobExpenses(job.id, expenses) : undefined}
                        isInline
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {filteredAndSortedJobs.length === 0 && (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No jobs match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
