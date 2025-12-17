# Spark → mintprints-api Integration Guide

This guide explains how to connect your GitHub Spark print-shop-pro frontend to your existing mintprints-api backend.

## Quick Start

### 1. Copy Files

Copy these files into your Spark project's `src/lib/` directory:

```
src/lib/
├── api-adapter.ts    # Transform functions + API client
├── api-hooks.ts      # React hooks for data fetching
└── types.ts          # (your existing types file)
```

### 2. Update API Base URL

In `api-adapter.ts`, update the API_BASE constant if needed:

```typescript
const API_BASE = 'https://mintprints-api.ronny.works'
```

### 3. Choose Integration Strategy

You have three options:

---

## Option A: Full API Mode (Replace Sample Data)

Replace the useKV calls with API hooks for a fully live experience.

**In App.tsx:**

```tsx
// Before (sample data)
const [quotes, setQuotes] = useKV<Quote[]>('quotes', sampleQuotes)
const [jobs, setJobs] = useKV<Job[]>('jobs', sampleJobs)
const [customers, setCustomers] = useKV<Customer[]>('customers', sampleCustomers)

// After (API data)
import { useAPIQuotes, useAPIJobs, useAPICustomers } from '@/lib/api-hooks'

const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes } = useAPIQuotes()
const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useAPIJobs()
const { data: customers, isLoading: customersLoading, refetch: refetchCustomers } = useAPICustomers()
```

**Add loading states:**

```tsx
if (quotesLoading || jobsLoading || customersLoading) {
  return <LoadingScreen />
}
```

---

## Option B: Hybrid Mode (API + Local Edits)

Fetch from API but allow local modifications. Best for development/testing.

```tsx
import { useHybridData, apiClient } from '@/lib/api-adapter'

const {
  data: quotes,
  setData: setQuotes,
  isLoading,
  addItem: addQuote,
  updateItem: updateQuote,
} = useHybridData(() => apiClient.getQuotes())
```

---

## Option C: Progressive Migration

Keep sample data as fallback, fetch API data on demand.

```tsx
const [quotes, setQuotes] = useKV<Quote[]>('quotes', sampleQuotes)
const [useAPIData, setUseAPIData] = useState(false)

// Fetch API data when enabled
useEffect(() => {
  if (useAPIData) {
    apiClient.getQuotes().then(apiQuotes => {
      setQuotes(apiQuotes)
    })
  }
}, [useAPIData])

// Toggle in settings
<Switch 
  checked={useAPIData} 
  onCheckedChange={setUseAPIData}
  label="Use Live API Data"
/>
```

---

## Data Shape Mapping

The adapter handles these transformations automatically:

### Customer
| API Field | Spark Field | Notes |
|-----------|-------------|-------|
| `id` (number) | `id` (string) | Prefixed with `c-` |
| `first_name` + `last_name` | `name` | Combined |
| `company` | `company` | Direct |
| `email` | `email` | Direct |
| `phone` | `phone` | Direct |
| `address_1`, `city`, etc. | `address.street`, etc. | Restructured |
| `tax_exempt` | `taxExempt` | Direct |

### Quote
| API Field | Spark Field | Notes |
|-----------|-------------|-------|
| `id` (number) | `id` (string) | Prefixed with `q-` |
| `visual_id` | `quote_number` | Direct |
| `orderstatus.name` | `status` | Mapped to enum |
| `customer` | `customer` | Transformed |
| `lineitems` | `line_items` | Transformed array |
| `discount_as_percentage` | `discount_type` | `true` → `'percent'` |
| `customer_note` | `notes_customer` | Direct |
| `production_note` | `notes_internal` | Direct |

### Job
| API Field | Spark Field | Notes |
|-----------|-------------|-------|
| `id` (number) | `id` (string) | Prefixed with `j-` |
| `visual_id` | `job_number` | Direct |
| `orderstatus.name` | `status` | Mapped to job statuses |
| `quote_id` | `quote_id` | Prefixed with `q-` |
| (calculated) | `progress` | Based on status |
| (calculated) | `artwork_approved` | Based on status |

### Status Mapping

**Quotes:**
```
Draft, New → draft
Pending, Sent, Awaiting Approval → sent
Approved, Won → approved
Rejected, Lost → rejected
Expired, Cancelled → expired
```

**Jobs:**
```
New, Pending → pending
Art Approval, Awaiting Artwork → art-approval
Artwork Approved, Scheduled → scheduled
In Production, Printing, Print → printing
Finishing → finishing
Complete, Ready, Ready for Pickup → ready
Shipped → shipped
Delivered, Picked Up → delivered
```

---

## API Endpoints Expected

The adapter expects these endpoints on your API:

```
GET /api/quotes
GET /api/quotes/:id
GET /api/orders (jobs)
GET /api/orders/:id
GET /api/customers
GET /api/customers/:id
```

**Query Parameters:**
- `status` - Filter by status
- `limit` - Pagination limit
- `offset` - Pagination offset
- `search` - Text search (customers)

---

## Handling Updates (Write Operations)

For creating/updating data, add these methods to the API client:

```typescript
// In api-adapter.ts, add to MintPrintsAPIClient class:

async createQuote(quote: Partial<Quote>): Promise<Quote> {
  const apiQuote = reverseTransformQuote(quote)
  const result = await this.fetch<APIQuote>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(apiQuote),
  })
  return transformQuote(result)
}

async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  const numericId = id.replace(/^q-/, '')
  const apiUpdates = reverseTransformQuoteUpdates(updates)
  const result = await this.fetch<APIQuote>(`/api/quotes/${numericId}`, {
    method: 'PATCH',
    body: JSON.stringify(apiUpdates),
  })
  return transformQuote(result)
}
```

---

## Error Handling

The hooks provide error states:

```tsx
const { data, isLoading, error } = useAPIQuotes()

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading quotes</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
```

---

## CORS Configuration

Ensure your mintprints-api allows requests from your Spark frontend:

```javascript
// In your API (Express example)
app.use(cors({
  origin: [
    'https://spark.github.dev',
    'https://your-spark-app.github.io',
    'http://localhost:5173', // local dev
  ],
  credentials: true,
}))
```

---

## Next Steps

1. **Test the connection** - Use browser dev tools to verify API calls
2. **Add loading states** - Use the skeleton components for better UX
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Implement write operations** - Add reverse transforms for mutations
5. **Add real-time updates** - Consider WebSocket/polling for live data

---

## Troubleshooting

**"CORS error"**
- Add your frontend URL to the API's CORS whitelist

**"404 on API endpoints"**
- Verify endpoint paths match your actual API routes
- Check if `/api/` prefix is needed

**"Data not transforming correctly"**
- Check API response shape in Network tab
- Update type definitions if your API differs from expected format

**"Types mismatch"**
- Ensure you're using the same `types.ts` file
- Regenerate types if API schema has changed
