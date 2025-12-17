import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileJson, AlertCircle, CheckCircle2, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { Quote, Job, Customer } from '@/lib/types'
import { KV_KEYS } from '@/lib/constants'
import {
  transformQuote,
  transformJob,
  transformQuotes,
  transformJobs,
  validateQuote,
  validateJob,
  type PrintavoQuote,
  type PrintavoInvoice,
} from '@/lib/printavo-transformer'

type ImportType = 'quotes' | 'jobs' | 'auto'

interface ImportResult {
  success: boolean
  quotesImported: number
  jobsImported: number
  errors: string[]
  warnings: string[]
}

export function PrintavoImporter() {
  const [quotes, setQuotes] = useKV<Quote[]>(KV_KEYS.QUOTES, [])
  const [jobs, setJobs] = useKV<Job[]>(KV_KEYS.JOBS, [])
  const [customers, setCustomers] = useKV<Customer[]>(KV_KEYS.CUSTOMERS, [])
  
  const [open, setOpen] = useState(false)
  const [importType, setImportType] = useState<ImportType>('auto')
  const [jsonData, setJsonData] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preserveIds, setPreserveIds] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setJsonData(content)
        toast.success('File loaded successfully')
      } catch (error) {
        toast.error('Failed to read file')
      }
    }
    reader.readAsText(file)
  }

  const detectDataType = (data: any): 'quote' | 'invoice' | 'unknown' => {
    // Printavo invoices have additional fields like approvalRequests, expenses
    if (data.approvalRequests || data.expenses) return 'invoice'
    
    // Check for quote-specific indicators
    if (data.visualId || data.contact || data.customer) return 'quote'
    
    return 'unknown'
  }

  const processImport = async () => {
    if (!jsonData.trim()) {
      toast.error('Please paste or upload JSON data')
      return
    }

    setIsProcessing(true)
    const errors: string[] = []
    const warnings: string[] = []
    let quotesImported = 0
    let jobsImported = 0

    try {
      const parsedData = JSON.parse(jsonData)
      
      // Handle array of items or single item
      const items = Array.isArray(parsedData) ? parsedData : [parsedData]
      
      if (items.length === 0) {
        throw new Error('No data found in JSON')
      }

      const newQuotes: Quote[] = []
      const newJobs: Job[] = []
      const newCustomers: Customer[] = []
      const customerMap = new Map<string, Customer>()

      for (const item of items) {
        try {
          const dataType = importType === 'auto' ? detectDataType(item) : 
                          importType === 'quotes' ? 'quote' : 'invoice'

          if (dataType === 'quote' || (dataType === 'unknown' && importType !== 'jobs')) {
            const quote = transformQuote(item as PrintavoQuote, { preserveId: preserveIds })
            const validation = validateQuote(quote)
            
            if (!validation.valid) {
              warnings.push(`Quote ${quote.quote_number}: ${validation.errors.join(', ')}`)
            }
            
            newQuotes.push(quote)
            
            // Track customer
            if (!customerMap.has(quote.customer.email)) {
              customerMap.set(quote.customer.email, quote.customer)
            }
            
            quotesImported++
          } else if (dataType === 'invoice' || importType === 'jobs') {
            const job = transformJob(item as PrintavoInvoice, undefined, { preserveId: preserveIds })
            const validation = validateJob(job)
            
            if (!validation.valid) {
              warnings.push(`Job ${job.job_number}: ${validation.errors.join(', ')}`)
            }
            
            newJobs.push(job)
            
            // Track customer
            if (!customerMap.has(job.customer.email)) {
              customerMap.set(job.customer.email, job.customer)
            }
            
            jobsImported++
          }
        } catch (itemError) {
          errors.push(`Failed to process item: ${itemError.message}`)
        }
      }

      // Merge customers (avoid duplicates by email)
      newCustomers.push(...customerMap.values())
      
      // Update KV store
      if (newQuotes.length > 0) {
        setQuotes((current) => [...current, ...newQuotes])
      }
      
      if (newJobs.length > 0) {
        setJobs((current) => [...current, ...newJobs])
      }
      
      // Merge customers with existing ones
      setCustomers((current) => {
        const existingEmails = new Set(current.map(c => c.email))
        const uniqueNewCustomers = newCustomers.filter(c => !existingEmails.has(c.email))
        return [...current, ...uniqueNewCustomers]
      })

      const result: ImportResult = {
        success: errors.length === 0,
        quotesImported,
        jobsImported,
        errors,
        warnings
      }

      setResult(result)

      if (result.success) {
        toast.success(
          `Successfully imported ${quotesImported} quote${quotesImported !== 1 ? 's' : ''} and ${jobsImported} job${jobsImported !== 1 ? 's' : ''}`
        )
      } else {
        toast.error('Import completed with errors')
      }
    } catch (error) {
      errors.push(`JSON parsing error: ${error.message}`)
      setResult({
        success: false,
        quotesImported: 0,
        jobsImported: 0,
        errors,
        warnings
      })
      toast.error('Failed to import data')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setJsonData('')
    setResult(null)
    setImportType('auto')
  }

  const downloadSample = () => {
    const sampleQuote: PrintavoQuote = {
      id: 'sample_123',
      visualId: 'Q-2025-001',
      nickname: 'Sample T-Shirt Order',
      contact: {
        id: 'contact_123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: {
          companyName: 'Example Corp',
          address1: '123 Main St',
          city: 'San Francisco',
          stateIso: 'CA',
          zipCode: '94102'
        }
      },
      customerNote: 'Please rush this order',
      productionNote: 'Use soft-hand ink',
      tags: ['rush', 'corporate'],
      status: { id: '1', name: 'draft' },
      subtotal: 500,
      total: 540,
      salesTax: 8,
      salesTaxAmount: 40,
      discountAmount: 0,
      amountPaid: 0,
      amountOutstanding: 540,
      dueAt: '2025-12-31',
      timestamps: {
        createdAt: new Date().toISOString()
      },
      lineItems: [
        {
          id: 'li_1',
          styleDescription: 'Gildan 5000 T-Shirt',
          styleNumber: 'G5000',
          color: 'Black',
          category: 'T-Shirt',
          items: 100,
          price: 5,
          sizes: {
            's': 20,
            'm': 40,
            'l': 30,
            'xl': 10
          },
          personalizations: [
            {
              location: 'front',
              description: 'Screen Print - 3 colors',
              colors: 3
            }
          ]
        }
      ],
      fees: [
        {
          id: 'fee_1',
          name: 'Setup Fee',
          amount: 50,
          description: 'Screen setup',
          taxable: false
        }
      ]
    }

    const blob = new Blob([JSON.stringify([sampleQuote], null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'printavo-sample.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Sample JSON downloaded')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import from Printavo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data from Printavo</DialogTitle>
          <DialogDescription>
            Import quotes, invoices, and customer data from Printavo API v2 (JSON format)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Import Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="import-type">Import Type</Label>
            <Select value={importType} onValueChange={(value) => setImportType(value as ImportType)}>
              <SelectTrigger id="import-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect (Recommended)</SelectItem>
                <SelectItem value="quotes">Quotes Only</SelectItem>
                <SelectItem value="jobs">Invoices/Jobs Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-detect will determine whether to import as quotes or jobs based on the data structure
            </p>
          </div>

          {/* Preserve IDs Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preserve-ids"
              checked={preserveIds}
              onCheckedChange={(checked) => setPreserveIds(checked as boolean)}
            />
            <Label htmlFor="preserve-ids" className="text-sm font-normal">
              Preserve original Printavo IDs (useful for syncing)
            </Label>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload JSON File</Label>
            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                accept=".json"
                onChange={handleFileUpload}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadSample}
              >
                <Download className="mr-2 h-4 w-4" />
                Sample
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste JSON</span>
            </div>
          </div>

          {/* JSON Text Area */}
          <div className="space-y-2">
            <Label htmlFor="json-data">Printavo API JSON Data</Label>
            <Textarea
              id="json-data"
              placeholder='Paste Printavo API v2 JSON data here (single object or array)...\n\nExample:\n{\n  "id": "123",\n  "visualId": "Q-2025-001",\n  "contact": {...},\n  "lineItems": [...]\n}'
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="font-mono text-xs min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Export data from Printavo API v2 and paste it here. Supports both single objects and arrays.
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-2">
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        {result.success ? 'Import Successful' : 'Import Completed with Errors'}
                      </div>
                      <div className="text-sm space-y-1">
                        <div>✓ {result.quotesImported} quote{result.quotesImported !== 1 ? 's' : ''} imported</div>
                        <div>✓ {result.jobsImported} job{result.jobsImported !== 1 ? 's' : ''} imported</div>
                      </div>
                      
                      {result.warnings.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="font-semibold text-yellow-600">Warnings:</div>
                          {result.warnings.map((warning, i) => (
                            <div key={i} className="text-xs">• {warning}</div>
                          ))}
                        </div>
                      )}
                      
                      {result.errors.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="font-semibold">Errors:</div>
                          {result.errors.map((error, i) => (
                            <div key={i} className="text-xs">• {error}</div>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {result ? (
              <>
                <Button variant="outline" onClick={resetForm}>
                  Import More
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={processImport} 
                  disabled={!jsonData.trim() || isProcessing}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Import Data'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
