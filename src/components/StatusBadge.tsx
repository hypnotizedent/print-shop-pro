import { Badge } from '@/components/ui/badge'
import type { QuoteStatus, JobStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: QuoteStatus | JobStatus
  className?: string
}

const statusConfig: Record<QuoteStatus | JobStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted/50 text-muted-foreground border-border' },
  sent: { label: 'Sent', className: 'bg-muted/70 text-foreground/90 border-border' },
  approved: { label: 'Approved', className: 'bg-primary/10 text-primary border-primary/20' },
  rejected: { label: 'Rejected', className: 'bg-muted/50 text-muted-foreground/80 border-border' },
  expired: { label: 'Expired', className: 'bg-muted/40 text-muted-foreground/70 border-border' },
  pending: { label: 'Pending', className: 'bg-muted/50 text-muted-foreground border-border' },
  'art-approval': { label: 'Art Approval', className: 'bg-muted/70 text-foreground/90 border-border' },
  scheduled: { label: 'Scheduled', className: 'bg-muted/70 text-foreground/90 border-border' },
  printing: { label: 'Printing', className: 'bg-primary/10 text-primary border-primary/20' },
  finishing: { label: 'Finishing', className: 'bg-primary/10 text-primary border-primary/20' },
  ready: { label: 'Ready', className: 'bg-primary/15 text-primary border-primary/25' },
  shipped: { label: 'Shipped', className: 'bg-muted/70 text-foreground/90 border-border' },
  delivered: { label: 'Delivered', className: 'bg-primary/10 text-primary border-primary/20' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}
