import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { BellSlash, BellRinging, MagnifyingGlass, UserCircle, DeviceMobile, Warning } from '@phosphor-icons/react'
import type { Customer, CustomerSmsPreferences } from '@/lib/types'

interface CustomerSmsOptOutsProps {
  customers: Customer[]
  smsPreferences: CustomerSmsPreferences[]
  onUpdatePreferences: (preferences: CustomerSmsPreferences) => void
}

export function CustomerSmsOptOuts({ customers, smsPreferences, onUpdatePreferences }: CustomerSmsOptOutsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getCustomerPreferences = (customerId: string): CustomerSmsPreferences => {
    const existing = smsPreferences.find((p) => p.customerId === customerId)
    if (existing) return existing

    return {
      customerId,
      optedOut: false,
      allowPaymentReminders: true,
      allowOrderUpdates: true,
      allowMarketingMessages: true,
      lastUpdated: new Date().toISOString(),
    }
  }

  const handleOpenDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCustomer(null)
  }

  const handleUpdatePreferences = (updates: Partial<CustomerSmsPreferences>) => {
    if (!selectedCustomer) return

    const currentPrefs = getCustomerPreferences(selectedCustomer.id)
    const updatedPrefs: CustomerSmsPreferences = {
      ...currentPrefs,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }

    onUpdatePreferences(updatedPrefs)
    toast.success('SMS preferences updated')
  }

  const handleOptOut = (reason?: string) => {
    if (!selectedCustomer) return

    handleUpdatePreferences({
      optedOut: true,
      optedOutDate: new Date().toISOString(),
      optedOutReason: reason,
      allowPaymentReminders: false,
      allowOrderUpdates: false,
      allowMarketingMessages: false,
    })
  }

  const handleOptIn = () => {
    if (!selectedCustomer) return

    handleUpdatePreferences({
      optedOut: false,
      optedOutDate: undefined,
      optedOutReason: undefined,
      allowPaymentReminders: true,
      allowOrderUpdates: true,
      allowMarketingMessages: false,
    })
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.company?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    )
  })

  const optedOutCustomers = customers.filter((customer) => {
    const prefs = getCustomerPreferences(customer.id)
    return prefs.optedOut
  })

  const activeCustomers = customers.filter((customer) => {
    const prefs = getCustomerPreferences(customer.id)
    return !prefs.optedOut
  })

  const currentPrefs = selectedCustomer ? getCustomerPreferences(selectedCustomer.id) : null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Customer SMS Opt-Out Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage customer SMS preferences and opt-out requests
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCircle size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{customers.length}</div>
              <div className="text-xs text-muted-foreground">Total Customers</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BellRinging size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCustomers.length}</div>
              <div className="text-xs text-muted-foreground">SMS Enabled</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <BellSlash size={24} className="text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">{optedOutCustomers.length}</div>
              <div className="text-xs text-muted-foreground">Opted Out</div>
            </div>
          </div>
        </Card>
      </div>

      {optedOutCustomers.length > 0 && (
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <Warning size={18} className="text-yellow-500" />
          <AlertDescription className="text-sm ml-2">
            {optedOutCustomers.length} customer{optedOutCustomers.length > 1 ? 's have' : ' has'} opted out of SMS messages.
            Do not send SMS to opted-out customers to comply with regulations.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name, email, company, or phone..."
          className="pl-10"
        />
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No customers found</p>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const prefs = getCustomerPreferences(customer.id)
            return (
              <Card key={customer.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted">
                      <UserCircle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{customer.name}</h4>
                        {prefs.optedOut ? (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            <BellSlash size={12} className="mr-1" />
                            Opted Out
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs flex-shrink-0">
                            <BellRinging size={12} className="mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>{customer.email}</div>
                        {customer.company && <div>{customer.company}</div>}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <DeviceMobile size={12} />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      {prefs.optedOut && prefs.optedOutReason && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <strong>Reason:</strong> {prefs.optedOutReason}
                        </div>
                      )}
                      {!prefs.optedOut && (
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          {prefs.allowPaymentReminders && (
                            <Badge variant="outline" className="text-xs">Payment Reminders</Badge>
                          )}
                          {prefs.allowOrderUpdates && (
                            <Badge variant="outline" className="text-xs">Order Updates</Badge>
                          )}
                          {prefs.allowMarketingMessages && (
                            <Badge variant="outline" className="text-xs">Marketing</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(customer)}
                  >
                    Manage
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>SMS Preferences - {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Manage SMS messaging preferences for this customer
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && currentPrefs && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <strong>Email:</strong> {selectedCustomer.email}
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <DeviceMobile size={16} />
                    <strong>Phone:</strong> {selectedCustomer.phone}
                  </div>
                )}
                {selectedCustomer.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <strong>Company:</strong> {selectedCustomer.company}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-semibold">SMS Status</Label>
                    <p className="text-xs text-muted-foreground">
                      {currentPrefs.optedOut
                        ? 'Customer has opted out of SMS messages'
                        : 'Customer is subscribed to SMS messages'}
                    </p>
                  </div>
                  {currentPrefs.optedOut ? (
                    <Button size="sm" onClick={handleOptIn}>
                      Opt In
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Reason for opt-out (optional):')
                        handleOptOut(reason || undefined)
                      }}
                    >
                      Opt Out
                    </Button>
                  )}
                </div>

                {currentPrefs.optedOut && currentPrefs.optedOutDate && (
                  <Alert className="border-yellow-500/30 bg-yellow-500/5">
                    <Warning size={16} className="text-yellow-500" />
                    <AlertDescription className="text-xs ml-2">
                      Opted out on {new Date(currentPrefs.optedOutDate).toLocaleDateString()}
                      {currentPrefs.optedOutReason && (
                        <div className="mt-1">Reason: {currentPrefs.optedOutReason}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {!currentPrefs.optedOut && (
                  <>
                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Message Types</Label>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Payment Reminders</div>
                          <div className="text-xs text-muted-foreground">
                            Overdue invoice and balance notifications
                          </div>
                        </div>
                        <Switch
                          checked={currentPrefs.allowPaymentReminders}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences({ allowPaymentReminders: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Order Updates</div>
                          <div className="text-xs text-muted-foreground">
                            Order ready, shipped, and status notifications
                          </div>
                        </div>
                        <Switch
                          checked={currentPrefs.allowOrderUpdates}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences({ allowOrderUpdates: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Marketing Messages</div>
                          <div className="text-xs text-muted-foreground">
                            Promotions, offers, and announcements
                          </div>
                        </div>
                        <Switch
                          checked={currentPrefs.allowMarketingMessages}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences({ allowMarketingMessages: checked })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <Alert>
                <Warning size={16} />
                <AlertDescription className="text-xs ml-2">
                  <strong>Compliance Notice:</strong> Customers who opt out or reply "STOP" to SMS messages
                  must not receive further SMS communications. Failure to comply may result in legal penalties.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
