import { Badge } from '@/components/ui/badge'
import type { QuoteStatus, JobStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: QuoteStatus | JobStatus
  className?: string
}

const statusConfig: Record<QuoteStatus | JobStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  sent: { label: 'Sent', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  approved: { label: 'Approved', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  expired: { label: 'Expired', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  pending: { label: 'Pending', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  'art-approval': { label: 'Art Approval', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  printing: { label: 'Printing', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  finishing: { label: 'Finishing', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  ready: { label: 'Ready', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  shipped: { label: 'Shipped', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  delivered: { label: 'Delivered', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}
