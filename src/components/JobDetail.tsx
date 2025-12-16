import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { ProductMockup } from '@/components/ProductMockup'
import { ArtworkUpload } from '@/components/ArtworkUpload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Check, Images, UploadSimple } from '@phosphor-icons/react'
import type { Job, JobStatus, ArtworkFile } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface JobDetailProps {
  job: Job
  onBack: () => void
  onUpdateStatus: (status: JobStatus) => void
  onUpdateArtwork?: (itemId: string, artwork: ArtworkFile[]) => void
  isInline?: boolean
}

const statusSteps: JobStatus[] = ['pending', 'art-approval', 'scheduled', 'printing', 'finishing', 'ready']

export function JobDetail({ job, onBack, onUpdateStatus, onUpdateArtwork, isInline = false }: JobDetailProps) {
  const dueDate = new Date(job.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const currentStepIndex = statusSteps.indexOf(job.status)
  const [mockupView, setMockupView] = useState<'front' | 'back'>('front')
  const primaryItem = job.line_items[0]
  const bulkUploadRef = useRef<HTMLInputElement>(null)

  const handleArtworkApproval = (itemId: string, location: string, approved: boolean) => {
    if (!onUpdateArtwork) return
    
    const item = job.line_items.find(i => i.id === itemId)
    if (!item?.artwork) return

    const updatedArtwork = item.artwork.map(a => 
      a.location === location ? { ...a, approved } : a
    )
    
    onUpdateArtwork(itemId, updatedArtwork)
  }

  const handleBulkUpload = (itemId: string, files: FileList) => {
    if (!onUpdateArtwork) return
    
    const item = job.line_items.find(i => i.id === itemId)
    if (!item) return

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('No valid image files found')
      return
    }

    if (imageFiles.length !== files.length) {
      toast.warning(`${files.length - imageFiles.length} non-image files were skipped`)
    }

    const artworkPromises = imageFiles.map((file, index) => {
      return new Promise<ArtworkFile>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          const location = item.print_locations[index % item.print_locations.length] || 'front'
          resolve({
            location,
            dataUrl,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            approved: false
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(artworkPromises).then(newArtworks => {
      const existingArtwork = item.artwork || []
      const updatedArtwork = [...existingArtwork]
      
      newArtworks.forEach(newArt => {
        const existingIndex = updatedArtwork.findIndex(a => a.location === newArt.location)
        if (existingIndex >= 0) {
          updatedArtwork[existingIndex] = newArt
        } else {
          updatedArtwork.push(newArt)
        }
      })
      
      onUpdateArtwork(itemId, updatedArtwork)
      toast.success(`${newArtworks.length} file${newArtworks.length > 1 ? 's' : ''} uploaded`)
    })
  }

  const allArtworkApproved = job.line_items.every(item => {
    const hasArtwork = (item.artwork || []).length > 0
    return !hasArtwork || (item.artwork || []).every(a => a.approved)
  })

  const totalArtworkFiles = job.line_items.reduce((sum, item) => sum + (item.artwork || []).length, 0)
  const approvedArtworkFiles = job.line_items.reduce((sum, item) => 
    sum + (item.artwork || []).filter(a => a.approved).length, 0
  )
  
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

          {totalArtworkFiles > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Artwork Approval Status</div>
                <div className={`text-sm font-semibold ${allArtworkApproved ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {approvedArtworkFiles}/{totalArtworkFiles} Approved
                  {allArtworkApproved && <Check size={16} className="inline ml-1" weight="bold" />}
                </div>
              </div>
            </div>
          )}
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
                <div className="flex items-start gap-4 mb-4">
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

                {item.print_locations.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold">Artwork Files</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.multiple = true
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            if (files) {
                              handleBulkUpload(item.id, files)
                            }
                          }
                          input.click()
                        }}
                      >
                        <Images size={16} className="mr-2" />
                        Upload Multiple Files
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {item.print_locations.map(location => {
                        const artwork = (item.artwork || []).find(a => a.location === location)
                        return (
                          <ArtworkUpload
                            key={location}
                            location={location}
                            artwork={artwork}
                            onUpload={() => {}}
                            onRemove={() => {}}
                            canApprove={true}
                            onApprove={(approved) => handleArtworkApproval(item.id, location, approved)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
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
