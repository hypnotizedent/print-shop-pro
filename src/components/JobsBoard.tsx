import { ScrollArea } from '@/components/ui/scroll-area'
import { JobCard } from '@/components/JobCard'
import type { Job, JobStatus } from '@/lib/types'

interface JobsBoardProps {
  jobs: Job[]
  onSelectJob: (job: Job) => void
}

const statusColumns: { status: JobStatus; label: string }[] = [
  { status: 'art-approval', label: 'Art Approval' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'printing', label: 'Printing' },
  { status: 'ready', label: 'Ready' },
]

export function JobsBoard({ jobs, onSelectJob }: JobsBoardProps) {
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
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => onSelectJob(job)}
                      />
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
