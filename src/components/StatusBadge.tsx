import { Badge } from '@/components/ui/badge'
import type { QuoteStatus, JobStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: QuoteStatus | JobStatus
  className?: string
  onClick?: (status: QuoteStatus | JobStatus) => void
  clickable?: boolean
}

const statusConfig: Record<QuoteStatus | JobStatus, { 
  label: string
  dotColor: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  draft: { 
    label: 'Draft', 
    dotColor: 'bg-muted-foreground/40',
    bgColor: 'bg-card',
    textColor: 'text-muted-foreground',
    borderColor: 'border-border/50'
  },
  sent: { 
    label: 'Sent', 
    dotColor: 'bg-blue-400/80',
    bgColor: 'bg-blue-500/5',
    textColor: 'text-blue-300/90',
    borderColor: 'border-blue-500/20'
  },
  approved: { 
    label: 'Approved', 
    dotColor: 'bg-primary',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    borderColor: 'border-primary/30'
  },
  rejected: { 
    label: 'Rejected', 
    dotColor: 'bg-orange-400/70',
    bgColor: 'bg-orange-500/5',
    textColor: 'text-orange-300/80',
    borderColor: 'border-orange-500/20'
  },
  expired: { 
    label: 'Expired', 
    dotColor: 'bg-muted-foreground/30',
    bgColor: 'bg-card',
    textColor: 'text-muted-foreground/60',
    borderColor: 'border-border/40'
  },
  pending: { 
    label: 'Pending', 
    dotColor: 'bg-yellow-400/70',
    bgColor: 'bg-yellow-500/5',
    textColor: 'text-yellow-300/90',
    borderColor: 'border-yellow-500/20'
  },
  'art-approval': { 
    label: 'Art Approval', 
    dotColor: 'bg-purple-400/70',
    bgColor: 'bg-purple-500/5',
    textColor: 'text-purple-300/90',
    borderColor: 'border-purple-500/20'
  },
  scheduled: { 
    label: 'Scheduled', 
    dotColor: 'bg-cyan-400/70',
    bgColor: 'bg-cyan-500/5',
    textColor: 'text-cyan-300/90',
    borderColor: 'border-cyan-500/20'
  },
  printing: { 
    label: 'Printing', 
    dotColor: 'bg-primary/90',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    borderColor: 'border-primary/30'
  },
  finishing: { 
    label: 'Finishing', 
    dotColor: 'bg-primary/80',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary/90',
    borderColor: 'border-primary/25'
  },
  ready: { 
    label: 'Ready', 
    dotColor: 'bg-primary',
    bgColor: 'bg-primary/12',
    textColor: 'text-primary',
    borderColor: 'border-primary/35'
  },
  shipped: { 
    label: 'Shipped', 
    dotColor: 'bg-indigo-400/70',
    bgColor: 'bg-indigo-500/5',
    textColor: 'text-indigo-300/90',
    borderColor: 'border-indigo-500/20'
  },
  delivered: { 
    label: 'Delivered', 
    dotColor: 'bg-primary',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    borderColor: 'border-primary/30'
  },
}

export function StatusBadge({ status, className, onClick, clickable = false }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick && clickable) {
      e.stopPropagation()
      onClick(status)
    }
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor}
        ${className || ''} 
        ${clickable ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''}
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
        font-medium text-xs tracking-wide
        transition-all duration-150 ease-out
        shadow-sm
      `}
      onClick={handleClick}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shadow-sm`} />
      {config.label}
    </Badge>
  )
}
