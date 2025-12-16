import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Job } from '@/lib/types'
import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO, differenceInDays, addWeeks, subWeeks } from 'date-fns'
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react'

interface ProductionCalendarProps {
  jobs: Job[]
  onSelectJob?: (job: Job) => void
}

export function ProductionCalendar({ jobs, onSelectJob }: ProductionCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  const jobsInWeek = jobs.filter(job => {
    if (!job.due_date) return false
    const dueDate = parseISO(job.due_date)
    return daysOfWeek.some(day => isSameDay(day, dueDate))
  })
  
  const getJobsForDay = (day: Date) => {
    return jobsInWeek.filter(job => {
      const dueDate = parseISO(job.due_date)
      return isSameDay(day, dueDate)
    })
  }
  
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'bg-slate-500'
      case 'art-approval': return 'bg-yellow-500'
      case 'scheduled': return 'bg-blue-500'
      case 'printing': return 'bg-purple-500'
      case 'finishing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'shipped': return 'bg-teal-500'
      case 'delivered': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }
  
  const totalCapacity = jobsInWeek.reduce((sum, job) => {
    return sum + job.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  }, 0)
  
  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    if (onSelectJob) {
      onSelectJob(job)
    }
  }
  
  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarBlank size={24} className="text-primary" weight="fill" />
            <h3 className="text-lg font-semibold">Production Schedule</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <CaretLeft size={18} />
            </Button>
            <div className="text-sm font-medium min-w-[180px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <CaretRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day, idx) => {
            const dayJobs = getJobsForDay(day)
            const isToday = isSameDay(day, new Date())
            const dayCapacity = dayJobs.reduce((sum, job) => {
              return sum + job.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0)
            }, 0)
            
            return (
              <div 
                key={idx}
                className={`border rounded-lg p-2 min-h-[120px] ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-bold mb-2 ${
                  isToday ? 'text-primary' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1.5">
                  {dayJobs.slice(0, 3).map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleJobClick(job)}
                      className={`w-full text-left p-1.5 rounded text-xs ${getStatusColor(job.status)} text-white hover:brightness-110 transition-all`}
                    >
                      <div className="font-medium truncate">
                        {job.nickname || job.job_number}
                      </div>
                      <div className="text-[10px] opacity-90 truncate">
                        {job.customer.company || job.customer.name}
                      </div>
                    </button>
                  ))}
                  {dayJobs.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center pt-1">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                </div>
                
                {dayCapacity > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="text-[10px] text-muted-foreground">
                      {dayCapacity} pieces
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{jobsInWeek.length}</span> jobs this week
          </div>
          <div className="text-sm text-muted-foreground">
            Total capacity: <span className="font-semibold text-foreground">{totalCapacity}</span> pieces
          </div>
        </div>
      </Card>
      
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent>
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.nickname || selectedJob.job_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{selectedJob.customer.company || selectedJob.customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className="font-medium">{format(parseISO(selectedJob.due_date), 'MMMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className="mt-1">{selectedJob.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Line Items</div>
                  <div className="mt-1 space-y-1">
                    {selectedJob.line_items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        {item.quantity}× {item.product_name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
