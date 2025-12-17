/**
 * Mint Prints API Adapter
 * 
 * Transforms data from mintprints-api (Printavo-synced PostgreSQL)
 * to the Spark frontend expected types.
 * 
 * API Base: https://mintprints-api.ronny.works
 * Database: PostgreSQL (port 5433)
 */

import type {
  Quote,
  Job,
  Customer,
  LineItem,
  QuoteStatus,
  JobStatus,
  DecorationType,
  ProductType,
  Sizes,
  Payment,
  Decoration,
  CustomerEmailPreferences,
} from './types'

// ============================================================================
// API Response Types (Printavo/mintprints-api format)
// ============================================================================

export interface APICustomer {
  id: number
  first_name: string
  last_name: string
  company: string | null
  email: string | null
  phone: string | null
  tax_exempt: boolean
  tax_resale_num: string | null
  created_at: string
  updated_at: string
  // Address fields (may be nested or flat)
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  // Or nested address
  address?: {
    address_1: string
    address_2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
}

export interface APIOrderStatus {
  id: number
  name: string
  color: string
}

export interface APILineItemGroup {
  id: number
  name: string
  description: string | null
  position: number
}

export interface APILineItem {
  id: number
  style_number: string | null
  style_description: string | null
  color: string | null
  quantity: number
  unit_cost: string | number
  taxable: boolean
  position: number
  lineitemgroup_id: number | null
  imprint_id: number | null
  // Size breakdown (Printavo format)
  xxs?: number
  xs?: number
  s?: number
  m?: number
  l?: number
  xl?: number
  '2xl'?: number
  '3xl'?: number
  '4xl'?: number
  '5xl'?: number
}

export interface APIImprint {
  id: number
  name: string
  description: string | null
  print_location: string | null
  number_of_colors: number
  setup_fee: string | number
  additional_fee: string | number
}

export interface APIPayment {
  id: number
  amount: string | number
  payment_type: string
  reference: string | null
  notes: string | null
  created_at: string
}

export interface APIQuote {
  id: number
  visual_id: string // "Q-12345" format
  nickname: string | null
  customer_id: number
  customer: APICustomer
  orderstatus_id: number
  orderstatus: APIOrderStatus
  lineitems: APILineItem[]
  lineitemgroups: APILineItemGroup[]
  imprints: APIImprint[]
  payments: APIPayment[]
  subtotal: string | number
  discount: string | number
  discount_as_percentage: boolean
  tax: string | number
  total: string | number
  customer_note: string | null
  production_note: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface APIJob {
  id: number
  visual_id: string // "J-12345" format
  nickname: string | null
  customer_id: number
  customer: APICustomer
  orderstatus_id: number
  orderstatus: APIOrderStatus
  lineitems: APILineItem[]
  lineitemgroups: APILineItemGroup[]
  imprints: APIImprint[]
  payments: APIPayment[]
  subtotal: string | number
  discount: string | number
  discount_as_percentage: boolean
  tax: string | number
  total: string | number
  customer_note: string | null
  production_note: string | null
  due_date: string | null
  ship_date: string | null
  created_at: string
  updated_at: string
  quote_id: number | null
}

// ============================================================================
// Status Mapping
// ============================================================================

const QUOTE_STATUS_MAP: Record<string, QuoteStatus> = {
  // Printavo quote statuses -> Spark statuses
  'Draft': 'draft',
  'New': 'draft',
  'Pending': 'sent',
  'Sent': 'sent',
  'Awaiting Approval': 'sent',
  'Approved': 'approved',
  'Won': 'approved',
  'Rejected': 'rejected',
  'Lost': 'rejected',
  'Expired': 'expired',
  'Cancelled': 'expired',
}

const JOB_STATUS_MAP: Record<string, JobStatus> = {
  // Printavo job statuses -> Spark statuses
  'New': 'pending',
  'Pending': 'pending',
  'Art Approval': 'art-approval',
  'Awaiting Artwork': 'art-approval',
  'Artwork Approved': 'scheduled',
  'Scheduled': 'scheduled',
  'In Production': 'printing',
  'Printing': 'printing',
  'Print': 'printing',
  'Finishing': 'finishing',
  'Complete': 'ready',
  'Ready': 'ready',
  'Ready for Pickup': 'ready',
  'Shipped': 'shipped',
  'Delivered': 'delivered',
  'Picked Up': 'delivered',
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform API customer to Spark customer format
 */
export function transformCustomer(apiCustomer: APICustomer): Customer {
  const fullName = [apiCustomer.first_name, apiCustomer.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || apiCustomer.company || 'Unknown'

  // Handle both nested and flat address formats
  const address = apiCustomer.address || (apiCustomer.address_1 ? {
    address_1: apiCustomer.address_1,
    address_2: apiCustomer.address_2,
    city: apiCustomer.city || '',
    state: apiCustomer.state || '',
    zip: apiCustomer.zip || '',
    country: apiCustomer.country,
  } : null)

  return {
    id: `c-${apiCustomer.id}`,
    name: fullName,
    email: apiCustomer.email || '',
    phone: apiCustomer.phone || undefined,
    company: apiCustomer.company || undefined,
    address: address ? {
      street: [address.address_1, address.address_2].filter(Boolean).join(', '),
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    } : undefined,
    taxExempt: apiCustomer.tax_exempt,
    // Default email preferences (can be overridden from separate API call)
    emailPreferences: getDefaultEmailPreferences(),
  }
}

/**
 * Transform API line items to Spark line items
 */
export function transformLineItem(
  apiLineItem: APILineItem, 
  imprints: APIImprint[],
  groups: APILineItemGroup[]
): LineItem {
  // Find associated imprint
  const imprint = imprints.find(i => i.id === apiLineItem.imprint_id)
  
  // Map sizes
  const sizes: Sizes = {
    XS: apiLineItem.xs || 0,
    S: apiLineItem.s || 0,
    M: apiLineItem.m || 0,
    L: apiLineItem.l || 0,
    XL: apiLineItem.xl || 0,
    '2XL': apiLineItem['2xl'] || 0,
    '3XL': apiLineItem['3xl'] || 0,
  }

  const quantity = apiLineItem.quantity || Object.values(sizes).reduce((a, b) => a + b, 0)
  const unitPrice = parseFloat(String(apiLineItem.unit_cost)) || 0
  const setupFee = imprint ? parseFloat(String(imprint.setup_fee)) || 0 : 0
  const lineTotal = (quantity * unitPrice) + setupFee

  // Determine product type from style description
  const productType = inferProductType(apiLineItem.style_description || '')
  
  // Determine decoration type from imprint
  const decorationType = imprint ? inferDecorationType(imprint.name) : 'screen-print'

  return {
    id: `li-${apiLineItem.id}`,
    product_type: productType,
    product_sku: apiLineItem.style_number || undefined,
    product_name: apiLineItem.style_description || 'Product',
    product_color: apiLineItem.color || undefined,
    decoration: decorationType,
    print_locations: imprint?.print_location ? [imprint.print_location] : [],
    colors: imprint?.number_of_colors || 1,
    sizes,
    quantity,
    unit_price: unitPrice,
    setup_fee: setupFee,
    line_total: lineTotal,
    groupId: apiLineItem.lineitemgroup_id 
      ? `g-${apiLineItem.lineitemgroup_id}` 
      : undefined,
    // Build decorations array if imprint exists
    decorations: imprint ? [{
      id: `d-${imprint.id}`,
      method: decorationType,
      location: imprint.print_location || 'Front',
      inkThreadColors: `${imprint.number_of_colors} colors`,
      setupFee,
    }] : undefined,
  }
}

/**
 * Transform API quote to Spark quote format
 */
export function transformQuote(apiQuote: APIQuote): Quote {
  const customer = transformCustomer(apiQuote.customer)
  const lineItems = apiQuote.lineitems.map(li => 
    transformLineItem(li, apiQuote.imprints, apiQuote.lineitemgroups)
  )
  
  const subtotal = parseFloat(String(apiQuote.subtotal)) || 0
  const discount = parseFloat(String(apiQuote.discount)) || 0
  const taxAmount = parseFloat(String(apiQuote.tax)) || 0
  const total = parseFloat(String(apiQuote.total)) || 0
  
  // Calculate tax rate from amounts
  const taxableSubtotal = subtotal - discount
  const taxRate = taxableSubtotal > 0 ? (taxAmount / taxableSubtotal) * 100 : 0

  // Map status
  const status = QUOTE_STATUS_MAP[apiQuote.orderstatus?.name] || 'draft'

  // Transform payments
  const payments: Payment[] = (apiQuote.payments || []).map(p => ({
    id: `pay-${p.id}`,
    quoteId: `q-${apiQuote.id}`,
    amount: parseFloat(String(p.amount)) || 0,
    method: mapPaymentMethod(p.payment_type),
    reference: p.reference || undefined,
    notes: p.notes || undefined,
    receivedDate: p.created_at,
    createdAt: p.created_at,
  }))

  return {
    id: `q-${apiQuote.id}`,
    quote_number: apiQuote.visual_id,
    nickname: apiQuote.nickname || undefined,
    status,
    customer,
    line_items: lineItems,
    line_item_groups: apiQuote.lineitemgroups.map(g => ({
      id: `g-${g.id}`,
      name: g.name,
      decorations: [],
    })),
    subtotal,
    discount,
    discount_type: apiQuote.discount_as_percentage ? 'percent' : 'fixed',
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    notes_customer: apiQuote.customer_note || '',
    notes_internal: apiQuote.production_note || '',
    due_date: apiQuote.due_date || '',
    created_at: apiQuote.created_at,
    valid_until: apiQuote.expires_at || '',
    payments,
  }
}

/**
 * Transform API job to Spark job format
 */
export function transformJob(apiJob: APIJob): Job {
  const customer = transformCustomer(apiJob.customer)
  const lineItems = apiJob.lineitems.map(li => 
    transformLineItem(li, apiJob.imprints, apiJob.lineitemgroups)
  )

  // Map status
  const status = JOB_STATUS_MAP[apiJob.orderstatus?.name] || 'pending'

  // Calculate progress based on status
  const progressMap: Record<JobStatus, number> = {
    'pending': 0,
    'art-approval': 15,
    'scheduled': 30,
    'printing': 50,
    'finishing': 75,
    'ready': 90,
    'shipped': 95,
    'delivered': 100,
  }

  return {
    id: `j-${apiJob.id}`,
    job_number: apiJob.visual_id,
    quote_id: apiJob.quote_id ? `q-${apiJob.quote_id}` : '',
    status,
    customer,
    line_items: lineItems,
    due_date: apiJob.due_date || '',
    ship_date: apiJob.ship_date || '',
    production_notes: apiJob.production_note || '',
    artwork_approved: status !== 'pending' && status !== 'art-approval',
    assigned_to: [],
    progress: progressMap[status] || 0,
    nickname: apiJob.nickname || undefined,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function inferProductType(description: string): ProductType {
  const lower = description.toLowerCase()
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie'
  if (lower.includes('polo')) return 'polo'
  if (lower.includes('hat') || lower.includes('cap') || lower.includes('beanie')) return 'hat'
  if (lower.includes('tee') || lower.includes('t-shirt') || lower.includes('shirt')) return 'tshirt'
  return 'other'
}

function inferDecorationType(imprintName: string): DecorationType {
  const lower = imprintName.toLowerCase()
  if (lower.includes('screen') || lower.includes('silk')) return 'screen-print'
  if (lower.includes('dtg') || lower.includes('direct to garment')) return 'dtg'
  if (lower.includes('embroider')) return 'embroidery'
  if (lower.includes('vinyl') || lower.includes('htv')) return 'vinyl'
  if (lower.includes('digital') && lower.includes('print')) return 'digital-print'
  if (lower.includes('digital') || lower.includes('transfer')) return 'digital-transfer'
  return 'screen-print'
}

function mapPaymentMethod(paymentType: string): Payment['method'] {
  const lower = paymentType.toLowerCase()
  if (lower.includes('cash')) return 'cash'
  if (lower.includes('check')) return 'check'
  if (lower.includes('venmo')) return 'venmo'
  if (lower.includes('zelle')) return 'zelle'
  if (lower.includes('paypal')) return 'paypal'
  if (lower.includes('bank') || lower.includes('ach') || lower.includes('wire')) return 'bank-transfer'
  return 'other'
}

function getDefaultEmailPreferences(): CustomerEmailPreferences {
  return {
    quoteApprovalRequests: true,
    quoteApprovedConfirmations: true,
    quoteReminders: true,
    orderStatusUpdates: true,
    artworkApprovalRequests: true,
    artworkStatusUpdates: true,
    paymentReminders: true,
    paymentConfirmations: true,
    shippingNotifications: true,
    pickupNotifications: true,
    invoiceReminders: true,
    marketingMessages: false,
    productionUpdates: false,
  }
}

// ============================================================================
// API Client
// ============================================================================

const API_BASE = 'https://mintprints-api.ronny.works'

export interface APIClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
}

export class MintPrintsAPIClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(config: APIClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // -------------------------------------------------------------------------
  // Quotes
  // -------------------------------------------------------------------------

  async getQuotes(params?: { 
    status?: string
    limit?: number
    offset?: number 
  }): Promise<Quote[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    
    const query = searchParams.toString()
    const endpoint = `/api/quotes${query ? `?${query}` : ''}`
    
    const apiQuotes = await this.fetch<APIQuote[]>(endpoint)
    return apiQuotes.map(transformQuote)
  }

  async getQuote(id: string): Promise<Quote> {
    // Strip prefix if present
    const numericId = id.replace(/^q-/, '')
    const apiQuote = await this.fetch<APIQuote>(`/api/quotes/${numericId}`)
    return transformQuote(apiQuote)
  }

  // -------------------------------------------------------------------------
  // Jobs
  // -------------------------------------------------------------------------

  async getJobs(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<Job[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    
    const query = searchParams.toString()
    const endpoint = `/api/orders${query ? `?${query}` : ''}`
    
    const apiJobs = await this.fetch<APIJob[]>(endpoint)
    return apiJobs.map(transformJob)
  }

  async getJob(id: string): Promise<Job> {
    const numericId = id.replace(/^j-/, '')
    const apiJob = await this.fetch<APIJob>(`/api/orders/${numericId}`)
    return transformJob(apiJob)
  }

  // -------------------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------------------

  async getCustomers(params?: {
    search?: string
    limit?: number
    offset?: number
  }): Promise<Customer[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    
    const query = searchParams.toString()
    const endpoint = `/api/customers${query ? `?${query}` : ''}`
    
    const apiCustomers = await this.fetch<APICustomer[]>(endpoint)
    return apiCustomers.map(transformCustomer)
  }

  async getCustomer(id: string): Promise<Customer> {
    const numericId = id.replace(/^c-/, '')
    const apiCustomer = await this.fetch<APICustomer>(`/api/customers/${numericId}`)
    return transformCustomer(apiCustomer)
  }
}

// Export singleton instance
export const apiClient = new MintPrintsAPIClient()

// ============================================================================
// React Hooks (for easy integration)
// ============================================================================

export { useAPIQuotes, useAPIJobs, useAPICustomers } from './api-hooks'
