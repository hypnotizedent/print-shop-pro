import type { Quote } from './types'
import { generateInvoiceHTML } from './invoice-generator'

declare const JSZip: any

async function loadJSZip() {
  if (typeof JSZip !== 'undefined') {
    return JSZip
  }
  
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
  document.head.appendChild(script)
  
  return new Promise((resolve, reject) => {
    script.onload = () => resolve((window as any).JSZip)
    script.onerror = reject
  })
}

export async function exportInvoicesAsZip(quotes: Quote[]) {
  if (quotes.length === 0) {
    throw new Error('No quotes selected for export')
  }
  
  const JSZip = await loadJSZip()
  const zip = new JSZip()
  
  quotes.forEach((quote) => {
    const html = generateInvoiceHTML(quote)
    const filename = `invoice-${quote.quote_number}${quote.nickname ? `-${quote.nickname.replace(/[^a-zA-Z0-9]/g, '-')}` : ''}.html`
    zip.file(filename, html)
  })
  
  const blob = await zip.generateAsync({ type: 'blob' })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const timestamp = new Date().toISOString().split('T')[0]
  a.download = `invoices-${timestamp}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  return blob
}

export async function exportInvoicesAsPDFZip(quotes: Quote[]) {
  return exportInvoicesAsZip(quotes)
}
