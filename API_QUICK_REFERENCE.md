# Mint Prints API Quick Reference
## Cheat Sheet for Developers

---

## Authentication

### S&S Activewear
```typescript
// Store credentials
const [creds, setCreds] = useKV<SSActivewearCredentials>('ssactivewear-credentials', {
  accountNumber: 'YOUR_ACCOUNT_NUMBER',
  apiKey: 'YOUR_API_KEY'
})

// Check if configured
if (ssActivewearAPI.hasCredentials()) {
  // Ready to use
}
```

### SanMar
```typescript
const [creds, setCreds] = useKV<SanMarCredentials>('sanmar-credentials', {
  customerId: 'YOUR_CUSTOMER_ID',
  apiKey: 'YOUR_API_KEY'
})
```

---

## Supplier APIs

### Fetch Product by SKU
```typescript
import { ssActivewearAPI } from '@/lib/ssactivewear-api'

const product = await ssActivewearAPI.getProductByStyle('PC54')
// Returns: SSActivewearProduct | null
```

### Search Products
```typescript
const products = await ssActivewearAPI.searchProducts('Gildan Hoodie')
// Returns: SSActivewearProduct[]
```

### Get Product Details
```typescript
if (product) {
  console.log(product.styleName)      // "Port & Company Core Cotton Tee"
  console.log(product.brandName)      // "Port & Company"
  console.log(product.colors.length)  // 25
  
  product.colors.forEach(color => {
    console.log(color.colorName)      // "Athletic Heather"
    console.log(color.sizes)          // [{sizeName: "S", qty: 1000, price: 2.54}, ...]
  })
}
```

---

## Spark KV Store

### React Hook (Persistent State)
```typescript
import { useKV } from '@github/spark/hooks'

const [quotes, setQuotes] = useKV<Quote[]>('quotes', [])

// ❌ WRONG - Will cause data loss!
setQuotes([...quotes, newQuote])

// ✅ CORRECT - Always use functional updates
setQuotes((current) => [...current, newQuote])
```

### Common Operations
```typescript
// Add item
setQuotes((current) => [...current, newQuote])

// Update item
setQuotes((current) => 
  current.map(q => q.id === quoteId ? updatedQuote : q)
)

// Delete item
setQuotes((current) => 
  current.filter(q => q.id !== quoteId)
)

// Clear all
setQuotes([])

// Delete key
const [quotes, setQuotes, deleteQuotes] = useKV<Quote[]>('quotes', [])
deleteQuotes()
```

### Direct API (Non-React)
```typescript
// Set
await spark.kv.set('user-pref', { theme: 'dark' })

// Get
const pref = await spark.kv.get<{theme: string}>('user-pref')

// List all keys
const keys = await spark.kv.keys()

// Delete
await spark.kv.delete('user-pref')
```

---

## Spark LLM API

### Create Prompt
```typescript
// ✅ REQUIRED - Use spark.llmPrompt
const topic = "screen printing"
const prompt = spark.llmPrompt`Explain ${topic} in simple terms.`

// ❌ WRONG - Don't use plain strings
const badPrompt = `Explain ${topic}...`
```

### Execute LLM Call
```typescript
// Text response
const prompt = spark.llmPrompt`Write a quote description for ${product}`
const text = await spark.llm(prompt)

// JSON response (always returns root object!)
const prompt = spark.llmPrompt`
  Generate 5 customer names.
  Return JSON: { "customers": ["Name 1", "Name 2", ...] }
`
const result = await spark.llm(prompt, 'gpt-4o', true)
const data = JSON.parse(result)
console.log(data.customers)  // Array of names

// Use mini model for faster/cheaper
const suggestion = await spark.llm(prompt, 'gpt-4o-mini')
```

---

## User API

### Get Current User
```typescript
const user = await spark.user()
// Returns: { avatarUrl, email, id, isOwner, login }

// Conditional features
if (user.isOwner) {
  // Show admin features
}
```

---

## Error Handling

### Try-Catch with Toast
```typescript
import { toast } from 'sonner'

try {
  const product = await ssActivewearAPI.getProductByStyle(sku)
  if (!product) {
    toast.error('Product not found')
    return
  }
  toast.success('Product loaded')
} catch (error) {
  if (error.message === 'Invalid API credentials') {
    toast.error('Auth failed', {
      description: 'Check credentials in Settings'
    })
  } else {
    toast.error('Failed to load', {
      description: error.message
    })
  }
}
```

### Retry Logic
```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## Email Notifications

### Create Email
```typescript
import { createQuoteApprovalEmail } from '@/lib/email-notifications'

const notification = createQuoteApprovalEmail(quote, 'System')

// Add to history
setEmailNotifications((current) => [...current, notification])
```

### Template Variables
```typescript
const variables = {
  '{customer_name}': quote.customer.name,
  '{quote_number}': quote.quote_number,
  '{total_amount}': formatCurrency(quote.total),
  '{due_date}': formatDate(quote.due_date),
  '{balance_due}': formatCurrency(balance),
}
```

---

## SMS Notifications

### Send SMS (Twilio)
```typescript
const message = {
  to: '+15555551234',
  body: `Payment reminder: Quote ${quote.quote_number} - $${quote.total}`
}

// Check opt-out status first
const [optOuts] = useKV<string[]>('sms-opt-outs', [])
if (optOuts.includes(customerId)) {
  console.log('Customer opted out')
  return
}

// Calculate segments (160 chars = 1 segment)
const segments = Math.ceil(message.body.length / 160)
```

---

## Data Helpers

### Generate IDs
```typescript
import { generateId, generateJobNumber } from '@/lib/data'

const quoteId = generateId('q')    // "q-01234567"
const jobId = generateId('j')      // "j-01234567"
const customerId = generateId('c') // "c-01234567"
const jobNumber = generateJobNumber() // "JOB-01234567"
```

### Calculate Quote Totals
```typescript
import { calculateQuoteTotals } from '@/lib/data'

const quote = { /* ... */ }
const calculated = calculateQuoteTotals(quote)
// Returns quote with updated: subtotal, tax_amount, total
```

---

## Common Patterns

### Debounced Search
```typescript
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debounced
}

// Usage
const [query, setQuery] = useState('')
const debouncedQuery = useDebounce(query, 500)

useEffect(() => {
  if (debouncedQuery.length >= 3) {
    searchProducts(debouncedQuery)
  }
}, [debouncedQuery])
```

### Caching
```typescript
const cache = new Map<string, {data: any, timestamp: number}>()

function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data)
  }
  
  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() })
    return data
  })
}
```

### Batch Processing
```typescript
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 5,
  delayMs = 1000
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(processor)
    )
    
    batchResults.forEach(r => {
      if (r.status === 'fulfilled') results.push(r.value)
    })
    
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  
  return results
}
```

---

## Type Definitions

### Core Types
```typescript
import type {
  Quote,
  Job,
  Customer,
  LineItem,
  Decoration,
  QuoteStatus,
  JobStatus,
  CustomerTier,
  EmailNotification,
  PurchaseOrder,
} from '@/lib/types'
```

### Supplier Types
```typescript
import type {
  SSActivewearProduct,
  SSActivewearColor,
  SSActivewearSize,
  SSActivewearCredentials,
} from '@/lib/ssactivewear-api'

import type {
  SanMarProduct,
  SanMarColor,
  SanMarSize,
  SanMarCredentials,
} from '@/lib/sanmar-api'
```

---

## Storage Keys

All persistent data keys:

| Key | Type |
|-----|------|
| `quotes` | `Quote[]` |
| `jobs` | `Job[]` |
| `customers` | `Customer[]` |
| `email-notifications` | `EmailNotification[]` |
| `email-templates` | `EmailTemplate[]` |
| `customer-decoration-templates` | `CustomerDecorationTemplate[]` |
| `customer-artwork-files` | `CustomerArtworkFile[]` |
| `payment-reminders` | `PaymentReminder[]` |
| `filter-presets` | `FilterPreset[]` |
| `recent-searches` | `RecentSearch[]` |
| `favorite-products` | `FavoriteProduct[]` |
| `product-templates` | `ProductTemplate[]` |
| `customer-pricing-rules` | `CustomerPricingRule[]` |
| `quote-templates` | `QuoteTemplate[]` |
| `tax-certificates` | `TaxCertificate[]` |
| `purchase-orders` | `PurchaseOrder[]` |
| `ssactivewear-credentials` | `SSActivewearCredentials` |
| `sanmar-credentials` | `SanMarCredentials` |
| `is-logged-in` | `boolean` |

---

## Rate Limits

| API | Limit | Recommendation |
|-----|-------|----------------|
| S&S Activewear | ~1000/hour | Max 1/sec, use caching |
| SanMar | Varies by tier | Max 1/sec, queue bulk ops |
| Spark KV | Unlimited | N/A |
| Spark LLM | Based on account | Debounce user input |

---

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 401 | Unauthorized | Check credentials |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limit | Wait and retry |
| 500 | Server Error | Retry with backoff |

---

## Testing

### Mock API
```typescript
const mockAPI = {
  async getProductByStyle(sku: string) {
    await new Promise(r => setTimeout(r, 500))
    return { styleID: sku, styleName: 'Mock Product', /* ... */ }
  }
}

const api = import.meta.env.DEV ? mockAPI : ssActivewearAPI
```

### Test Credentials
```typescript
async function testConnection(creds: SSActivewearCredentials) {
  try {
    ssActivewearAPI.setCredentials(creds)
    const product = await ssActivewearAPI.getProductByStyle('5000')
    return !!product
  } catch (error) {
    return false
  }
}
```

---

## Resources

- **Full API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Project Docs**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **S&S API**: https://api.ssactivewear.com/V2/Default.aspx
- **SanMar API**: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary

---

**Last Updated**: 2024  
**Version**: 1.0.0
