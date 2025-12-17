export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type JobStatus = 'pending' | 'art-approval' | 'scheduled' | 'printing' | 'finishing' | 'ready' | 'shipped' | 'delivered'
export type ProductType = 'tshirt' | 'hoodie' | 'polo' | 'hat' | 'other'
export type DecorationType = 'screen-print' | 'dtg' | 'embroidery' | 'vinyl' | 'digital-print' | 'digital-transfer' | 'other'
export type DiscountType = 'percent' | 'fixed'

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type PricingRuleType = 'tier-discount' | 'volume-discount' | 'product-discount' | 'category-discount'

export interface CustomerPricingRule {
  id: string
  name: string
  description?: string
  type: PricingRuleType
  isActive: boolean
  priority: number
  conditions: {
    customerTiers?: CustomerTier[]
    minOrderValue?: number
    minQuantity?: number
    productCategories?: string[]
    specificProducts?: string[]
  }
  discount: {
    type: 'percent' | 'fixed'
    value: number
    applyTo: 'product' | 'setup' | 'total'
  }
  createdAt: string
  updatedAt: string
}

export type QuoteTemplateCategory = 'events' | 'retail' | 'corporate' | 'nonprofit' | 'sports' | 'school' | 'custom'

export interface QuoteTemplate {
  id: string
  name: string
  description?: string
  category: QuoteTemplateCategory
  customCategory?: string
  lineItems: Omit<LineItem, 'id'>[]
  defaultCustomer?: Partial<Customer>
  defaultDiscount?: {
    type: DiscountType
    value: number
  }
  defaultNotes?: {
    customer?: string
    internal?: string
  }
  tags?: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
  lastUsed?: string
  isActive: boolean
}

export interface CustomerEmailPreferences {
  quoteApprovalRequests: boolean
  quoteApprovedConfirmations: boolean
  quoteReminders: boolean
  orderStatusUpdates: boolean
  artworkApprovalRequests: boolean
  artworkStatusUpdates: boolean
  paymentReminders: boolean
  paymentConfirmations: boolean
  shippingNotifications: boolean
  pickupNotifications: boolean
  invoiceReminders: boolean
  marketingMessages: boolean
  productionUpdates: boolean
}

export interface TaxCertificate {
  id: string
  customerId: string
  certificateNumber: string
  state: string
  expirationDate: string
  issuedDate: string
  fileUrl?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  tier?: CustomerTier
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country?: string
  }
  emailPreferences?: CustomerEmailPreferences
  taxExempt?: boolean
  taxCertificateId?: string
}

export interface Sizes {
  XS: number
  S: number
  M: number
  L: number
  XL: number
  '2XL': number
  '3XL': number
}

export interface ArtworkFile {
  dataUrl: string
  fileName: string
  fileSize?: number
  width?: number
  height?: number
  approved?: boolean
  uploadedAt: string
}

export interface LegacyArtworkFile extends ArtworkFile {
  location: string
}

export interface Decoration {
  id: string
  method: DecorationType
  customMethod?: string
  location: string
  customLocation?: string
  inkThreadColors: string
  imprintSize?: string
  artwork?: ArtworkFile
  setupFee: number
}

export interface LineItem {
  id: string
  product_type: ProductType
  product_name: string
  product_color?: string
  decoration: DecorationType
  print_locations: string[]
  decorations?: Decoration[]
  artwork?: LegacyArtworkFile[]
  colors: number
  sizes: Sizes
  quantity: number
  unit_price: number
  setup_fee: number
  line_total: number
}

export interface Quote {
  id: string
  quote_number: string
  nickname?: string
  status: QuoteStatus
  customer: Customer
  line_items: LineItem[]
  subtotal: number
  discount: number
  discount_type: DiscountType
  tax_rate?: number
  tax_amount?: number
  total: number
  notes_customer: string
  notes_internal: string
  due_date: string
  created_at: string
  valid_until: string
  payments?: Payment[]
}

export interface Job {
  id: string
  job_number: string
  quote_id: string
  status: JobStatus
  customer: Customer
  line_items: LineItem[]
  due_date: string
  ship_date: string
  production_notes: string
  artwork_approved: boolean
  assigned_to: string[]
  progress: number
  nickname?: string
  expenses?: Expense[]
}

export interface CustomerDecorationTemplate {
  id: string
  customerId: string
  name: string
  description?: string
  decorations: Omit<Decoration, 'id'>[]
  createdAt: string
}

export type PaymentMethod = 'cash' | 'check' | 'venmo' | 'zelle' | 'paypal' | 'bank-transfer' | 'other'

export interface Payment {
  id: string
  quoteId: string
  jobId?: string
  amount: number
  method: PaymentMethod
  customMethod?: string
  reference?: string
  notes?: string
  receivedDate: string
  recordedBy?: string
  createdAt: string
}

export type ExpenseCategory = 'materials' | 'labor' | 'shipping' | 'outsourcing' | 'supplies' | 'other'

export interface Expense {
  id: string
  jobId: string
  category: ExpenseCategory
  customCategory?: string
  description: string
  amount: number
  quantity?: number
  unitCost?: number
  vendor?: string
  invoiceNumber?: string
  expenseDate: string
  notes?: string
  createdAt: string
}

export interface PaymentReminder {
  id: string
  quoteId: string
  enabled: boolean
  intervals: number[]
  lastSentDate?: string
  nextReminderDate?: string
  emailsSent: number
  smsEnabled?: boolean
  smsPhone?: string
  lastSmsSentDate?: string
  smsSent?: number
  highPriority?: boolean
}

export type SmsTemplateType = 'payment-reminder' | 'order-ready' | 'order-shipped' | 'quote-approved' | 'custom'

export interface SmsTemplate {
  id: string
  name: string
  type: SmsTemplateType
  message: string
  variables?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerSmsPreferences {
  customerId: string
  optedOut: boolean
  optedOutDate?: string
  optedOutReason?: string
  preferredNumber?: string
  allowPaymentReminders: boolean
  allowOrderUpdates: boolean
  allowMarketingMessages: boolean
  lastUpdated: string
}

export type ArtworkCategory = 'neck-tag' | 'private-label' | 'logo' | 'graphic' | 'other'

export type ArtworkReviewStage = 'uploaded' | 'internal-review' | 'customer-review' | 'final-approval' | 'approved' | 'rejected'

export interface ArtworkReviewer {
  id: string
  name: string
  email?: string
  role: 'internal' | 'customer' | 'manager'
}

export interface ArtworkReviewComment {
  id: string
  reviewerId: string
  reviewerName: string
  comment: string
  timestamp: string
  stage: ArtworkReviewStage
}

export interface ArtworkApproval {
  stage: ArtworkReviewStage
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  comments?: ArtworkReviewComment[]
}

export interface ArtworkVersion {
  versionNumber: number
  file: {
    dataUrl: string
    fileName: string
    fileSize: number
  }
  uploadedAt: string
  uploadedBy?: string
  changeNotes?: string
  imprintSize?: string
  productionReady?: boolean
  productionReadyDate?: string
  productionReadyBy?: string
  reviewStage?: ArtworkReviewStage
  approvalHistory?: ArtworkApproval[]
  assignedReviewers?: ArtworkReviewer[]
  currentReviewer?: string
}

export interface CustomerArtworkFile {
  id: string
  customerId: string
  name: string
  description?: string
  category: ArtworkCategory
  imprintSize?: string
  notes?: string
  file: {
    dataUrl: string
    fileName: string
    fileSize: number
  }
  uploadedAt: string
  updatedAt: string
  currentVersion: number
  versionHistory?: ArtworkVersion[]
  productionReady?: boolean
  productionReadyDate?: string
  productionReadyBy?: string
  reviewStage?: ArtworkReviewStage
  approvalHistory?: ArtworkApproval[]
  assignedReviewers?: ArtworkReviewer[]
  currentReviewer?: string
}

export type EmailNotificationType = 
  | 'quote-approval-request'
  | 'quote-approved'
  | 'quote-reminder'
  | 'order-status-update'
  | 'artwork-approval-request'
  | 'artwork-status-update'
  | 'payment-reminder'
  | 'payment-confirmation'
  | 'shipping-notification'
  | 'pickup-notification'
  | 'invoice-reminder'
  | 'invoice-sent'
  | 'marketing-message'
  | 'production-update'
  | 'custom'

export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'

export interface EmailNotification {
  id: string
  customerId: string
  customerEmail: string
  type: EmailNotificationType
  subject: string
  body?: string
  status: EmailStatus
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  errorMessage?: string
  relatedQuoteId?: string
  relatedJobId?: string
  metadata?: {
    quoteNumber?: string
    jobNumber?: string
    amount?: number
    [key: string]: any
  }
  sentBy?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  dataUrl: string
}

export interface EmailTemplate {
  id: string
  name: string
  description?: string
  type: EmailNotificationType
  subject: string
  body: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  attachments?: EmailAttachment[]
}

export type ScheduledEmailStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

export interface ScheduledEmail {
  id: string
  customerId: string
  customerEmail: string
  templateId?: string
  subject: string
  body: string
  attachments?: EmailAttachment[]
  scheduledFor: string
  status: ScheduledEmailStatus
  createdAt: string
  sentAt?: string
  errorMessage?: string
  relatedQuoteId?: string
  relatedJobId?: string
  createdBy?: string
}

export type FilterPresetContext = 'quotes' | 'jobs' | 'customers'

export interface FilterPreset {
  id: string
  name: string
  context: FilterPresetContext
  filters: {
    statusFilter?: string
    dateSort?: 'asc' | 'desc'
    sortBy?: string
    groupBy?: string
    tierFilter?: string
    customFilters?: Record<string, any>
  }
  createdAt: string
  lastUsed?: string
  isPinned?: boolean
}

export interface RecentSearch {
  id: string
  query: string
  context: FilterPresetContext
  timestamp: string
  resultsCount?: number
}

export type SupplierType = 'ssactivewear' | 'sanmar'

export interface FavoriteProduct {
  id: string
  supplier: SupplierType
  styleId: string
  styleName: string
  brandName: string
  colorName?: string
  colorCode?: string
  imageUrl?: string
  wholesalePrice?: number
  retailPrice?: number
  category?: string
  sizes?: string[]
  notes?: string
  addedAt: string
  lastUsed?: string
  usageCount: number
}

export interface ProductTemplate {
  id: string
  name: string
  description?: string
  product: {
    supplier: SupplierType
    styleId: string
    styleName: string
    brandName: string
    colorName?: string
    colorCode?: string
    imageUrl?: string
    wholesalePrice?: number
    retailPrice?: number
  }
  defaultSizes?: Sizes
  decorations: Omit<Decoration, 'id'>[]
  pricing: {
    unitPrice: number
    setupFee: number
    priceByQuantity?: Array<{
      minQty: number
      maxQty?: number
      unitPrice: number
    }>
  }
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
  lastUsed?: string
  isActive: boolean
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled'

export interface PurchaseOrderLineItem {
  id: string
  supplier: SupplierType
  styleId: string
  styleName: string
  brandName: string
  colorName: string
  colorCode: string
  sizes: Sizes
  quantityOrdered: number
  quantityReceived: number
  unitCost: number
  lineTotal: number
  associatedOrders: Array<{
    type: 'quote' | 'job'
    id: string
    number: string
    customerName: string
    sizes: Sizes
  }>
  receivedItems?: Array<{
    id: string
    sizes: Sizes
    receivedDate: string
    receivedBy: string
    assignedTo?: {
      type: 'quote' | 'job'
      id: string
      number: string
    }
  }>
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: SupplierType
  status: PurchaseOrderStatus
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  lineItems: PurchaseOrderLineItem[]
  subtotal: number
  shipping?: number
  tax?: number
  total: number
  notes?: string
  tracking?: string
  orderedBy?: string
  receivedBy?: string
  createdAt: string
  updatedAt: string
  accuracyRating?: number
  deliveryRating?: number
  qualityIssues?: string[]
}

export interface SupplierPerformanceMetrics {
  supplier: SupplierType
  totalOrders: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
  averageAccuracyRate: number
  totalSpent: number
  averageOrderValue: number
  costTrends: Array<{
    month: string
    totalSpent: number
    orderCount: number
    averageOrderValue: number
  }>
  deliveryTimeTrends: Array<{
    month: string
    averageDeliveryDays: number
    onTimePercentage: number
  }>
  accuracyTrends: Array<{
    month: string
    accuracyRate: number
    issueCount: number
  }>
  topProducts: Array<{
    styleId: string
    styleName: string
    brandName: string
    orderCount: number
    totalQuantity: number
    totalSpent: number
  }>
  issuesSummary: {
    totalIssues: number
    byType: Record<string, number>
    recentIssues: Array<{
      poNumber: string
      orderDate: string
      issue: string
    }>
  }
  lastUpdated: string
}

export type SupplierIssueType = 
  | 'wrong-color'
  | 'wrong-size'
  | 'missing-items'
  | 'damaged-items'
  | 'late-delivery'
  | 'quality-issue'
  | 'pricing-discrepancy'
  | 'other'

export interface SupplierPerformanceRecord {
  id: string
  purchaseOrderId: string
  poNumber: string
  supplier: SupplierType
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  deliveryDays?: number
  onTime: boolean
  accuracyRate: number
  orderTotal: number
  issues: Array<{
    type: SupplierIssueType
    description: string
    affectedLineItems?: string[]
    resolvedDate?: string
    resolutionNotes?: string
  }>
  qualityRating?: number
  costVariance?: number
  notes?: string
  createdAt: string
  updatedAt: string
}
