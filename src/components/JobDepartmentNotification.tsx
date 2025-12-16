import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, CheckCircle, Envelope } from '@phosphor-icons/react'
import type { Job, DecorationType } from '@/lib/types'
import { toast } from 'sonner'

interface Department {
  id: string
  name: string
  email: string
  methods: DecorationType[]
  icon: string
}

const DEPARTMENTS: Department[] = [
  {
    id: 'screen-printing',
    name: 'Screen Printing',
    email: 'screenprinting@mintprints.com',
    methods: ['screen-print'],
    icon: '🎨',
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    email: 'embroidery@mintprints.com',
    methods: ['embroidery'],
    icon: '🧵',
  },
  {
    id: 'digital',
    name: 'Digital Printing',
    email: 'digital@mintprints.com',
    methods: ['digital-print', 'dtg', 'digital-transfer'],
    icon: '🖨️',
  },
  {
    id: 'artwork',
    name: 'Artwork & Design',
    email: 'artwork@mintprints.com',
    methods: [],
    icon: '✏️',
  },
]

interface JobDepartmentNotificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job
}

export function JobDepartmentNotification({
  open,
  onOpenChange,
  job,
}: JobDepartmentNotificationProps) {
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set())
  const [notified, setNotified] = useState(false)

  const relevantDepartments = DEPARTMENTS.filter(dept => {
    if (dept.methods.length === 0) return true
    
    return job.line_items.some(item => 
      item.decorations?.some(decoration => 
        dept.methods.includes(decoration.method)
      )
    )
  })

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev => {
      const next = new Set(prev)
      if (next.has(deptId)) {
        next.delete(deptId)
      } else {
        next.add(deptId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedDepartments(new Set(relevantDepartments.map(d => d.id)))
  }

  const handleNotify = () => {
    if (selectedDepartments.size === 0) {
      toast.error('Please select at least one department')
      return
    }

    const selectedDepts = DEPARTMENTS.filter(d => selectedDepartments.has(d.id))
    
    selectedDepts.forEach(dept => {
      console.log(`Notifying ${dept.name} at ${dept.email} about job ${job.job_number}`)
    })

    setNotified(true)
    toast.success(`Notified ${selectedDepartments.size} department${selectedDepartments.size !== 1 ? 's' : ''}`)
    
    setTimeout(() => {
      onOpenChange(false)
      setNotified(false)
      setSelectedDepartments(new Set())
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell size={24} className="text-primary" />
            Notify Departments
          </DialogTitle>
          <DialogDescription>
            Select departments to notify about job {job.job_number} - {job.nickname || job.customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {relevantDepartments.length} relevant department{relevantDepartments.length !== 1 ? 's' : ''} detected
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          </div>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {relevantDepartments.map(dept => {
                const isSelected = selectedDepartments.has(dept.id)
                const decorationMethods = job.line_items.flatMap(item => 
                  item.decorations?.filter(d => dept.methods.includes(d.method)) || []
                )
                
                return (
                  <Card
                    key={dept.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-secondary'
                    }`}
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDepartment(dept.id)}
                          className="mt-0.5"
                        />
                        <div className="text-2xl">{dept.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{dept.name}</div>
                          <div className="text-sm text-muted-foreground">{dept.email}</div>
                          {decorationMethods.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {decorationMethods.map((dec, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded"
                                >
                                  {dec.location}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={24} className="text-primary" weight="fill" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <div className="font-medium">Email Preview:</div>
            <div className="text-muted-foreground">
              <div className="font-mono text-xs bg-background p-2 rounded border border-border">
                <div><strong>Subject:</strong> New Job Assignment - {job.job_number}</div>
                <div className="mt-2"><strong>Body:</strong></div>
                <div className="mt-1">
                  A new job has been assigned to your department:
                  <br />
                  <br />
                  Job #: {job.job_number}
                  <br />
                  {job.nickname && `Nickname: ${job.nickname}`}
                  {job.nickname && <br />}
                  Customer: {job.customer.name}
                  <br />
                  Due Date: {new Date(job.due_date).toLocaleDateString()}
                  <br />
                  Total Pieces: {job.line_items.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {selectedDepartments.size} department{selectedDepartments.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNotify} disabled={selectedDepartments.size === 0 || notified}>
                {notified ? (
                  <>
                    <CheckCircle size={16} className="mr-2" weight="fill" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Envelope size={16} className="mr-2" />
                    Send Notifications
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
