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
import { JobCard } from '@/components/JobCard'
import { JobDetail } from '@/components/JobDetail'
import type { Job, JobStatus, ArtworkFile, Customer } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, FunnelSimple, CheckSquare, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface JobsBoardProps {
  jobs: Job[]
  customers: Customer[]
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void
  onUpdateJobArtwork: (jobId: string, itemId: string, artwork: ArtworkFile[]) => void
  onNavigateToCustomer: (customerId: string) => void
  onDeleteJobs?: (jobIds: string[]) => void
  onBulkStatusChange?: (jobIds: string[], status: JobStatus) => void
}

export function JobsBoard({ 
  jobs, 
  customers, 
  onUpdateJobStatus, 
  onUpdateJobArtwork, 
  onNavigateToCustomer,
  onDeleteJobs,
  onBulkStatusChange
}: JobsBoardProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
  
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
  
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Jobs</h1>
        </div>
        
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
            />
            <Input
              type="text"
              placeholder="Search by job number, nickname, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobStatus | 'all')}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <FunnelSimple size={16} />
                <SelectValue placeholder="Filter by status" />
              </div>
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

          <Select value={dateSort} onValueChange={(value) => setDateSort(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Due Date: Newest First</SelectItem>
              <SelectItem value="asc">Due Date: Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasSelection && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <CheckSquare size={18} className="text-primary" weight="fill" />
            <span className="text-sm font-medium">
              {selectedJobIds.size} job{selectedJobIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
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
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedJobIds(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center gap-3 mb-4">
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
