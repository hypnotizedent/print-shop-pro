import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, EnvelopeSimple, Phone, Buildings, Pencil, Check, X, MapPin } from '@phosphor-icons/react'
import type { Customer, Quote, Job, CustomerTier } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

interface CustomerDetailProps {
  customer: Customer
  quotes: Quote[]
  jobs: Job[]
  onBack: () => void
  onUpdateCustomer: (customer: Customer) => void
  onSelectQuote?: (quote: Quote) => void
  onSelectJob?: (job: Job) => void
}

export function CustomerDetail({ 
  customer, 
  quotes, 
  jobs, 
  onBack, 
  onUpdateCustomer,
  onSelectQuote,
  onSelectJob
}: CustomerDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)
  
  const customerQuotes = quotes.filter(q => q.customer.id === customer.id)
  const customerJobs = jobs.filter(j => j.customer.id === customer.id)
  
  const totalRevenue = customerQuotes
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + q.total, 0)
  
  const handleSave = () => {
    onUpdateCustomer(editedCustomer)
    setIsEditing(false)
    toast.success('Customer updated')
  }
  
  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }
  
  const getTierColor = (tier?: CustomerTier) => {
    switch (tier) {
      case 'platinum': return 'bg-slate-300 text-slate-900'
      case 'gold': return 'bg-yellow-500 text-yellow-900'
      case 'silver': return 'bg-slate-400 text-slate-900'
      case 'bronze': return 'bg-orange-600 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Customer Details</h1>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil size={18} className="mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check size={18} className="mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">
              Contact Information
            </h2>
            
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">{customer.name}</div>
                  {customer.tier && (
                    <Badge className={`uppercase text-xs ${getTierColor(customer.tier)}`}>
                      {customer.tier} Tier
                    </Badge>
                  )}
                </div>
                {customer.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Buildings size={18} />
                    <span>{customer.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <EnvelopeSimple size={18} />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={18} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{customer.address.street}</div>
                      <div>
                        {customer.address.city}, {customer.address.state} {customer.address.zip}
                      </div>
                      {customer.address.country && <div>{customer.address.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedCustomer.name}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editedCustomer.company || ''}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedCustomer.email}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedCustomer.phone || ''}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Customer Tier</Label>
                  <Select 
                    value={editedCustomer.tier || 'none'} 
                    onValueChange={(value) => setEditedCustomer({ ...editedCustomer, tier: value === 'none' ? undefined : value as CustomerTier })}
                  >
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Tier</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">
                    Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={editedCustomer.address?.street || ''}
                        onChange={(e) => setEditedCustomer({ 
                          ...editedCustomer, 
                          address: { 
                            ...editedCustomer.address,
                            street: e.target.value,
                            city: editedCustomer.address?.city || '',
                            state: editedCustomer.address?.state || '',
                            zip: editedCustomer.address?.zip || '',
                          }
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={editedCustomer.address?.city || ''}
                          onChange={(e) => setEditedCustomer({ 
                            ...editedCustomer, 
                            address: { 
                              ...editedCustomer.address,
                              street: editedCustomer.address?.street || '',
                              city: e.target.value,
                              state: editedCustomer.address?.state || '',
                              zip: editedCustomer.address?.zip || '',
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={editedCustomer.address?.state || ''}
                          onChange={(e) => setEditedCustomer({ 
                            ...editedCustomer, 
                            address: { 
                              ...editedCustomer.address,
                              street: editedCustomer.address?.street || '',
                              city: editedCustomer.address?.city || '',
                              state: e.target.value,
                              zip: editedCustomer.address?.zip || '',
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={editedCustomer.address?.zip || ''}
                          onChange={(e) => setEditedCustomer({ 
                            ...editedCustomer, 
                            address: { 
                              ...editedCustomer.address,
                              street: editedCustomer.address?.street || '',
                              city: editedCustomer.address?.city || '',
                              state: editedCustomer.address?.state || '',
                              zip: e.target.value,
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country (Optional)</Label>
                        <Input
                          id="country"
                          value={editedCustomer.address?.country || ''}
                          onChange={(e) => setEditedCustomer({ 
                            ...editedCustomer, 
                            address: { 
                              ...editedCustomer.address,
                              street: editedCustomer.address?.street || '',
                              city: editedCustomer.address?.city || '',
                              state: editedCustomer.address?.state || '',
                              zip: editedCustomer.address?.zip || '',
                              country: e.target.value,
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Quotes</div>
              <div className="text-3xl font-bold">{customerQuotes.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Jobs</div>
              <div className="text-3xl font-bold">{customerJobs.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            </Card>
          </div>
          
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">
              Quote History ({customerQuotes.length})
            </h2>
            {customerQuotes.length > 0 ? (
              <div className="space-y-2">
                {customerQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onSelectQuote?.(quote)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{quote.quote_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">${quote.total.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{quote.line_items.length} items</div>
                      </div>
                      <StatusBadge status={quote.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No quotes yet
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">
              Job History ({customerJobs.length})
            </h2>
            {customerJobs.length > 0 ? (
              <div className="space-y-2">
                {customerJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onSelectJob?.(job)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{job.job_number}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(job.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{job.line_items.length} items</div>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No jobs yet
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
