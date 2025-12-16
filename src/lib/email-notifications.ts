import type { EmailNotification, EmailNotificationType, Customer, Quote, Job, EmailAttachment, EmailTemplate } from './types'

export function generateId(prefix: string = 'email'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export interface CreateEmailNotificationParams {
  customerId: string
  customerEmail: string
  type: EmailNotificationType
  subject: string
  body?: string
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

export function createEmailNotification(params: CreateEmailNotificationParams): EmailNotification {
  return {
    id: generateId('email'),
    customerId: params.customerId,
    customerEmail: params.customerEmail,
    type: params.type,
    subject: params.subject,
    body: params.body,
    status: 'sent',
    sentAt: new Date().toISOString(),
    relatedQuoteId: params.relatedQuoteId,
    relatedJobId: params.relatedJobId,
    metadata: params.metadata,
    sentBy: params.sentBy,
    attachments: params.attachments,
  }
}

export function createQuoteApprovalEmail(quote: Quote, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'quote-approval-request',
    subject: `Quote ${quote.quote_number} - Approval Required`,
    body: `Hi ${quote.customer.name},\n\nYour quote ${quote.quote_number}${quote.nickname ? ` (${quote.nickname})` : ''} is ready for your review.\n\nTotal: $${quote.total.toFixed(2)}\nDue Date: ${quote.due_date}\n\nPlease review and approve at your earliest convenience.\n\nThank you!`,
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: quote.total,
    },
    sentBy,
  })
}

export function createQuoteApprovedEmail(quote: Quote, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'quote-approved',
    subject: `Quote ${quote.quote_number} - Approved!`,
    body: `Hi ${quote.customer.name},\n\nGreat news! Your quote ${quote.quote_number}${quote.nickname ? ` (${quote.nickname})` : ''} has been approved.\n\nTotal: $${quote.total.toFixed(2)}\n\nWe'll begin production soon. You'll receive updates as we progress.\n\nThank you!`,
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: quote.total,
    },
    sentBy,
  })
}

export function createQuoteReminderEmail(quote: Quote, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'quote-reminder',
    subject: `Reminder: Quote ${quote.quote_number} awaiting approval`,
    body: `Hi ${quote.customer.name},\n\nThis is a friendly reminder about quote ${quote.quote_number}${quote.nickname ? ` (${quote.nickname})` : ''}.\n\nTotal: $${quote.total.toFixed(2)}\nValid Until: ${quote.valid_until}\n\nPlease let us know if you have any questions!\n\nThank you!`,
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: quote.total,
    },
    sentBy,
  })
}

export function createQuoteReminderEmailFromTemplate(
  quote: Quote, 
  template: EmailTemplate, 
  sentBy?: string
): EmailNotification {
  const daysSinceSent = quote.created_at 
    ? Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const replaceVariables = (text: string): string => {
    return text
      .replace(/\{\{customer_name\}\}/g, quote.customer.name)
      .replace(/\{\{customer_email\}\}/g, quote.customer.email)
      .replace(/\{\{customer_company\}\}/g, quote.customer.company || '')
      .replace(/\{\{quote_number\}\}/g, quote.quote_number)
      .replace(/\{\{quote_nickname\}\}/g, quote.nickname || 'your order')
      .replace(/\{\{total_amount\}\}/g, `$${quote.total.toFixed(2)}`)
      .replace(/\{\{due_date\}\}/g, quote.due_date)
      .replace(/\{\{valid_until\}\}/g, quote.valid_until)
      .replace(/\{\{days_since_sent\}\}/g, daysSinceSent.toString())
  }

  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'quote-reminder',
    subject: replaceVariables(template.subject),
    body: replaceVariables(template.body),
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: quote.total,
      daysSinceSent,
    },
    sentBy,
    attachments: template.attachments,
  })
}

export function createPaymentReminderEmail(quote: Quote, balanceDue: number, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'payment-reminder',
    subject: `Payment Reminder: Quote ${quote.quote_number}`,
    body: `Hi ${quote.customer.name},\n\nThis is a reminder about the outstanding balance for quote ${quote.quote_number}${quote.nickname ? ` (${quote.nickname})` : ''}.\n\nBalance Due: $${balanceDue.toFixed(2)}\n\nPlease submit payment at your earliest convenience.\n\nThank you!`,
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: balanceDue,
    },
    sentBy,
  })
}

export function createInvoiceEmail(quote: Quote, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: quote.customer.id,
    customerEmail: quote.customer.email,
    type: 'invoice-sent',
    subject: `Invoice for Quote ${quote.quote_number}`,
    body: `Hi ${quote.customer.name},\n\nPlease find attached your invoice for quote ${quote.quote_number}${quote.nickname ? ` (${quote.nickname})` : ''}.\n\nTotal: $${quote.total.toFixed(2)}\n\nThank you for your business!`,
    relatedQuoteId: quote.id,
    metadata: {
      quoteNumber: quote.quote_number,
      amount: quote.total,
    },
    sentBy,
  })
}

export function createOrderStatusUpdateEmail(job: Job, statusMessage: string, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: job.customer.id,
    customerEmail: job.customer.email,
    type: 'order-status-update',
    subject: `Order Update: ${job.job_number}`,
    body: `Hi ${job.customer.name},\n\n${statusMessage}\n\nJob Number: ${job.job_number}${job.nickname ? ` (${job.nickname})` : ''}\nStatus: ${job.status}\nDue Date: ${job.due_date}\n\nThank you!`,
    relatedJobId: job.id,
    metadata: {
      jobNumber: job.job_number,
      status: job.status,
    },
    sentBy,
  })
}

export function createShippingNotificationEmail(job: Job, trackingNumber: string, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: job.customer.id,
    customerEmail: job.customer.email,
    type: 'shipping-notification',
    subject: `Your order ${job.job_number} has shipped!`,
    body: `Hi ${job.customer.name},\n\nGreat news! Your order ${job.job_number}${job.nickname ? ` (${job.nickname})` : ''} has shipped.\n\nTracking Number: ${trackingNumber}\n\nThank you for your business!`,
    relatedJobId: job.id,
    metadata: {
      jobNumber: job.job_number,
      trackingNumber,
    },
    sentBy,
  })
}

export function createPickupNotificationEmail(job: Job, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: job.customer.id,
    customerEmail: job.customer.email,
    type: 'pickup-notification',
    subject: `Your order ${job.job_number} is ready for pickup!`,
    body: `Hi ${job.customer.name},\n\nYour order ${job.job_number}${job.nickname ? ` (${job.nickname})` : ''} is ready for pickup!\n\nPlease visit us during business hours to collect your order.\n\nThank you!`,
    relatedJobId: job.id,
    metadata: {
      jobNumber: job.job_number,
    },
    sentBy,
  })
}

export function createArtworkApprovalEmail(job: Job, artworkDetails: string, sentBy?: string): EmailNotification {
  return createEmailNotification({
    customerId: job.customer.id,
    customerEmail: job.customer.email,
    type: 'artwork-approval-request',
    subject: `Artwork Approval Required: ${job.job_number}`,
    body: `Hi ${job.customer.name},\n\nYour artwork is ready for approval!\n\nJob Number: ${job.job_number}${job.nickname ? ` (${job.nickname})` : ''}\n${artworkDetails}\n\nPlease review and approve so we can begin production.\n\nThank you!`,
    relatedJobId: job.id,
    metadata: {
      jobNumber: job.job_number,
    },
    sentBy,
  })
}

export function getEmailStats(notifications: EmailNotification[]) {
  const total = notifications.length
  const sent = notifications.filter(n => n.status === 'sent').length
  const delivered = notifications.filter(n => n.status === 'delivered').length
  const opened = notifications.filter(n => n.status === 'opened').length
  const clicked = notifications.filter(n => n.status === 'clicked').length
  const failed = notifications.filter(n => n.status === 'failed' || n.status === 'bounced').length
  
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
  const clickRate = opened > 0 ? (clicked / opened) * 100 : 0
  
  const byType = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {} as Record<EmailNotificationType, number>)
  
  return {
    total,
    sent,
    delivered,
    opened,
    clicked,
    failed,
    openRate: Math.round(openRate * 10) / 10,
    clickRate: Math.round(clickRate * 10) / 10,
    byType,
  }
}
