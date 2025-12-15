import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Progress } from '@/components/ui/progress'
import type { Job } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface JobCardProps {
  job: Job
  onClick: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
  const itemCount = job.line_items.reduce((sum, item) => sum + item.quantity, 0)
  const dueDate = new Date(job.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:border-slate-600 transition-colors w-64 flex-shrink-0"
      onClick={onClick}
    >
      <div className="mb-3">
        <div className="font-semibold text-foreground mb-1">{job.job_number}</div>
        <div className="text-sm text-muted-foreground mb-2">
          {job.customer.company || job.customer.name}
        </div>
        <StatusBadge status={job.status} className="text-xs" />
      </div>
      
      <div className="text-sm mb-2">
        <span className="text-muted-foreground">{itemCount} pieces</span>
      </div>
      
      {job.progress > 0 && job.progress < 100 && (
        <div className="mb-2">
          <Progress value={job.progress} className="h-1.5" />
          <div className="text-xs text-muted-foreground mt-1">{job.progress}%</div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {daysUntilDue === 0 ? 'Due today' :
         daysUntilDue === 1 ? 'Due tomorrow' :
         daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
         `Due in ${daysUntilDue} days`}
      </div>
      
      {job.status === 'ready' && (
        <div className="mt-2 text-xs font-semibold text-emerald-400">
          Ready for pickup!
        </div>
      )}
    </Card>
  )
}
