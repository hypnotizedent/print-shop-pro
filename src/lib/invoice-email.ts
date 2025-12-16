import type { Quote } from './types'
import { generateInvoiceHTML } from './invoice-generator'

export async function sendInvoiceEmail(quote: Quote, recipientEmail?: string): Promise<boolean> {
  const html = generateInvoiceHTML(quote)
  const email = recipientEmail || quote.customer.email
  
  const subject = `Invoice ${quote.quote_number}${quote.nickname ? ` - ${quote.nickname}` : ''} from MINT PRINTS`
  const body = `
Hello ${quote.customer.name},

Thank you for your business! Please find your invoice attached below.

Invoice Number: ${quote.quote_number}
${quote.nickname ? `Project: ${quote.nickname}\n` : ''}
Amount Due: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.total)}
Due Date: ${new Date(quote.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

If you have any questions, please don't hesitate to contact us.

Best regards,
MINT PRINTS Team
  `.trim()

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  window.open(mailtoLink, '_blank')
  
  return true
}

export function createInvoiceEmailDraft(quotes: Quote[]): string {
  if (quotes.length === 0) return ''
  
  if (quotes.length === 1) {
    const quote = quotes[0]
    return `mailto:${quote.customer.email}?subject=${encodeURIComponent(`Invoice ${quote.quote_number} from MINT PRINTS`)}`
  }
  
  const subject = `Multiple Invoices from MINT PRINTS`
  const body = `
Hello,

Please find your invoices:

${quotes.map((q, i) => `${i + 1}. Invoice ${q.quote_number}${q.nickname ? ` - ${q.nickname}` : ''} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q.total)}`).join('\n')}

Total Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quotes.reduce((sum, q) => sum + q.total, 0))}

If you have any questions, please contact us.

Best regards,
MINT PRINTS Team
  `.trim()
  
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
