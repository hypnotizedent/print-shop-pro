import { motion } from 'framer-motion'
import type { QuoteStatus, JobStatus } from '@/lib/types'

interface StatusFilterPillsProps {
  type: 'quote' | 'job'
  activeStatus: QuoteStatus | JobStatus | 'all'
  onStatusChange: (status: QuoteStatus | JobStatus | 'all') => void
  counts?: Record<string, number>
}

const quoteStatuses: Array<{ value: QuoteStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

const jobStatuses: Array<{ value: JobStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'art-approval', label: 'Art Approval' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'printing', label: 'Printing' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'ready', label: 'Ready' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
]

const statusConfig: Record<string, { 
  activeGradient: string
  activeBorder: string
  activeText: string
  activeShadow: string
  dotColor: string
}> = {
  all: {
    activeGradient: 'from-primary/20 to-primary/10',
    activeBorder: 'border-primary/40',
    activeText: 'text-primary',
    activeShadow: 'shadow-primary/20',
    dotColor: 'bg-primary'
  },
  draft: {
    activeGradient: 'from-muted/40 to-muted/20',
    activeBorder: 'border-muted-foreground/30',
    activeText: 'text-muted-foreground',
    activeShadow: 'shadow-muted-foreground/10',
    dotColor: 'bg-muted-foreground/40'
  },
  sent: {
    activeGradient: 'from-blue-500/20 to-blue-500/10',
    activeBorder: 'border-blue-400/40',
    activeText: 'text-blue-300',
    activeShadow: 'shadow-blue-500/20',
    dotColor: 'bg-blue-400'
  },
  approved: {
    activeGradient: 'from-primary/20 to-primary/10',
    activeBorder: 'border-primary/40',
    activeText: 'text-primary',
    activeShadow: 'shadow-primary/20',
    dotColor: 'bg-primary'
  },
  rejected: {
    activeGradient: 'from-orange-500/20 to-orange-500/10',
    activeBorder: 'border-orange-400/40',
    activeText: 'text-orange-300',
    activeShadow: 'shadow-orange-500/20',
    dotColor: 'bg-orange-400'
  },
  expired: {
    activeGradient: 'from-muted/30 to-muted/15',
    activeBorder: 'border-muted-foreground/25',
    activeText: 'text-muted-foreground/70',
    activeShadow: 'shadow-muted-foreground/10',
    dotColor: 'bg-muted-foreground/30'
  },
  pending: {
    activeGradient: 'from-yellow-500/20 to-yellow-500/10',
    activeBorder: 'border-yellow-400/40',
    activeText: 'text-yellow-300',
    activeShadow: 'shadow-yellow-500/20',
    dotColor: 'bg-yellow-400'
  },
  'art-approval': {
    activeGradient: 'from-purple-500/20 to-purple-500/10',
    activeBorder: 'border-purple-400/40',
    activeText: 'text-purple-300',
    activeShadow: 'shadow-purple-500/20',
    dotColor: 'bg-purple-400'
  },
  scheduled: {
    activeGradient: 'from-cyan-500/20 to-cyan-500/10',
    activeBorder: 'border-cyan-400/40',
    activeText: 'text-cyan-300',
    activeShadow: 'shadow-cyan-500/20',
    dotColor: 'bg-cyan-400'
  },
  printing: {
    activeGradient: 'from-primary/20 to-primary/10',
    activeBorder: 'border-primary/40',
    activeText: 'text-primary',
    activeShadow: 'shadow-primary/20',
    dotColor: 'bg-primary'
  },
  finishing: {
    activeGradient: 'from-primary/18 to-primary/8',
    activeBorder: 'border-primary/35',
    activeText: 'text-primary/90',
    activeShadow: 'shadow-primary/15',
    dotColor: 'bg-primary/80'
  },
  ready: {
    activeGradient: 'from-primary/22 to-primary/12',
    activeBorder: 'border-primary/45',
    activeText: 'text-primary',
    activeShadow: 'shadow-primary/25',
    dotColor: 'bg-primary'
  },
  shipped: {
    activeGradient: 'from-indigo-500/20 to-indigo-500/10',
    activeBorder: 'border-indigo-400/40',
    activeText: 'text-indigo-300',
    activeShadow: 'shadow-indigo-500/20',
    dotColor: 'bg-indigo-400'
  },
  delivered: {
    activeGradient: 'from-primary/20 to-primary/10',
    activeBorder: 'border-primary/40',
    activeText: 'text-primary',
    activeShadow: 'shadow-primary/20',
    dotColor: 'bg-primary'
  },
}

export function StatusFilterPills({ type, activeStatus, onStatusChange, counts }: StatusFilterPillsProps) {
  const statuses = type === 'quote' ? quoteStatuses : jobStatuses

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {statuses.map((status) => {
        const isActive = activeStatus === status.value
        const config = statusConfig[status.value] || statusConfig.all
        const count = counts?.[status.value]

        return (
          <motion.button
            key={status.value}
            onClick={() => onStatusChange(status.value as any)}
            className={`
              relative overflow-hidden
              px-3 py-1.5 
              rounded-lg
              text-xs font-medium tracking-wide
              border
              transition-all duration-200 ease-out
              ${isActive 
                ? `bg-gradient-to-br ${config.activeGradient} ${config.activeBorder} ${config.activeText} shadow-md ${config.activeShadow}` 
                : 'bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
              }
              active:scale-95
              flex items-center gap-1.5
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.span 
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shadow-sm`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              />
            )}
            <span>{status.label}</span>
            {count !== undefined && count > 0 && (
              <span className={`
                ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                ${isActive 
                  ? 'bg-background/20' 
                  : 'bg-muted-foreground/10'
                }
              `}>
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
