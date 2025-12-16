import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Receipt, TrendDown, Calculator } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Expense, ExpenseCategory } from '@/lib/types'

interface ExpenseTrackerProps {
  jobId: string
  jobTotal: number
  expenses: Expense[]
  onAddExpense: (expense: Expense) => void
  onDeleteExpense: (expenseId: string) => void
}

export function ExpenseTracker({ 
  jobId, 
  jobTotal,
  expenses, 
  onAddExpense, 
  onDeleteExpense 
}: ExpenseTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>('materials')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [vendor, setVendor] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const profitMargin = jobTotal - totalExpenses
  const profitMarginPercent = jobTotal > 0 ? (profitMargin / jobTotal) * 100 : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let expenseAmount: number

    if (quantity && unitCost) {
      const qty = parseFloat(quantity)
      const cost = parseFloat(unitCost)
      if (isNaN(qty) || isNaN(cost)) {
        toast.error('Invalid quantity or unit cost')
        return
      }
      expenseAmount = qty * cost
    } else if (amount) {
      expenseAmount = parseFloat(amount)
      if (isNaN(expenseAmount)) {
        toast.error('Invalid expense amount')
        return
      }
    } else {
      toast.error('Please enter either amount or quantity + unit cost')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      jobId,
      category,
      customCategory: category === 'other' ? customCategory : undefined,
      description: description.trim(),
      amount: expenseAmount,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unitCost: unitCost ? parseFloat(unitCost) : undefined,
      vendor: vendor.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      expenseDate,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    onAddExpense(expense)
    toast.success(`Expense of $${expenseAmount.toFixed(2)} recorded`)
    
    resetForm()
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setQuantity('')
    setUnitCost('')
    setVendor('')
    setInvoiceNumber('')
    setNotes('')
    setCustomCategory('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getCategoryLabel = (expense: Expense) => {
    if (expense.category === 'other' && expense.customCategory) {
      return expense.customCategory
    }
    return expense.category.charAt(0).toUpperCase() + expense.category.slice(1)
  }

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'materials': return 'bg-blue-500/20 text-blue-400'
      case 'labor': return 'bg-purple-500/20 text-purple-400'
      case 'shipping': return 'bg-yellow-500/20 text-yellow-400'
      case 'outsourcing': return 'bg-orange-500/20 text-orange-400'
      case 'supplies': return 'bg-green-500/20 text-green-400'
      case 'other': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Job Expenses (COGS)</h3>
        {!showForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Expense
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Job Total</div>
          <div className="text-xl font-bold text-foreground">${jobTotal.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Expenses</div>
          <div className="text-xl font-bold text-destructive">${totalExpenses.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Profit</div>
          <div className={`text-xl font-bold ${profitMargin >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ${profitMargin.toFixed(2)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Margin</div>
          <div className={`text-xl font-bold ${profitMarginPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {profitMarginPercent.toFixed(1)}%
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="p-4 border-primary/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Receipt size={18} className="text-primary" />
                Record Expense
              </h4>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="outsourcing">Outsourcing</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-date">Date *</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {category === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="custom-category">Specify Category</Label>
                <Input
                  id="custom-category"
                  placeholder="e.g., Equipment Rental"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., 150 Gildan 5000 T-Shirts - Black"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value)
                    if (e.target.value && unitCost) {
                      const total = parseFloat(e.target.value) * parseFloat(unitCost)
                      setAmount(total.toFixed(2))
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-cost">Unit Cost</Label>
                <Input
                  id="unit-cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={unitCost}
                  onChange={(e) => {
                    setUnitCost(e.target.value)
                    if (e.target.value && quantity) {
                      const total = parseFloat(quantity) * parseFloat(e.target.value)
                      setAmount(total.toFixed(2))
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-1">
                  Amount *
                  {quantity && unitCost && (
                    <Calculator size={12} className="text-primary" />
                  )}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., SanMar, S&S Activewear"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice #</Label>
                <Input
                  id="invoice-number"
                  placeholder="Vendor invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-notes">Notes</Label>
              <Textarea
                id="expense-notes"
                placeholder="Additional expense details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full gap-2">
              <TrendDown size={18} />
              Record Expense
            </Button>
          </form>
        </Card>
      )}

      {expenses.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground">Expense History</h4>
          <div className="space-y-2">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-destructive">
                        ${expense.amount.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(expense.category)}`}>
                        {getCategoryLabel(expense)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(expense.expenseDate)}
                      </span>
                    </div>
                    <div className="text-sm text-foreground mb-1">
                      {expense.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {expense.quantity && expense.unitCost && (
                        <span>
                          {expense.quantity} × ${expense.unitCost.toFixed(2)}
                        </span>
                      )}
                      {expense.vendor && (
                        <span>Vendor: {expense.vendor}</span>
                      )}
                      {expense.invoiceNumber && (
                        <span>Inv: {expense.invoiceNumber}</span>
                      )}
                    </div>
                    {expense.notes && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        {expense.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this expense record?')) {
                        onDeleteExpense(expense.id)
                        toast.success('Expense deleted')
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

      {expenses.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No expenses recorded yet. Click "Add Expense" to track costs for this job.
        </div>
      )}
    </div>
  )
}
