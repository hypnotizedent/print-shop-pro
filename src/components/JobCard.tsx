import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './StatusBadge'
import { Progress } from '@/components/ui/progress'
import { ProductMockup } from './ProductMockup'
import type { Job, JobStatus } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Check, CaretDown } from '@phosphor-icons/react'

interface JobCardProps {
  job: Job
  onClick: () => void
  onStatusChange?: (jobId: string, status: JobStatus) => void
  onStatusFilter?: (status: JobStatus) => void
  isExpanded?: boolean
  isSelected?: boolean
  onToggleSelect?: (jobId: string) => void
}

export function JobCard({ job, onClick, onStatusChange, onStatusFilter, isExpanded = false, isSelected, onToggleSelect }: JobCardProps) {
  const itemCount = job.line_items.reduce((sum, item) => sum + item.quantity, 0)
  const dueDate = new Date(job.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const primaryItem = job.line_items[0]
  
  const allArtwork = job.line_items.flatMap(item => item.artwork || [])
  const artworkCount = allArtwork.length
  const approvedArtwork = allArtwork.filter(a => a.approved).length
  
  return (
    <Card 
      className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
        isSelected ? 'bg-muted/30' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(job.id)}
            />
          </div>
        )}
        
        <div className="flex-1">
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
              <div className="text-xs text-muted-foreground mb-1">
                {job.job_number}
              </div>
              {job.nickname && (
                <div className="font-semibold text-foreground mb-1">{job.nickname}</div>
              )}
              <div className="text-sm text-muted-foreground truncate">
                {job.customer.company || job.customer.name}
              </div>
            </div>
          </div>
          
          <div className="mb-2" onClick={(e) => e.stopPropagation()}>
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex">
                    <StatusBadge 
                      status={job.status} 
                      className="text-xs" 
                      clickable={!!onStatusFilter}
                      onClick={onStatusFilter}
                    />
                    <CaretDown size={12} className="ml-1 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'art-approval')}>
                    Art Approval
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'scheduled')}>
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'printing')}>
                    Printing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'finishing')}>
                    Finishing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'ready')}>
                    Ready
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'shipped')}>
                    Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(job.id, 'delivered')}>
                    Delivered
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusBadge 
                status={job.status} 
                className="text-xs" 
                clickable={!!onStatusFilter}
                onClick={onStatusFilter}
              />
            )}
          </div>
          
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">{itemCount} pieces</span>
          </div>
          
          {artworkCount > 0 && (
            <div className="mb-2">
              <div className="flex gap-1 mb-1">
                {allArtwork.slice(0, 4).map((art, idx) => (
                  <div 
                    key={idx}
                    className="relative w-10 h-10 rounded border border-border overflow-hidden flex-shrink-0"
                  >
                    <img 
                      src={art.dataUrl} 
                      alt={art.fileName}
                      className="w-full h-full object-cover"
                    />
                    {art.approved && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check size={16} weight="bold" className="text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                ))}
                {artworkCount > 4 && (
                  <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    +{artworkCount - 4}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {approvedArtwork === artworkCount 
                  ? `All ${artworkCount} files approved` 
                  : `${approvedArtwork}/${artworkCount} approved`}
              </div>
            </div>
          )}
          
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
            <div className="mt-2 text-xs font-semibold text-primary">
              Ready for pickup!
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
