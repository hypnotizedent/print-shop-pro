import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, CurrencyDollar, Receipt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Payment, PaymentMethod } from '@/lib/types'

interface PaymentTrackerProps {
  quoteId: string
  jobId?: string
  quoteTotal: number
  payments: Payment[]
  onAddPayment: (payment: Payment) => void
  onDeletePayment: (paymentId: string) => void
}

export function PaymentTracker({ 
  quoteId, 
  jobId,
  quoteTotal, 
  payments, 
  onAddPayment, 
  onDeletePayment 
}: PaymentTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [customMethod, setCustomMethod] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingBalance = quoteTotal - totalPaid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      quoteId,
      jobId,
      amount: paymentAmount,
      method,
      customMethod: method === 'other' ? customMethod : undefined,
      reference: reference || undefined,
      notes: notes || undefined,
      receivedDate,
      createdAt: new Date().toISOString(),
    }

    onAddPayment(payment)
    toast.success(`Payment of $${paymentAmount.toFixed(2)} recorded`)
    
    setAmount('')
    setReference('')
    setNotes('')
    setCustomMethod('')
    setReceivedDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getMethodLabel = (payment: Payment) => {
    if (payment.method === 'other' && payment.customMethod) {
      return payment.customMethod
    }
    return payment.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Payment Tracking</h3>
        {!showForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Payment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Quote Total</div>
          <div className="text-2xl font-bold text-foreground">${quoteTotal.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-primary">${totalPaid.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Balance Due</div>
          <div className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-destructive' : 'text-primary'}`}>
            ${remainingBalance.toFixed(2)}
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="p-4 border-primary/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <CurrencyDollar size={18} className="text-primary" />
                Record Payment
              </h4>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="received-date">Date Received *</Label>
                <Input
                  id="received-date"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="custom-method">Specify Payment Method</Label>
                <Input
                  id="custom-method"
                  placeholder="e.g., Square, Stripe, Wire Transfer"
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reference">Reference / Transaction ID</Label>
              <Input
                id="reference"
                placeholder="Check number, transaction ID, etc."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional payment details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full gap-2">
              <Receipt size={18} />
              Record Payment
            </Button>
          </form>
        </Card>
      )}

      {payments.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Payment History</h4>
          <div className="space-y-2">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {getMethodLabel(payment)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.receivedDate)}
                      </span>
                    </div>
                    {payment.reference && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {payment.reference}
                      </div>
                    )}
                    {payment.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this payment record?')) {
                        onDeletePayment(payment.id)
                        toast.success('Payment deleted')
                      }
                    }}
                  >
                    <Trash size={16} className="text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No payments recorded yet. Click "Add Payment" to track manual payments.
        </div>
      )}
    </div>
  )
}
