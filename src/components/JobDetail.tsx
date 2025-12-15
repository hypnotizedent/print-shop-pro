import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { ProductMockup } from '@/components/ProductMockup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Check } from '@phosphor-icons/react'
import type { Job, JobStatus } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface JobDetailProps {
  job: Job
  onBack: () => void
  onUpdateStatus: (status: JobStatus) => void
}

const statusSteps: JobStatus[] = ['pending', 'art-approval', 'scheduled', 'printing', 'finishing', 'ready']

export function JobDetail({ job, onBack, onUpdateStatus }: JobDetailProps) {
  const dueDate = new Date(job.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const currentStepIndex = statusSteps.indexOf(job.status)
  const [mockupView, setMockupView] = useState<'front' | 'back'>('front')
  const primaryItem = job.line_items[0]
  
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Job {job.job_number}</h1>
              <div className="text-sm text-muted-foreground mt-1">
                From Quote {job.quote_id ? `Q-${job.quote_id.split('-')[1]}` : 'Direct Order'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Print Work Order
            </Button>
            {job.status !== 'delivered' && (
              <Button 
                onClick={() => {
                  const nextIndex = currentStepIndex + 1
                  if (nextIndex < statusSteps.length) {
                    onUpdateStatus(statusSteps[nextIndex])
                  }
                }}
              >
                <Check size={18} className="mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
        
        <Card className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </div>
              <Select value={job.status} onValueChange={(value) => onUpdateStatus(value as JobStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="art-approval">Art Approval</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="printing">Printing</SelectItem>
                  <SelectItem value="finishing">Finishing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {statusSteps.map((status, index) => (
                <div key={status} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    index <= currentStepIndex 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-border text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <Check size={16} weight="bold" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              {statusSteps.map((status) => (
                <div key={status} className="capitalize text-center" style={{ width: '16.66%' }}>
                  {status.replace('-', ' ')}
                </div>
              ))}
            </div>
          </div>
          
          {job.progress > 0 && job.progress < 100 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Production Progress</span>
                <span className="text-sm font-semibold">{job.progress}%</span>
              </div>
              <Progress value={job.progress} />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Customer</div>
              <div className="font-semibold">{job.customer.company || job.customer.name}</div>
              <div className="text-sm text-muted-foreground">{job.customer.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Due Date</div>
              <div className="font-semibold">
                {new Date(job.due_date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className={`text-sm ${daysUntilDue < 3 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {daysUntilDue === 0 ? 'Due today!' :
                 daysUntilDue === 1 ? 'Due tomorrow' :
                 daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                 `${daysUntilDue} days remaining`}
              </div>
            </div>
          </div>
        </Card>
        
        {primaryItem && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Product Preview
              </div>
              <div className="flex gap-2">
                <Button
                  variant={mockupView === 'front' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMockupView('front')}
                >
                  Front
                </Button>
                <Button
                  variant={mockupView === 'back' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMockupView('back')}
                >
                  Back
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <ProductMockup
                productType={primaryItem.product_type}
                color={primaryItem.product_color || '#94a3b8'}
                size="large"
                showPrintArea={true}
                view={mockupView}
              />
            </div>
            <div className="text-center mt-4 space-y-1">
              <div className="font-semibold">{primaryItem.product_name}</div>
              <div className="text-sm text-muted-foreground">
                {primaryItem.print_locations.map(l => l.replace('-', ' ')).join(', ')}
              </div>
            </div>
          </Card>
        )}
        
        <div>
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            Line Items
          </div>
          <div className="space-y-3">
            {job.line_items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12">
                    <ProductMockup
                      productType={item.product_type}
                      color={item.product_color || '#94a3b8'}
                      size="small"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-1">
                      {item.quantity}× {item.product_name} ({item.product_type})
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="capitalize">{item.decoration.replace('-', ' ')}</span>
                        {item.print_locations.length > 0 && (
                          <span> - {item.print_locations.map(l => l.replace('-', ' ')).join(', ')}</span>
                        )}
                      </div>
                      <div>
                        {item.colors} {item.colors === 1 ? 'color' : 'colors'}
                      </div>
                      <div className="flex gap-3 mt-2">
                        {Object.entries(item.sizes)
                          .filter(([, qty]) => qty > 0)
                          .map(([size, qty]) => (
                            <span key={size} className="text-xs">
                              {size}: <span className="font-semibold">{qty}</span>
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {job.production_notes && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
              Production Notes
            </div>
            <Card className="p-4">
              <p className="text-sm">{job.production_notes}</p>
            </Card>
          </div>
        )}
        
        {job.assigned_to.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
              Assigned To
            </div>
            <div className="flex gap-2">
              {job.assigned_to.map((person) => (
                <div key={person} className="px-3 py-1 bg-secondary rounded-full text-sm">
                  {person}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
