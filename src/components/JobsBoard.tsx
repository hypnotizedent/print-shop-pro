import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { JobCard } from '@/components/JobCard'
import { JobDetail } from '@/components/JobDetail'
import type { Job, JobStatus, ArtworkFile } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface JobsBoardProps {
  jobs: Job[]
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void
  onUpdateJobArtwork: (jobId: string, itemId: string, artwork: ArtworkFile[]) => void
}

const statusColumns: { status: JobStatus; label: string }[] = [
  { status: 'art-approval', label: 'Art Approval' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'printing', label: 'Printing' },
  { status: 'ready', label: 'Ready' },
]

export function JobsBoard({ jobs, onUpdateJobStatus, onUpdateJobArtwork }: JobsBoardProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  
  const handleJobClick = (job: Job) => {
    if (expandedJobId === job.id) {
      setExpandedJobId(null)
    } else {
      setExpandedJobId(job.id)
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-4 gap-4">
          {statusColumns.map(({ status, label }) => {
            const columnJobs = jobs.filter(j => j.status === status)
            
            return (
              <div key={status} className="flex flex-col min-h-0">
                <div className="mb-3">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {columnJobs.length} {columnJobs.length === 1 ? 'job' : 'jobs'}
                  </div>
                </div>
                
                <ScrollArea className="flex-1 -mx-2 px-2">
                  <div className="space-y-3 pb-4">
                    {columnJobs.map((job) => (
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
                                  isInline
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {columnJobs.length === 0 && (
                      <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
                        No jobs
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
