import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Progress } from '@/components/ui/progress'
import { ProductMockup } from './ProductMockup'
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
  const primaryItem = job.line_items[0]
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:border-slate-600 transition-colors w-64 flex-shrink-0"
      onClick={onClick}
    >
      <div className="flex gap-3 mb-3">
        {primaryItem && (
          <div className="flex-shrink-0 w-10 h-10">
            <ProductMockup
              productType={primaryItem.product_type}
              color={primaryItem.product_color || '#94a3b8'}
              size="small"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">{job.job_number}</div>
          <div className="text-sm text-muted-foreground mb-2 truncate">
            {job.customer.company || job.customer.name}
          </div>
        </div>
      </div>
      
      <StatusBadge status={job.status} className="text-xs mb-2" />
      
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
