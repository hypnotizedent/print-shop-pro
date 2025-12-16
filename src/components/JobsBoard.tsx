import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JobCard } from '@/components/JobCard'
import { JobDetail } from '@/components/JobDetail'
import type { Job, JobStatus, ArtworkFile, Customer } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'

interface JobsBoardProps {
  jobs: Job[]
  customers: Customer[]
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void
  onUpdateJobArtwork: (jobId: string, itemId: string, artwork: ArtworkFile[]) => void
  onNavigateToCustomer: (customerId: string) => void
}

export function JobsBoard({ jobs, customers, onUpdateJobStatus, onUpdateJobArtwork, onNavigateToCustomer }: JobsBoardProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
  
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
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Jobs</h1>
        </div>
        
        <div className="flex gap-3">
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
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-3">
          {filteredAndSortedJobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                onClick={() => handleJobClick(job)}
                isExpanded={expandedJobId === job.id}
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
