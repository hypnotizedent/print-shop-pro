import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Circle,
  CheckCircle,
  FileText,
  CalendarCheck,
  Printer,
  Scissors,
  Package,
  Truck,
  MapPin,
  Image as ImageIcon,
  CurrencyDollar,
  Note
} from '@phosphor-icons/react'
import type { Job, Expense } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface JobHistoryProps {
  job: Job
}

type HistoryEvent = {
  id: string
  type: 'status_change' | 'expense' | 'artwork' | 'created' | 'note'
  timestamp: string
  title: string
  description?: string
  icon: typeof Circle
  iconColor: string
  amount?: number
}

export function JobHistory({ job }: JobHistoryProps) {
  const historyEvents = useMemo(() => {
    const events: HistoryEvent[] = []
    
    events.push({
      id: 'created',
      type: 'created',
      timestamp: new Date().toISOString(),
      title: 'Job Created',
      description: `Job #${job.job_number} created`,
      icon: Circle,
      iconColor: 'text-muted-foreground'
    })
    
    const statusIcons: Record<string, { icon: typeof Circle; color: string; label: string }> = {
      'pending': { icon: Circle, color: 'text-gray-400', label: 'Pending' },
      'art-approval': { icon: ImageIcon, color: 'text-yellow-500', label: 'Art Approval' },
      'scheduled': { icon: CalendarCheck, color: 'text-blue-500', label: 'Scheduled' },
      'printing': { icon: Printer, color: 'text-purple-500', label: 'Printing' },
      'finishing': { icon: Scissors, color: 'text-orange-500', label: 'Finishing' },
      'ready': { icon: Package, color: 'text-primary', label: 'Ready for Pickup' },
      'shipped': { icon: Truck, color: 'text-cyan-500', label: 'Shipped' },
      'delivered': { icon: MapPin, color: 'text-green-500', label: 'Delivered' }
    }
    
    const currentStatus = statusIcons[job.status]
    if (currentStatus && job.status !== 'pending') {
      events.push({
        id: `status-${job.status}`,
        type: 'status_change',
        timestamp: new Date().toISOString(),
        title: `Status: ${currentStatus.label}`,
        description: `Job moved to ${currentStatus.label.toLowerCase()}`,
        icon: currentStatus.icon,
        iconColor: currentStatus.color
      })
    }
    
    const totalArtwork = job.line_items.reduce((sum, item) => sum + (item.artwork || []).length, 0)
    const approvedArtwork = job.line_items.reduce((sum, item) => 
      sum + (item.artwork || []).filter(a => a.approved).length, 0
    )
    
    if (totalArtwork > 0) {
      if (approvedArtwork === totalArtwork) {
        events.push({
          id: 'artwork-approved',
          type: 'artwork',
          timestamp: new Date().toISOString(),
          title: 'All Artwork Approved',
          description: `${approvedArtwork} file${approvedArtwork > 1 ? 's' : ''} approved`,
          icon: CheckCircle,
          iconColor: 'text-primary'
        })
      } else if (approvedArtwork > 0) {
        events.push({
          id: 'artwork-partial',
          type: 'artwork',
          timestamp: new Date().toISOString(),
          title: 'Artwork Partially Approved',
          description: `${approvedArtwork}/${totalArtwork} files approved`,
          icon: ImageIcon,
          iconColor: 'text-yellow-500'
        })
      }
    }
    
    if (job.expenses && job.expenses.length > 0) {
      job.expenses.forEach((expense: Expense) => {
        events.push({
          id: expense.id,
          type: 'expense',
          timestamp: expense.expenseDate,
          title: 'Expense Added',
          description: `${expense.category}${expense.description ? ` - ${expense.description}` : ''}`,
          icon: CurrencyDollar,
          iconColor: 'text-red-500',
          amount: expense.amount
        })
      })
    }
    
    if (job.production_notes) {
      events.push({
        id: 'production-notes',
        type: 'note',
        timestamp: new Date().toISOString(),
        title: 'Production Notes Added',
        description: job.production_notes.substring(0, 60) + (job.production_notes.length > 60 ? '...' : ''),
        icon: Note,
        iconColor: 'text-blue-400'
      })
    }
    
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [job])
  
  const totalExpenses = (job.expenses || []).reduce((sum, e) => sum + e.amount, 0)
  const jobRevenue = job.line_items.reduce((sum, item) => sum + item.line_total, 0)
  const profit = jobRevenue - totalExpenses
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          History
        </div>
        {job.expenses && job.expenses.length > 0 && (
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="bg-background">
              Expenses: ${totalExpenses.toFixed(2)}
            </Badge>
            <Badge 
              variant="outline" 
              className={profit >= 0 ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}
            >
              Profit: ${profit.toFixed(2)}
            </Badge>
          </div>
        )}
      </div>
      
      <Card className="p-4">
        {historyEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No history available
          </div>
        ) : (
          <div className="space-y-4">
            {historyEvents.map((event, index) => {
              const Icon = event.icon
              const isLast = index === historyEvents.length - 1
              
              return (
                <div key={event.id} className="flex gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-border" />
                  )}
                  
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center ${event.iconColor} relative z-10`}>
                    <Icon size={14} weight="bold" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.title}</div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {event.amount !== undefined && (
                          <div className="text-sm font-semibold text-red-600">
                            -${event.amount.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
