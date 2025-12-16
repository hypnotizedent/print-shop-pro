import type { Quote } from './types'

export function generateInvoiceHTML(quote: Quote): string {
  const invoiceDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const dueDate = new Date(quote.due_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${quote.quote_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a202c;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 3px solid #10B981;
    }
    
    .company {
      flex: 1;
    }
    
    .company h1 {
      font-size: 32px;
      font-weight: 700;
      color: #10B981;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    
    .company p {
      color: #64748b;
      font-size: 14px;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-meta h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #0f172a;
    }
    
    .invoice-meta p {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .invoice-meta .invoice-number {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    
    .details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    
    .detail-section {
      flex: 1;
    }
    
    .detail-section h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 12px;
    }
    
    .detail-section p {
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .detail-section .name {
      font-weight: 600;
      color: #0f172a;
      font-size: 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    thead {
      background: #f8fafc;
      border-top: 2px solid #e2e8f0;
      border-bottom: 2px solid #e2e8f0;
    }
    
    thead th {
      padding: 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
    }
    
    thead th:last-child {
      text-align: right;
    }
    
    tbody td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    
    tbody td:last-child {
      text-align: right;
      font-weight: 600;
    }
    
    .item-description {
      color: #0f172a;
      margin-bottom: 4px;
    }
    
    .item-details {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    
    .totals {
      margin-left: auto;
      width: 350px;
      margin-top: 20px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .totals-row.subtotal {
      font-size: 14px;
      color: #475569;
    }
    
    .totals-row.discount {
      font-size: 14px;
      color: #10B981;
    }
    
    .totals-row.tax {
      font-size: 14px;
      color: #475569;
    }
    
    .totals-row.total {
      border-top: 2px solid #e2e8f0;
      border-bottom: 3px solid #10B981;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      padding: 16px 0;
      margin-top: 8px;
    }
    
    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f8fafc;
      border-left: 4px solid #10B981;
      border-radius: 4px;
    }
    
    .notes h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .notes p {
      font-size: 14px;
      color: #475569;
      white-space: pre-wrap;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .status-draft {
      background: #f1f5f9;
      color: #64748b;
    }
    
    .status-sent {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>MINT PRINTS</h1>
      <p>Professional Print & Apparel Services</p>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p class="invoice-number">${quote.quote_number}</p>
      <p>Date: ${invoiceDate}</p>
      <p>Due Date: ${dueDate}</p>
      ${quote.nickname ? `<p style="margin-top: 8px; font-weight: 600;">${quote.nickname}</p>` : ''}
      <div style="margin-top: 12px;">
        <span class="status-badge status-${quote.status}">${quote.status}</span>
      </div>
    </div>
  </div>
  
  <div class="details">
    <div class="detail-section">
      <h3>Bill To</h3>
      <p class="name">${quote.customer.name}</p>
      ${quote.customer.company ? `<p>${quote.customer.company}</p>` : ''}
      <p>${quote.customer.email}</p>
      ${quote.customer.phone ? `<p>${quote.customer.phone}</p>` : ''}
      ${quote.customer.address ? `
        <p style="margin-top: 8px;">
          ${quote.customer.address.street}<br>
          ${quote.customer.address.city}, ${quote.customer.address.state} ${quote.customer.address.zip}
          ${quote.customer.address.country ? `<br>${quote.customer.address.country}` : ''}
        </p>
      ` : ''}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Description</th>
        <th style="width: 15%; text-align: center;">Quantity</th>
        <th style="width: 15%; text-align: right;">Unit Price</th>
        <th style="width: 20%; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${quote.line_items.map(item => {
        const sizeBreakdown = Object.entries(item.sizes)
          .filter(([_, qty]) => qty > 0)
          .map(([size, qty]) => `${size}: ${qty}`)
          .join(', ')
        
        const locations = item.print_locations.length > 0 
          ? `Locations: ${item.print_locations.join(', ')}`
          : ''
        
        return `
          <tr>
            <td>
              <div class="item-description">${item.product_name}</div>
              <div class="item-details">
                ${item.product_color ? `Color: ${item.product_color}<br>` : ''}
                ${item.decoration ? `${item.decoration}${item.colors > 0 ? ` (${item.colors} color${item.colors > 1 ? 's' : ''})` : ''}<br>` : ''}
                ${locations ? `${locations}<br>` : ''}
                ${sizeBreakdown ? `Sizes: ${sizeBreakdown}` : ''}
              </div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
            <td>${formatCurrency(item.line_total)}</td>
          </tr>
        `
      }).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-row subtotal">
      <span>Subtotal</span>
      <span>${formatCurrency(quote.subtotal)}</span>
    </div>
    ${quote.discount > 0 ? `
      <div class="totals-row discount">
        <span>Discount ${quote.discount_type === 'percent' ? `(${quote.discount}%)` : ''}</span>
        <span>-${formatCurrency(quote.discount_type === 'percent' ? (quote.subtotal * quote.discount / 100) : quote.discount)}</span>
      </div>
    ` : ''}
    <div class="totals-row tax">
      <span>Tax (${quote.tax_rate}%)</span>
      <span>${formatCurrency(quote.tax_amount)}</span>
    </div>
    <div class="totals-row total">
      <span>TOTAL</span>
      <span>${formatCurrency(quote.total)}</span>
    </div>
  </div>
  
  ${quote.notes_customer ? `
    <div class="notes">
      <h3>Notes</h3>
      <p>${quote.notes_customer}</p>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">Questions? Contact us at info@mintprints.com</p>
  </div>
</body>
</html>
  `.trim()
}

export function downloadInvoiceAsHTML(quote: Quote) {
  const html = generateInvoiceHTML(quote)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${quote.quote_number}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printInvoice(quote: Quote) {
  const html = generateInvoiceHTML(quote)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export function exportInvoiceAsPDF(quote: Quote) {
  printInvoice(quote)
}
