import type { Customer, Quote, Job } from './types'

export function exportCustomersToCSV(customers: Customer[]): void {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Tier']
  const rows = customers.map(c => [
    c.id,
    c.name,
    c.email,
    c.phone || '',
    c.company || '',
    c.tier || '',
  ])
  
  downloadCSV([headers, ...rows], 'customers.csv')
}

export function exportQuotesToCSV(quotes: Quote[]): void {
  const headers = ['Quote #', 'Status', 'Customer', 'Email', 'Items', 'Total', 'Created', 'Due Date']
  const rows = quotes.map(q => [
    q.quote_number,
    q.status,
    q.customer.company || q.customer.name,
    q.customer.email,
    q.line_items.reduce((sum, item) => sum + item.quantity, 0).toString(),
    q.total.toFixed(2),
    new Date(q.created_at).toLocaleDateString(),
    q.due_date,
  ])
  
  downloadCSV([headers, ...rows], 'quotes.csv')
}

export function exportJobsToCSV(jobs: Job[]): void {
  const headers = ['Job #', 'Status', 'Customer', 'Email', 'Items', 'Progress', 'Due Date', 'Assigned To']
  const rows = jobs.map(j => [
    j.job_number,
    j.status,
    j.customer.company || j.customer.name,
    j.customer.email,
    j.line_items.reduce((sum, item) => sum + item.quantity, 0).toString(),
    `${j.progress}%`,
    j.due_date,
    j.assigned_to.join(', '),
  ])
  
  downloadCSV([headers, ...rows], 'jobs.csv')
}

function downloadCSV(data: string[][], filename: string): void {
  const csvContent = data
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
