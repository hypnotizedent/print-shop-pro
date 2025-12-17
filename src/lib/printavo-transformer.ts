/**
 * Printavo API v2 to Mint Prints Data Transformer
 * 
 * This module transforms data from Printavo's GraphQL API v2 format
 * into Mint Prints' internal data structures, ensuring all Printavo
 * fields are properly mapped and preserved.
 */

import type { 
  Customer, 
  Quote, 
  Job, 
  LineItem, 
  Payment, 
  Expense,
  QuoteStatus,
  JobStatus,
  ProductType,
  DecorationType,
  PaymentMethod,
  ExpenseCategory,
  Sizes,
  Decoration,
  CustomerTier
} from './types'
import { generateId } from './data'

// ============================================================================
// Printavo API v2 Type Definitions
// ============================================================================

export interface PrintavoAddress {
  companyName?: string
  customerName?: string
  address1?: string
  address2?: string
  city?: string
  stateIso?: string
  zipCode?: string
  country?: string
}

export interface PrintavoContact {
  id: string
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: PrintavoAddress
  type?: string
}

export interface PrintavoCustomer {
  id: string
  billingAddress?: PrintavoAddress
  companyName?: string
  defaultPaymentTerm?: {
    name?: string
    netDays?: number
  }
  internalNote?: string
  orderCount?: number
  owner?: {
    id: string
    email?: string
    name?: string
  }
  primaryContact?: PrintavoContact
  publicUrl?: string
  resaleNumber?: string
  salesTax?: number
  shippingAddress?: PrintavoAddress
  taxExempt?: boolean
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
}

export interface PrintavoLineItem {
  id: string
  category?: string
  color?: string
  description?: string
  itemNumber?: string
  items?: number
  markupPercentage?: number
  merch?: boolean
  personalizations?: Array<{
    location?: string
    description?: string
    colors?: number
  }>
  position?: number
  price?: number
  sizes?: {
    [key: string]: number
  }
  taxed?: boolean
  styleDescription?: string
  styleNumber?: string
  unitCost?: number
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
}

export interface PrintavoFee {
  id: string
  amount?: number
  name?: string
  description?: string
  taxable?: boolean
  type?: string
}

export interface PrintavoTask {
  id: string
  type?: string
  assignedUser?: {
    id: string
    name?: string
    email?: string
  }
  status?: string
  dueAt?: string
  description?: string
  notes?: string
  completedAt?: string
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
}

export interface PrintavoTransaction {
  id: string
  amount?: number
  type?: 'payment' | 'refund'
  method?: string
  status?: string
  processedAt?: string
  notes?: string
  reference?: string
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
}

export interface PrintavoExpense {
  id: string
  amount?: number
  description?: string
  category?: string
  vendor?: string
  invoiceNumber?: string
  expenseDate?: string
  notes?: string
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
}

export interface PrintavoQuote {
  id: string
  visualId?: string
  contact?: PrintavoContact
  customer?: PrintavoCustomer
  customerNote?: string
  productionNote?: string
  tags?: string[]
  billingAddress?: PrintavoAddress
  shippingAddress?: PrintavoAddress
  owner?: {
    id: string
    email?: string
    name?: string
  }
  nickname?: string
  status?: {
    id: string
    name?: string
  }
  amountPaid?: number
  amountOutstanding?: number
  subtotal?: number
  total?: number
  discount?: number
  discountAmount?: number
  discountAsPercentage?: boolean
  salesTax?: number
  salesTaxAmount?: number
  customerDueAt?: string
  paymentDueAt?: string
  invoiceAt?: string
  startAt?: string
  dueAt?: string
  inProductionAt?: string
  publicUrl?: string
  workorderUrl?: string
  packingSlipUrl?: string
  publicPdf?: string
  visualPoNumber?: string
  merch?: boolean
  paymentRequest?: any
  paymentTerm?: {
    name?: string
    netDays?: number
  }
  threadSummary?: any
  timestamps?: {
    createdAt?: string
    updatedAt?: string
  }
  lineItems?: PrintavoLineItem[]
  fees?: PrintavoFee[]
  tasks?: PrintavoTask[]
  transactions?: PrintavoTransaction[]
  lineItemGroups?: Array<{
    id: string
    name?: string
    lineItems?: PrintavoLineItem[]
  }>
}

export interface PrintavoInvoice extends PrintavoQuote {
  approvalRequests?: Array<{
    id: string
    status?: string
    approver?: {
      name?: string
      email?: string
    }
  }>
  expenses?: PrintavoExpense[]
}

// ============================================================================
// Mapping Configuration
// ============================================================================

const STATUS_MAP: Record<string, QuoteStatus> = {
  'draft': 'draft',
  'pending': 'draft',
  'sent': 'sent',
  'approved': 'approved',
  'accepted': 'approved',
  'rejected': 'rejected',
  'declined': 'rejected',
  'expired': 'expired',
  'cancelled': 'rejected'
}

const JOB_STATUS_MAP: Record<string, JobStatus> = {
  'pending': 'pending',
  'awaiting artwork': 'art-approval',
  'art approval': 'art-approval',
  'in production': 'printing',
  'printing': 'printing',
  'scheduled': 'scheduled',
  'finishing': 'finishing',
  'ready': 'ready',
  'ready for pickup': 'ready',
  'shipped': 'shipped',
  'delivered': 'delivered',
  'completed': 'delivered'
}

const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  't-shirt': 'tshirt',
  'tshirt': 'tshirt',
  'tee': 'tshirt',
  'hoodie': 'hoodie',
  'sweatshirt': 'hoodie',
  'polo': 'polo',
  'hat': 'hat',
  'cap': 'hat',
  'beanie': 'hat'
}

const DECORATION_MAP: Record<string, DecorationType> = {
  'screen print': 'screen-print',
  'screen printing': 'screen-print',
  'screenprint': 'screen-print',
  'dtg': 'dtg',
  'direct to garment': 'dtg',
  'embroidery': 'embroidery',
  'vinyl': 'vinyl',
  'heat transfer': 'vinyl',
  'digital print': 'digital-print',
  'digital transfer': 'digital-transfer'
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  'cash': 'cash',
  'check': 'check',
  'venmo': 'venmo',
  'zelle': 'zelle',
  'paypal': 'paypal',
  'bank transfer': 'bank-transfer',
  'wire transfer': 'bank-transfer',
  'credit card': 'other',
  'card': 'other'
}

const EXPENSE_CATEGORY_MAP: Record<string, ExpenseCategory> = {
  'materials': 'materials',
  'labor': 'labor',
  'shipping': 'shipping',
  'outsourcing': 'outsourcing',
  'supplies': 'supplies',
  'blanks': 'materials',
  'ink': 'materials',
  'thread': 'materials'
}

// Size mapping from Printavo format to Mint Prints format
const SIZE_MAP: Record<string, keyof Sizes> = {
  'xs': 'XS',
  'extra small': 'XS',
  's': 'S',
  'small': 'S',
  'm': 'M',
  'medium': 'M',
  'l': 'L',
  'large': 'L',
  'xl': 'XL',
  'extra large': 'XL',
  '2xl': '2XL',
  'xxl': '2XL',
  '3xl': '3XL',
  'xxxl': '3XL'
}

// ============================================================================
// Utility Functions
// ============================================================================

function mapStatus(printavoStatus?: { name?: string } | string): QuoteStatus {
  const statusName = typeof printavoStatus === 'string' 
    ? printavoStatus 
    : printavoStatus?.name || 'draft'
  
  const normalized = statusName.toLowerCase().trim()
  return STATUS_MAP[normalized] || 'draft'
}

function mapJobStatus(printavoStatus?: { name?: string } | string): JobStatus {
  const statusName = typeof printavoStatus === 'string' 
    ? printavoStatus 
    : printavoStatus?.name || 'pending'
  
  const normalized = statusName.toLowerCase().trim()
  return JOB_STATUS_MAP[normalized] || 'pending'
}

function mapProductType(description?: string, category?: string): ProductType {
  const text = (description || category || '').toLowerCase()
  
  for (const [key, value] of Object.entries(PRODUCT_TYPE_MAP)) {
    if (text.includes(key)) {
      return value
    }
  }
  
  return 'other'
}

function mapDecorationType(personalizations?: Array<{ description?: string }>, category?: string): DecorationType {
  const text = (personalizations?.[0]?.description || category || '').toLowerCase()
  
  for (const [key, value] of Object.entries(DECORATION_MAP)) {
    if (text.includes(key)) {
      return value
    }
  }
  
  return 'screen-print'
}

function mapSizes(printavoSizes?: { [key: string]: number }): Sizes {
  const sizes: Sizes = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 0,
    '3XL': 0
  }
  
  if (!printavoSizes) return sizes
  
  for (const [key, value] of Object.entries(printavoSizes)) {
    const normalized = key.toLowerCase().trim()
    const mappedSize = SIZE_MAP[normalized]
    if (mappedSize) {
      sizes[mappedSize] = value || 0
    }
  }
  
  return sizes
}

function determineCustomerTier(orderCount?: number): CustomerTier {
  if (!orderCount) return 'bronze'
  if (orderCount >= 50) return 'platinum'
  if (orderCount >= 25) return 'gold'
  if (orderCount >= 10) return 'silver'
  return 'bronze'
}

// ============================================================================
// Transformer Functions
// ============================================================================

/**
 * Transform Printavo Contact/Customer to Mint Prints Customer
 */
export function transformCustomer(
  printavoData: PrintavoCustomer | PrintavoContact,
  options?: { preserveId?: boolean }
): Customer {
  const isPrintavoCustomer = 'primaryContact' in printavoData
  const contact = isPrintavoCustomer 
    ? (printavoData as PrintavoCustomer).primaryContact 
    : (printavoData as PrintavoContact)
  
  const customer = printavoData as PrintavoCustomer
  
  const billingAddress = customer.billingAddress || contact?.address
  const shippingAddress = customer.shippingAddress || contact?.address
  
  return {
    id: options?.preserveId ? printavoData.id : generateId('c'),
    name: contact?.fullName || contact?.firstName || customer.companyName || 'Unknown',
    email: contact?.email || '',
    phone: contact?.phone,
    company: customer.companyName,
    tier: determineCustomerTier(customer.orderCount),
    address: billingAddress ? {
      street: [billingAddress.address1, billingAddress.address2].filter(Boolean).join(', '),
      city: billingAddress.city || '',
      state: billingAddress.stateIso || '',
      zip: billingAddress.zipCode || '',
      country: billingAddress.country
    } : undefined,
    taxExempt: customer.taxExempt,
    taxCertificateId: customer.resaleNumber ? generateId('tc') : undefined
  }
}

/**
 * Transform Printavo LineItem to Mint Prints LineItem
 */
export function transformLineItem(
  printavoLineItem: PrintavoLineItem,
  options?: { preserveId?: boolean }
): LineItem {
  const sizes = mapSizes(printavoLineItem.sizes)
  const quantity = printavoLineItem.items || Object.values(sizes).reduce((sum, qty) => sum + qty, 0)
  const unitPrice = printavoLineItem.price || printavoLineItem.unitCost || 0
  const setupFee = 0 // Printavo stores setup as fees, not per line item
  
  const productType = mapProductType(
    printavoLineItem.styleDescription || printavoLineItem.description,
    printavoLineItem.category
  )
  
  const decorationType = mapDecorationType(
    printavoLineItem.personalizations,
    printavoLineItem.category
  )
  
  // Extract decoration locations from personalizations
  const printLocations = printavoLineItem.personalizations?.map(p => p.location || 'front') || ['front']
  const decorationColors = printavoLineItem.personalizations?.[0]?.colors || 1
  
  // Build decorations array from personalizations
  const decorations: Decoration[] = printavoLineItem.personalizations?.map(p => ({
    id: generateId('dec'),
    method: mapDecorationType([p]),
    location: p.location || 'front',
    inkThreadColors: `${p.colors || 1} color${(p.colors || 1) > 1 ? 's' : ''}`,
    imprintSize: p.description?.match(/\d+["\s]*x\s*\d+["]/)?.[0],
    setupFee: 0
  })) || []
  
  return {
    id: options?.preserveId ? printavoLineItem.id : generateId('li'),
    product_type: productType,
    product_sku: printavoLineItem.styleNumber || printavoLineItem.itemNumber,
    product_name: printavoLineItem.styleDescription || printavoLineItem.description || 'Unknown Product',
    product_color: printavoLineItem.color,
    decoration: decorationType,
    print_locations: printLocations,
    decorations: decorations.length > 0 ? decorations : undefined,
    colors: decorationColors,
    sizes,
    quantity,
    unit_price: unitPrice,
    setup_fee: setupFee,
    line_total: (unitPrice * quantity) + setupFee
  }
}

/**
 * Transform Printavo Transaction to Mint Prints Payment
 */
export function transformPayment(
  printavoTransaction: PrintavoTransaction,
  quoteId: string,
  options?: { preserveId?: boolean }
): Payment {
  const method = printavoTransaction.method?.toLowerCase() || 'other'
  const mappedMethod = PAYMENT_METHOD_MAP[method] || 'other'
  
  return {
    id: options?.preserveId ? printavoTransaction.id : generateId('pay'),
    quoteId,
    amount: printavoTransaction.amount || 0,
    method: mappedMethod,
    customMethod: mappedMethod === 'other' ? printavoTransaction.method : undefined,
    reference: printavoTransaction.reference,
    notes: printavoTransaction.notes,
    receivedDate: printavoTransaction.processedAt || printavoTransaction.timestamps?.createdAt || new Date().toISOString(),
    createdAt: printavoTransaction.timestamps?.createdAt || new Date().toISOString()
  }
}

/**
 * Transform Printavo Expense to Mint Prints Expense
 */
export function transformExpense(
  printavoExpense: PrintavoExpense,
  jobId: string,
  options?: { preserveId?: boolean }
): Expense {
  const category = printavoExpense.category?.toLowerCase() || 'other'
  const mappedCategory = EXPENSE_CATEGORY_MAP[category] || 'other'
  
  return {
    id: options?.preserveId ? printavoExpense.id : generateId('exp'),
    jobId,
    category: mappedCategory,
    customCategory: mappedCategory === 'other' ? printavoExpense.category : undefined,
    description: printavoExpense.description || 'Expense',
    amount: printavoExpense.amount || 0,
    vendor: printavoExpense.vendor,
    expenseDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
}

/**
 * Transform Printavo Quote to Mint Prints Quote
 */
export function transformQuote(
  printavoQuote: PrintavoQuote,
  options?: { preserveId?: boolean }
): Quote {
  const customer = transformCustomer(
    printavoQuote.customer || printavoQuote.contact,
    options
  )
  
  const lineItems = printavoQuote.lineItems?.map(li => 
    transformLineItem(li, options)
  ) || []
  
  // Add setup fees from Printavo fees to the quote
  const setupFees = printavoQuote.fees
    ?.filter(f => f.name?.toLowerCase().includes('setup') || f.type?.toLowerCase().includes('setup'))
    .reduce((sum, f) => sum + (f.amount || 0), 0) || 0
  
  const subtotal = printavoQuote.subtotal || lineItems.reduce((sum, li) => sum + li.line_total, 0)
  
  // Calculate discount
  let discount = 0
  let discountType: 'percent' | 'fixed' = 'fixed'
  
  if (printavoQuote.discountAsPercentage && printavoQuote.discount) {
    discount = printavoQuote.discount
    discountType = 'percent'
  } else if (printavoQuote.discountAmount) {
    discount = printavoQuote.discountAmount
    discountType = 'fixed'
  }
  
  const taxRate = printavoQuote.salesTax || 0
  const taxAmount = printavoQuote.salesTaxAmount || 0
  const total = printavoQuote.total || (subtotal - discount + taxAmount)
  
  // Transform payments
  const payments = printavoQuote.transactions
    ?.filter(t => t.type === 'payment')
    .map(t => transformPayment(t, options?.preserveId ? printavoQuote.id : generateId('q'), options)) || []
  
  return {
    id: options?.preserveId ? printavoQuote.id : generateId('q'),
    quote_number: printavoQuote.visualId || `Q-${Date.now()}`,
    nickname: printavoQuote.nickname,
    status: mapStatus(printavoQuote.status),
    customer,
    line_items: lineItems,
    subtotal: subtotal + setupFees,
    discount,
    discount_type: discountType,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    notes_customer: printavoQuote.customerNote || '',
    notes_internal: [
      printavoQuote.productionNote,
      printavoQuote.tags?.length ? `Tags: ${printavoQuote.tags.join(', ')}` : null,
      printavoQuote.owner ? `Owner: ${printavoQuote.owner.name || printavoQuote.owner.email}` : null
    ].filter(Boolean).join('\n'),
    due_date: printavoQuote.dueAt || printavoQuote.customerDueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: printavoQuote.timestamps?.createdAt || new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payments: payments.length > 0 ? payments : undefined
  }
}

/**
 * Transform Printavo Invoice to Mint Prints Job
 */
export function transformJob(
  printavoInvoice: PrintavoInvoice,
  quoteId?: string,
  options?: { preserveId?: boolean }
): Job {
  const customer = transformCustomer(
    printavoInvoice.customer || printavoInvoice.contact,
    options
  )
  
  const lineItems = printavoInvoice.lineItems?.map(li => 
    transformLineItem(li, options)
  ) || []
  
  // Determine job status from tasks or invoice status
  let jobStatus: JobStatus = 'pending'
  if (printavoInvoice.status) {
    jobStatus = mapJobStatus(printavoInvoice.status)
  } else if (printavoInvoice.tasks?.length) {
    const latestTask = printavoInvoice.tasks[printavoInvoice.tasks.length - 1]
    jobStatus = mapJobStatus(latestTask.type)
  }
  
  // Check artwork approval from approval requests
  const artworkApproved = printavoInvoice.approvalRequests?.every(
    req => req.status?.toLowerCase() === 'approved'
  ) || false
  
  // Calculate progress based on completed tasks
  const totalTasks = printavoInvoice.tasks?.length || 0
  const completedTasks = printavoInvoice.tasks?.filter(
    t => t.status?.toLowerCase() === 'completed' || t.completedAt
  ).length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Get assigned users from tasks
  const assignedTo = [
    ...new Set(
      printavoInvoice.tasks
        ?.map(t => t.assignedUser?.name || t.assignedUser?.email)
        .filter(Boolean) || []
    )
  ]
  
  // Transform expenses
  const expenses = printavoInvoice.expenses?.map(exp => 
    transformExpense(exp, options?.preserveId ? printavoInvoice.id : generateId('j'), options)
  ) || []
  
  return {
    id: options?.preserveId ? printavoInvoice.id : generateId('j'),
    job_number: printavoInvoice.visualId || `J-${Date.now()}`,
    quote_id: quoteId || '',
    status: jobStatus,
    customer,
    line_items: lineItems,
    due_date: printavoInvoice.dueAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ship_date: printavoInvoice.dueAt ? new Date(new Date(printavoInvoice.dueAt).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
    production_notes: [
      printavoInvoice.productionNote,
      printavoInvoice.tags?.length ? `Tags: ${printavoInvoice.tags.join(', ')}` : null,
      printavoInvoice.visualPoNumber ? `PO: ${printavoInvoice.visualPoNumber}` : null
    ].filter(Boolean).join('\n'),
    artwork_approved: artworkApproved,
    assigned_to: assignedTo,
    progress,
    nickname: printavoInvoice.nickname,
    expenses: expenses.length > 0 ? expenses : undefined
  }
}

/**
 * Batch transform multiple Printavo quotes
 */
export function transformQuotes(
  printavoQuotes: PrintavoQuote[],
  options?: { preserveId?: boolean }
): Quote[] {
  return printavoQuotes.map(pq => transformQuote(pq, options))
}

/**
 * Batch transform multiple Printavo invoices to jobs
 */
export function transformJobs(
  printavoInvoices: PrintavoInvoice[],
  options?: { preserveId?: boolean }
): Job[] {
  return printavoInvoices.map(pi => transformJob(pi, undefined, options))
}

/**
 * Validate transformed data
 */
export function validateQuote(quote: Quote): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!quote.customer.email) {
    errors.push('Customer email is required')
  }
  
  if (quote.line_items.length === 0) {
    errors.push('At least one line item is required')
  }
  
  if (quote.total < 0) {
    errors.push('Total cannot be negative')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateJob(job: Job): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!job.customer.email) {
    errors.push('Customer email is required')
  }
  
  if (job.line_items.length === 0) {
    errors.push('At least one line item is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
