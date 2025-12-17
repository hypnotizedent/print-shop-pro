import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { ProductMockup } from '@/components/ProductMockup'
import { ArtworkUpload } from '@/components/ArtworkUpload'
import { JobDepartmentNotification } from '@/components/JobDepartmentNotification'
import { JobHistory } from '@/components/JobHistory'
import { JobArtworkReview } from '@/components/JobArtworkReview'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, Check, Images, UploadSimple, DotsThree, UserCircle, Tag, Truck, Bell, EnvelopeSimple, CurrencyDollar } from '@phosphor-icons/react'
import type { Job, JobStatus, LegacyArtworkFile, Expense } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { ExpenseTracker } from '@/components/ExpenseTracker'
import { sendArtworkNotificationEmail, sendBulkArtworkApprovalEmail } from '@/lib/artwork-email'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface JobDetailProps {
  job: Job
  onBack: () => void
  onUpdateStatus: (status: JobStatus) => void
  onUpdateArtwork?: (itemId: string, artwork: LegacyArtworkFile[]) => void
  onNavigateToCustomer?: () => void
  onUpdateNickname?: (nickname: string) => void
  onUpdateExpenses?: (expenses: Expense[]) => void
  onUpdateProductionNotes?: (notes: string) => void
  isInline?: boolean
}

const statusSteps: JobStatus[] = ['pending', 'art-approval', 'scheduled', 'printing', 'finishing', 'ready']

export function JobDetail({ job, onBack, onUpdateStatus, onUpdateArtwork, onNavigateToCustomer, onUpdateNickname, onUpdateExpenses, onUpdateProductionNotes, isInline = false }: JobDetailProps) {
  const dueDate = new Date(job.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const currentStepIndex = statusSteps.indexOf(job.status)
  const [mockupView, setMockupView] = useState<'front' | 'back'>('front')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nicknameValue, setNicknameValue] = useState(job.nickname || '')
  const [isEditingProductionNotes, setIsEditingProductionNotes] = useState(false)
  const [productionNotesValue, setProductionNotesValue] = useState(job.production_notes || '')
  const [showDepartmentNotification, setShowDepartmentNotification] = useState(false)
  const [showExpenseTracker, setShowExpenseTracker] = useState(false)
  const [activeJobTab, setActiveJobTab] = useState<'details' | 'artwork-review'>('details')
  const primaryItem = job.line_items[0]
  const bulkUploadRef = useRef<HTMLInputElement>(null)

  const handleArtworkApproval = (itemId: string, location: string, approved: boolean) => {
    if (!onUpdateArtwork) return
    
    const item = job.line_items.find(i => i.id === itemId)
    if (!item?.artwork) return

    const artwork = item.artwork.find(a => a.location === location)
    if (!artwork) return

    const updatedArtwork = item.artwork.map(a => 
      a.location === location ? { ...a, approved } : a
    )
    
    onUpdateArtwork(itemId, updatedArtwork)
    
    const emailSent = sendArtworkNotificationEmail({
      job,
      itemId,
      artwork: { ...artwork, approved },
      approved
    })
    
    if (emailSent) {
      toast.success(
        `Email notification sent to ${job.customer.name}`,
        {
          description: `Artwork ${approved ? 'approved' : 'rejected'} for ${location}`,
          duration: 4000,
        }
      )
    }
    
    const allApprovedAfterUpdate = updatedArtwork.every(a => a.approved)
    if (allApprovedAfterUpdate && updatedArtwork.length > 0) {
      setTimeout(() => {
        const bulkEmailSent = sendBulkArtworkApprovalEmail(job, itemId, updatedArtwork)
        if (bulkEmailSent) {
          toast.success(
            `All artwork approved! Confirmation email sent`,
            {
              description: `${job.customer.name} notified - Job ready for production`,
              duration: 5000,
            }
          )
        }
      }, 500)
    }
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
      return new Promise<LegacyArtworkFile>((resolve) => {
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
  const pendingCount = totalArtworkFiles - approvedArtworkFiles
  
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {!isInline && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Job {job.job_number}</h1>
                {!isEditingNickname && job.nickname && (
                  <span 
                    className="text-lg text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onUpdateNickname && setIsEditingNickname(true)}
                    title="Click to edit"
                  >
                    ({job.nickname})
                  </span>
                )}
                {!isEditingNickname && !job.nickname && onUpdateNickname && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingNickname(true)}
                    className="text-xs"
                  >
                    + Add nickname
                  </Button>
                )}
                {isEditingNickname && onUpdateNickname && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nicknameValue}
                      onChange={(e) => setNicknameValue(e.target.value)}
                      placeholder="Enter nickname..."
                      className="px-2 py-1 border border-border rounded bg-background text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateNickname(nicknameValue)
                          setIsEditingNickname(false)
                          toast.success('Nickname updated')
                        } else if (e.key === 'Escape') {
                          setNicknameValue(job.nickname || '')
                          setIsEditingNickname(false)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        onUpdateNickname(nicknameValue)
                        setIsEditingNickname(false)
                        toast.success('Nickname updated')
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNicknameValue(job.nickname || '')
                        setIsEditingNickname(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <DotsThree size={20} weight="bold" />
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {onNavigateToCustomer && (
                  <>
                    <DropdownMenuItem onClick={onNavigateToCustomer}>
                      <UserCircle size={18} className="mr-2" />
                      View Customer Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setShowExpenseTracker(true)}>
                  <CurrencyDollar size={18} className="mr-2" />
                  Job Expenses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDepartmentNotification(true)}>
                  <Bell size={18} className="mr-2" />
                  Notify Departments
                </DropdownMenuItem>
                {totalArtworkFiles > 0 && (
                  <DropdownMenuItem onClick={() => {
                    const item = job.line_items[0]
                    if (item?.artwork && item.artwork.length > 0) {
                      const allApproved = item.artwork.every(a => a.approved)
                      if (allApproved) {
                        sendBulkArtworkApprovalEmail(job, item.id, item.artwork)
                        toast.success('Artwork approval email sent to customer')
                      } else {
                        toast.info('Not all artwork is approved yet')
                      }
                    }
                  }}>
                    <EnvelopeSimple size={18} className="mr-2" />
                    Send Artwork Status Email
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Label printing coming soon')}>
                  <Tag size={18} className="mr-2" />
                  Print Job Labels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Shipping label coming soon')}>
                  <Truck size={18} className="mr-2" />
                  Create Shipping Label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryItem && (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Product Preview
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={mockupView === 'front' ? 'default' : 'outline'}
                    onClick={() => setMockupView('front')}
                  >
                    Front
                  </Button>
                  <Button
                    size="sm"
                    variant={mockupView === 'back' ? 'default' : 'outline'}
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
            </Card>
          )}
          
          <div className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Customer</div>
                  <div className="font-semibold">{job.customer.company || job.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{job.customer.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                  <div className="font-semibold">
                    {new Date(job.due_date).toLocaleDateString('en-US', { 
                      month: 'short', 
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
            
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Select value={job.status} onValueChange={(value) => onUpdateStatus(value as JobStatus)}>
                  <SelectTrigger className="w-full h-8">
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
              
              <div className="flex items-center gap-1.5">
                {statusSteps.map((status, index) => (
                  <div key={status} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors text-xs ${
                      index <= currentStepIndex 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-border text-muted-foreground'
                    }`}>
                      {index < currentStepIndex ? (
                        <Check size={12} weight="bold" />
                      ) : (
                        <span className="font-semibold text-[10px]">{index + 1}</span>
                      )}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </Card>
            
            {totalArtworkFiles > 0 && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Artwork Status</div>
                  <div className={`text-sm font-semibold ${allArtworkApproved ? 'text-primary' : 'text-yellow-400'}`}>
                    {approvedArtworkFiles}/{totalArtworkFiles}
                    {allArtworkApproved && <Check size={14} className="inline ml-1" weight="bold" />}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        
        {onUpdateProductionNotes ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Production Notes
              </div>
              {!isEditingProductionNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProductionNotes(true)}
                  className="text-xs h-7"
                >
                  {productionNotesValue ? 'Edit' : '+ Add Notes'}
                </Button>
              )}
            </div>
            {isEditingProductionNotes ? (
              <div className="space-y-2">
                <textarea
                  value={productionNotesValue}
                  onChange={(e) => setProductionNotesValue(e.target.value)}
                  placeholder="Enter production notes... (customer preferences, special instructions, etc.)"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setProductionNotesValue(job.production_notes || '')
                      setIsEditingProductionNotes(false)
                    }
                    if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      onUpdateProductionNotes(productionNotesValue)
                      setIsEditingProductionNotes(false)
                      toast.success('Production notes saved')
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Press Cmd+S to save, Esc to cancel
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProductionNotesValue(job.production_notes || '')
                        setIsEditingProductionNotes(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onUpdateProductionNotes(productionNotesValue)
                        setIsEditingProductionNotes(false)
                        toast.success('Production notes saved')
                      }}
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="text-sm leading-relaxed cursor-pointer hover:bg-secondary/50 rounded p-2 -m-2 transition-colors min-h-[60px] flex items-center"
                onClick={() => setIsEditingProductionNotes(true)}
              >
                {productionNotesValue || (
                  <span className="text-muted-foreground italic">
                    Click to add production notes...
                  </span>
                )}
              </div>
            )}
          </Card>
        ) : (
          job.production_notes && (
            <Card className="p-4">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">
                Production Notes
              </div>
              <p className="text-sm leading-relaxed">{job.production_notes}</p>
            </Card>
          )
        )}
        
        <JobHistory job={job} />
        
        <Tabs value={activeJobTab} onValueChange={(v) => setActiveJobTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">
              Line Items & Details
            </TabsTrigger>
            <TabsTrigger value="artwork-review">
              Artwork Review Workflow
              {totalArtworkFiles > 0 && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {approvedArtworkFiles}/{totalArtworkFiles}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
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
          </TabsContent>

          <TabsContent value="artwork-review">
            <JobArtworkReview
              job={job}
              onApproveArtwork={(itemId, location, approved) => {
                handleArtworkApproval(itemId, location, approved)
              }}
              onRequestRevision={(itemId, location, notes) => {
                toast.info('Revision request sent', {
                  description: notes,
                  duration: 4000,
                })
              }}
            />
          </TabsContent>
        </Tabs>
        
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

      <JobDepartmentNotification
        open={showDepartmentNotification}
        onOpenChange={setShowDepartmentNotification}
        job={job}
      />
      
      {showExpenseTracker && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Job Expenses</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowExpenseTracker(false)}>
                  <Check size={20} />
                </Button>
              <ExpenseTracker
                jobId={job.id}
                jobTotal={job.line_items.reduce((sum, item) => sum + item.line_total, 0)}
                expenses={job.expenses || []}
                onAddExpense={(expense: Expense) => {
                  if (onUpdateExpenses) {
                    onUpdateExpenses([...(job.expenses || []), expense])
                  }
                }}
                onDeleteExpense={(expenseId: string) => {
                  if (onUpdateExpenses) {
                    onUpdateExpenses((job.expenses || []).filter(e => e.id !== expenseId))
                  }
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}              </div>
              <ExpenseTracker
                jobId={job.id}
                jobTotal={job.line_items.reduce((sum, item) => sum + item.line_total, 0)}
                expenses={job.expenses || []}
                onAddExpense={(expense: Expense) => {
                  if (onUpdateExpenses) {
                    onUpdateExpenses([...(job.expenses || []), expense])
                  }
                }}
                onDeleteExpense={(expenseId: string) => {
                  if (onUpdateExpenses) {
                    onUpdateExpenses((job.expenses || []).filter(e => e.id !== expenseId))
                  }
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}