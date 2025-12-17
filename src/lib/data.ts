import type { Customer, Quote, Job, LineItem, Sizes, EmailNotification } from './types'
import { getDefaultEmailPreferences } from './email-preferences'

export const sampleCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '(555) 123-4567',
    company: 'ACME Corporation',
    tier: 'platinum',
    address: {
      street: '123 Business Park Dr',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'USA',
    },
    emailPreferences: getDefaultEmailPreferences(),
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    email: 'sarah@gmail.com',
    company: 'Smith Family Reunion',
    tier: 'bronze',
    address: {
      street: '456 Oak Avenue',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    emailPreferences: getDefaultEmailPreferences(),
  },
  {
    id: 'c3',
    name: 'Mike Chen',
    email: 'mike@techstartup.com',
    phone: '(555) 234-5678',
    company: 'Tech Startup Inc',
    tier: 'gold',
    address: {
      street: '789 Innovation Blvd',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
    },
    emailPreferences: getDefaultEmailPreferences(),
  },
  {
    id: 'c4',
    name: 'Pastor Williams',
    email: 'pastor@church.org',
    phone: '(555) 345-6789',
    company: 'Local Church',
    tier: 'silver',
    address: {
      street: '321 Faith Street',
      city: 'Denver',
      state: 'CO',
      zip: '80201',
    },
    emailPreferences: getDefaultEmailPreferences(),
  },
  {
    id: 'c5',
    name: 'Coach Martinez',
    email: 'coach@school.edu',
    phone: '(555) 456-7890',
    company: 'High School Athletics',
    tier: 'gold',
    address: {
      street: '555 School Road',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
    },
    emailPreferences: getDefaultEmailPreferences(),
  },
]

export const createEmptyLineItem = (): LineItem => ({
  id: generateId('li'),
  product_type: 'tshirt',
  product_name: 'Gildan G500',
  product_color: '#000000',
  decoration: 'screen-print',
  print_locations: ['front'],
  decorations: [],
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
  line_item_groups: [],
  subtotal: 0,
  discount: 0,
  discount_type: 'percent',
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
  const productTotal = item.quantity * item.unit_price
  const decorationSetupFees = (item.decorations || []).reduce((sum, dec) => sum + dec.setupFee, 0)
  const legacySetupFee = item.setup_fee || 0
  return productTotal + decorationSetupFees + legacySetupFee
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
  
  // Only apply tax if customer is not tax exempt
  const taxRate = quote.customer.taxExempt ? 0 : (quote.tax_rate || 0)
  const taxAmount = afterDiscount * (taxRate / 100)
  
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
    total: 2340.00,
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
    total: 585.00,
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
    total: 1375.00,
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
    nickname: 'ACME Holiday Hoodies',
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
    nickname: 'Tech Startup Polos',
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
    nickname: 'Church Christmas Event',
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
    nickname: 'Smith Reunion Tees',
  },
]

export const sampleEmailNotifications: EmailNotification[] = [
  {
    id: 'email-1',
    customerId: 'c1',
    customerEmail: 'john@acme.com',
    type: 'quote-approval-request',
    subject: 'Quote Q-2025-0045 - Approval Required',
    body: 'Hi John Smith,\n\nYour quote Q-2025-0045 (ACME Hoodies 2025) is ready for your review.\n\nTotal: $2,340.00\nDue Date: 2025-12-20\n\nPlease review and approve at your earliest convenience.\n\nThank you!',
    status: 'opened',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000).toISOString(),
    openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    relatedQuoteId: 'q1',
    metadata: {
      quoteNumber: 'Q-2025-0045',
      amount: 2340,
    },
    sentBy: 'System',
  },
  {
    id: 'email-2',
    customerId: 'c2',
    customerEmail: 'sarah@gmail.com',
    type: 'quote-approved',
    subject: 'Quote Q-2025-0044 - Approved!',
    body: 'Hi Sarah Johnson,\n\nGreat news! Your quote Q-2025-0044 (Smith Reunion Tees) has been approved.\n\nTotal: $890.00\n\nWe\'ll begin production soon. You\'ll receive updates as we progress.\n\nThank you!',
    status: 'delivered',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3000).toISOString(),
    relatedQuoteId: 'q2',
    metadata: {
      quoteNumber: 'Q-2025-0044',
      amount: 890,
    },
    sentBy: 'System',
  },
  {
    id: 'email-3',
    customerId: 'c3',
    customerEmail: 'mike@techstartup.com',
    type: 'invoice-sent',
    subject: 'Invoice for Quote Q-2025-0042',
    body: 'Hi Mike Chen,\n\nPlease find attached your invoice for quote Q-2025-0042 (Tech Startup Polos).\n\nTotal: $1,200.00\n\nThank you for your business!',
    status: 'clicked',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2000).toISOString(),
    openedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    clickedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30000).toISOString(),
    relatedQuoteId: 'q3',
    metadata: {
      quoteNumber: 'Q-2025-0042',
      amount: 1200,
    },
    sentBy: 'System',
  },
  {
    id: 'email-4',
    customerId: 'c1',
    customerEmail: 'john@acme.com',
    type: 'payment-reminder',
    subject: 'Payment Reminder: Quote Q-2025-0045',
    body: 'Hi John Smith,\n\nThis is a reminder about the outstanding balance for quote Q-2025-0045 (ACME Hoodies 2025).\n\nBalance Due: $1,170.00\n\nPlease submit payment at your earliest convenience.\n\nThank you!',
    status: 'sent',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    relatedQuoteId: 'q1',
    metadata: {
      quoteNumber: 'Q-2025-0045',
      amount: 1170,
    },
    sentBy: 'System',
  },
  {
    id: 'email-5',
    customerId: 'c3',
    customerEmail: 'mike@techstartup.com',
    type: 'order-status-update',
    subject: 'Order Update: J-2025-0140',
    body: 'Hi Mike Chen,\n\nYour order is now in production!\n\nJob Number: J-2025-0140 (Tech Startup Polos)\nStatus: scheduled\nDue Date: 2025-12-18\n\nThank you!',
    status: 'opened',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4000).toISOString(),
    openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    relatedJobId: 'j2',
    metadata: {
      jobNumber: 'J-2025-0140',
      status: 'scheduled',
    },
    sentBy: 'System',
  },
  {
    id: 'email-6',
    customerId: 'c2',
    customerEmail: 'sarah@gmail.com',
    type: 'pickup-notification',
    subject: 'Your order J-2025-0135 is ready for pickup!',
    body: 'Hi Sarah Johnson,\n\nYour order J-2025-0135 (Smith Reunion Tees) is ready for pickup!\n\nPlease visit us during business hours to collect your order.\n\nThank you!',
    status: 'delivered',
    sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 5000).toISOString(),
    relatedJobId: 'j4',
    metadata: {
      jobNumber: 'J-2025-0135',
    },
    sentBy: 'System',
  },
  {
    id: 'email-7',
    customerId: 'c4',
    customerEmail: 'pastor@church.org',
    type: 'artwork-approval-request',
    subject: 'Artwork Approval Required: J-2025-0138',
    body: 'Hi Pastor Williams,\n\nYour artwork is ready for approval!\n\nJob Number: J-2025-0138 (Church Christmas Event)\nFront: 3-color screen print\n\nPlease review and approve so we can begin production.\n\nThank you!',
    status: 'opened',
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3000).toISOString(),
    openedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    relatedJobId: 'j3',
    metadata: {
      jobNumber: 'J-2025-0138',
    },
    sentBy: 'System',
  },
  {
    id: 'email-8',
    customerId: 'c1',
    customerEmail: 'john@acme.com',
    type: 'quote-reminder',
    subject: 'Reminder: Quote Q-2025-0045 awaiting approval',
    body: 'Hi John Smith,\n\nThis is a friendly reminder about quote Q-2025-0045 (ACME Hoodies 2025).\n\nTotal: $2,340.00\nValid Until: 2025-12-30\n\nPlease let us know if you have any questions!\n\nThank you!',
    status: 'failed',
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Mailbox full',
    relatedQuoteId: 'q1',
    metadata: {
      quoteNumber: 'Q-2025-0045',
      amount: 2340,
    },
    sentBy: 'System',
  },
]

export const sampleEmailTemplates: import('./types').EmailTemplate[] = [
  {
    id: 'tpl-quote-reminder-1',
    name: 'Quote Reminder - Friendly Follow-up',
    description: 'A friendly reminder for pending quotes',
    type: 'quote-reminder',
    subject: 'Following up on Quote {{quote_number}}',
    body: `Hi {{customer_name}},

I wanted to follow up on the quote we sent you for {{quote_nickname}}.

Quote Details:
• Quote Number: {{quote_number}}
• Total Amount: {{total_amount}}
• Valid Until: {{valid_until}}

We'd love to help bring your project to life! If you have any questions or need any adjustments, please don't hesitate to reach out.

Looking forward to working with you!

Best regards,
Mint Prints Team`,
    variables: ['customer_name', 'customer_email', 'customer_company', 'quote_number', 'quote_nickname', 'total_amount', 'due_date', 'valid_until', 'days_since_sent'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-quote-reminder-2',
    name: 'Quote Reminder - Expiring Soon',
    description: 'Urgent reminder for quotes about to expire',
    type: 'quote-reminder',
    subject: 'Reminder: Quote {{quote_number}} expires soon!',
    body: `Hi {{customer_name}},

This is a friendly reminder that your quote {{quote_number}} for {{quote_nickname}} will expire soon.

Quote Details:
• Total: {{total_amount}}
• Valid Until: {{valid_until}}
• Days Since Sent: {{days_since_sent}}

To secure current pricing and ensure timely delivery, please approve the quote at your earliest convenience.

Have questions? We're here to help!

Thank you,
Mint Prints Team`,
    variables: ['customer_name', 'customer_email', 'customer_company', 'quote_number', 'quote_nickname', 'total_amount', 'due_date', 'valid_until', 'days_since_sent'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-quote-reminder-3',
    name: 'Quote Reminder - With Logo',
    description: 'Professional reminder with branding',
    type: 'quote-reminder',
    subject: '{{customer_name}}, your custom quote is ready!',
    body: `Hello {{customer_name}},

We're excited to work with you on {{quote_nickname}}!

Here's a quick recap of your quote:
📋 Quote #: {{quote_number}}
💰 Total: {{total_amount}}
📅 Valid Until: {{valid_until}}

Ready to move forward? Simply reply to this email or give us a call!

Questions? We're always happy to help adjust quantities, colors, or any other details.

Cheers,
The Mint Prints Team
✨ Making your vision come to life`,
    variables: ['customer_name', 'customer_email', 'customer_company', 'quote_number', 'quote_nickname', 'total_amount', 'due_date', 'valid_until', 'days_since_sent'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

