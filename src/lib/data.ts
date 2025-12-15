import type { Customer, Quote, Job, LineItem, Sizes } from './types'

export const sampleCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '(555) 123-4567',
    company: 'ACME Corporation',
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    email: 'sarah@gmail.com',
    company: 'Smith Family Reunion',
  },
  {
    id: 'c3',
    name: 'Mike Chen',
    email: 'mike@techstartup.com',
    phone: '(555) 234-5678',
    company: 'Tech Startup Inc',
  },
  {
    id: 'c4',
    name: 'Pastor Williams',
    email: 'pastor@church.org',
    phone: '(555) 345-6789',
    company: 'Local Church',
  },
  {
    id: 'c5',
    name: 'Coach Martinez',
    email: 'coach@school.edu',
    phone: '(555) 456-7890',
    company: 'High School Athletics',
  },
]

export const createEmptyLineItem = (): LineItem => ({
  id: generateId('li'),
  product_type: 'tshirt',
  product_name: 'Gildan G500',
  product_color: '#000000',
  decoration: 'screen-print',
  print_locations: ['front'],
  colors: 1,
  sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 },
  quantity: 0,
  unit_price: 12.00,
  setup_fee: 50.00,
  line_total: 0,
})

export const createEmptyQuote = (customer?: Customer): Quote => ({
  id: generateId('q'),
  quote_number: generateQuoteNumber(),
  status: 'draft',
  customer: customer || {
    id: '',
    name: '',
    email: '',
  },
  line_items: [],
  subtotal: 0,
  discount: 0,
  discount_type: 'percent',
  tax_rate: 8.25,
  tax_amount: 0,
  total: 0,
  notes_customer: '',
  notes_internal: '',
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
})

let quoteCounter = 45
let jobCounter = 142

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateQuoteNumber(): string {
  return `Q-2025-${String(quoteCounter++).padStart(4, '0')}`
}

export function generateJobNumber(): string {
  return `J-2025-${String(jobCounter++).padStart(4, '0')}`
}

export function calculateLineItemTotal(item: LineItem): number {
  return (item.quantity * item.unit_price) + item.setup_fee
}

export function calculateSizesTotal(sizes: Sizes): number {
  return Object.values(sizes).reduce((sum, qty) => sum + qty, 0)
}

export function calculateQuoteTotals(quote: Quote): Quote {
  const subtotal = quote.line_items.reduce((sum, item) => sum + item.line_total, 0)
  
  const discountAmount = quote.discount_type === 'percent' 
    ? (subtotal * quote.discount / 100) 
    : quote.discount
  
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (quote.tax_rate / 100)
  const total = afterDiscount + taxAmount
  
  return {
    ...quote,
    subtotal,
    tax_amount: taxAmount,
    total,
  }
}

export const sampleQuotes: Quote[] = [
  {
    id: 'q1',
    quote_number: 'Q-2025-0045',
    status: 'sent',
    customer: sampleCustomers[0],
    line_items: [
      {
        id: 'li1',
        product_type: 'hoodie',
        product_name: 'Gildan 18500',
        product_color: '#1e3a8a',
        decoration: 'screen-print',
        print_locations: ['front', 'back'],
        colors: 2,
        sizes: { XS: 5, S: 20, M: 40, L: 50, XL: 30, '2XL': 5, '3XL': 0 },
        quantity: 150,
        unit_price: 15.00,
        setup_fee: 90.00,
        line_total: 2340.00,
      },
    ],
    subtotal: 2340.00,
    discount: 0,
    discount_type: 'percent',
    tax_rate: 8.25,
    tax_amount: 193.05,
    total: 2533.05,
    notes_customer: 'Rush order needed for company event',
    notes_internal: 'VIP customer - priority production',
    due_date: '2025-12-20',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: '2025-12-30',
  },
  {
    id: 'q2',
    quote_number: 'Q-2025-0044',
    status: 'draft',
    customer: sampleCustomers[1],
    line_items: [
      {
        id: 'li2',
        product_type: 'tshirt',
        product_name: 'Gildan G500',
        product_color: '#000000',
        decoration: 'screen-print',
        print_locations: ['front'],
        colors: 2,
        sizes: { XS: 2, S: 5, M: 15, L: 15, XL: 10, '2XL': 3, '3XL': 0 },
        quantity: 50,
        unit_price: 12.00,
        setup_fee: 50.00,
        line_total: 650.00,
      },
    ],
    subtotal: 650.00,
    discount: 10,
    discount_type: 'percent',
    tax_rate: 8.25,
    tax_amount: 48.26,
    total: 633.26,
    notes_customer: 'Family reunion shirts',
    notes_internal: '',
    due_date: '2025-12-25',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: '2025-12-31',
  },
  {
    id: 'q3',
    quote_number: 'Q-2025-0042',
    status: 'approved',
    customer: sampleCustomers[2],
    line_items: [
      {
        id: 'li3',
        product_type: 'polo',
        product_name: 'Port Authority K500',
        product_color: '#dc2626',
        decoration: 'embroidery',
        print_locations: ['left-chest'],
        colors: 1,
        sizes: { XS: 0, S: 10, M: 25, L: 25, XL: 10, '2XL': 5, '3XL': 0 },
        quantity: 75,
        unit_price: 18.00,
        setup_fee: 75.00,
        line_total: 1425.00,
      },
    ],
    subtotal: 1425.00,
    discount: 50,
    discount_type: 'fixed',
    tax_rate: 8.25,
    tax_amount: 113.44,
    total: 1488.44,
    notes_customer: 'Company logo embroidery',
    notes_internal: 'Approved - ready to convert to job',
    due_date: '2025-12-18',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: '2025-12-28',
  },
]

export const sampleJobs: Job[] = [
  {
    id: 'j1',
    job_number: 'J-2025-0142',
    quote_id: 'q1',
    status: 'art-approval',
    customer: sampleCustomers[0],
    line_items: sampleQuotes[0].line_items,
    due_date: '2025-12-20',
    ship_date: '2025-12-19',
    production_notes: 'Customer wants soft-hand print. Use water-based inks.',
    artwork_approved: false,
    assigned_to: ['Lisa', 'Marco'],
    progress: 15,
  },
  {
    id: 'j2',
    job_number: 'J-2025-0140',
    quote_id: 'q3',
    status: 'scheduled',
    customer: sampleCustomers[2],
    line_items: sampleQuotes[2].line_items,
    due_date: '2025-12-18',
    ship_date: '2025-12-17',
    production_notes: 'Logo embroidery - use PES file in dropbox',
    artwork_approved: true,
    assigned_to: ['Sarah'],
    progress: 35,
  },
  {
    id: 'j3',
    job_number: 'J-2025-0138',
    quote_id: '',
    status: 'printing',
    customer: sampleCustomers[3],
    line_items: [
      {
        id: 'li4',
        product_type: 'tshirt',
        product_name: 'Gildan G500',
        product_color: '#ffffff',
        decoration: 'screen-print',
        print_locations: ['front'],
        colors: 3,
        sizes: { XS: 10, S: 30, M: 60, L: 60, XL: 30, '2XL': 10, '3XL': 0 },
        quantity: 200,
        unit_price: 10.00,
        setup_fee: 75.00,
        line_total: 2075.00,
      },
    ],
    due_date: '2025-12-19',
    ship_date: '2025-12-18',
    production_notes: 'Church event - all adult sizes',
    artwork_approved: true,
    assigned_to: ['Marco', 'Jake'],
    progress: 80,
  },
  {
    id: 'j4',
    job_number: 'J-2025-0135',
    quote_id: 'q2',
    status: 'ready',
    customer: sampleCustomers[1],
    line_items: sampleQuotes[1].line_items,
    due_date: '2025-12-16',
    ship_date: '',
    production_notes: 'Ready for customer pickup',
    artwork_approved: true,
    assigned_to: [],
    progress: 100,
  },
]
