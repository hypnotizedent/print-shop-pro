export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type JobStatus = 'pending' | 'art-approval' | 'scheduled' | 'printing' | 'finishing' | 'ready' | 'shipped' | 'delivered'
export type ProductType = 'tshirt' | 'hoodie' | 'polo' | 'hat' | 'other'
export type DecorationType = 'screen-print' | 'dtg' | 'embroidery' | 'vinyl'
export type DiscountType = 'percent' | 'fixed'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
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
  location: string
  dataUrl: string
  fileName: string
  approved?: boolean
  uploadedAt: string
}

export interface LineItem {
  id: string
  product_type: ProductType
  product_name: string
  product_color?: string
  decoration: DecorationType
  print_locations: string[]
  artwork?: ArtworkFile[]
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
  status: QuoteStatus
  customer: Customer
  line_items: LineItem[]
  subtotal: number
  discount: number
  discount_type: DiscountType
  tax_rate: number
  tax_amount: number
  total: number
  notes_customer: string
  notes_internal: string
  due_date: string
  created_at: string
  valid_until: string
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
}
