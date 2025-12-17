# Mint Prints API Documentation
## Complete API Reference & Integration Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [Supplier API Integrations](#supplier-api-integrations)
5. [Internal Data API](#internal-data-api)
6. [Spark Runtime API](#spark-runtime-api)
7. [Email & SMS APIs](#email--sms-apis)
8. [Error Handling](#error-handling)
9. [Rate Limiting & Best Practices](#rate-limiting--best-practices)
10. [Code Examples](#code-examples)

---

## Overview

Mint Prints integrates with multiple external APIs and provides internal data management through the Spark runtime. This document covers all API interactions, authentication flows, and integration patterns.

### API Categories

1. **Supplier APIs** - Product catalog integration (S&S Activewear, SanMar)
2. **Spark Runtime API** - Persistent storage and AI features
3. **Communication APIs** - Email and SMS notifications (Twilio)
4. **Internal Data API** - Application state management

---

## Architecture

### API Client Structure

```
src/lib/
├── ssactivewear-api.ts      # S&S Activewear API client
├── sanmar-api.ts            # SanMar API client
├── twilio-sms.ts            # Twilio SMS client
├── email-notifications.ts   # Email template builder
└── data.ts                  # Internal data utilities
```

### Data Flow

```
┌─────────────────┐
│  React Components │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  API Clients     │ ──────► External APIs (S&S, SanMar, Twilio)
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Spark Runtime   │ ──────► Persistent KV Store
└─────────────────┘
```

---

## Authentication

### S&S Activewear Authentication

**Type**: HTTP Basic Authentication

**Credentials**:
- **Account Number**: Your S&S Activewear account number
- **API Key**: Generated from S&S Activewear account dashboard

**Storage**: Credentials stored in Spark KV store at key `ssactivewear-credentials`

#### Configuration Flow

```typescript
import { useKV } from '@github/spark/hooks'
import type { SSActivewearCredentials } from '@/lib/ssactivewear-api'

// Component configuration
const [creds, setCreds] = useKV<SSActivewearCredentials>('ssactivewear-credentials', {
  accountNumber: '',
  apiKey: ''
})

// Update credentials
const handleSaveCredentials = () => {
  setCreds({
    accountNumber: 'YOUR_ACCOUNT_NUMBER',
    apiKey: 'YOUR_API_KEY'
  })
}
```

#### Authentication Header

```typescript
// Internal implementation in ssactivewear-api.ts
private getAuthHeader(): string {
  if (!this.credentials) {
    throw new Error('API credentials not set')
  }
  const auth = btoa(`${this.credentials.accountNumber}:${this.credentials.apiKey}`)
  return `Basic ${auth}`
}
```

#### API Request Example

```typescript
const response = await fetch(`${this.baseUrl}/v2/products/?style=${styleID}`, {
  method: 'GET',
  headers: {
    'Authorization': this.getAuthHeader(),
    'Content-Type': 'application/json',
  },
})
```

---

### SanMar Authentication

**Type**: HTTP Basic Authentication

**Credentials**:
- **Customer ID**: Your SanMar customer ID
- **API Key**: Generated from SanMar API portal

**Storage**: Credentials stored in Spark KV store at key `sanmar-credentials`

#### Configuration Flow

```typescript
import { useKV } from '@github/spark/hooks'
import type { SanMarCredentials } from '@/lib/sanmar-api'

const [creds, setCreds] = useKV<SanMarCredentials>('sanmar-credentials', {
  customerId: '',
  apiKey: ''
})
```

#### Authentication Header

```typescript
// Internal implementation in sanmar-api.ts
private getAuthHeader(): string {
  if (!this.credentials) {
    throw new Error('API credentials not set')
  }
  const auth = btoa(`${this.credentials.customerId}:${this.credentials.apiKey}`)
  return `Basic ${auth}`
}
```

---

### Twilio Authentication

**Type**: Account SID + Auth Token

**Credentials**:
- **Account SID**: Twilio account identifier
- **Auth Token**: Twilio authentication token
- **From Phone Number**: Verified Twilio phone number for sending SMS

**Storage**: Credentials stored in Spark KV store at key `twilio-credentials`

#### Configuration Example

```typescript
interface TwilioCredentials {
  accountSid: string
  authToken: string
  fromPhoneNumber: string
}

const [twilioConfig, setTwilioConfig] = useKV<TwilioCredentials>('twilio-credentials', {
  accountSid: '',
  authToken: '',
  fromPhoneNumber: ''
})
```

---

## Supplier API Integrations

### S&S Activewear API

**Base URL**: `https://api.ssactivewear.com`

**API Version**: v2

**Documentation**: https://api.ssactivewear.com/V2/Default.aspx

---

#### Get Product by Style

**Endpoint**: `GET /v2/products/?style={styleID}`

**Description**: Retrieve product details by style ID/SKU

**Parameters**:
- `style` (required): Product style ID or SKU

**Response Type**: `SSActivewearProduct`

**Code Example**:

```typescript
import { ssActivewearAPI } from '@/lib/ssactivewear-api'

async function fetchProduct(styleID: string) {
  try {
    const product = await ssActivewearAPI.getProductByStyle(styleID)
    
    if (!product) {
      console.log('Product not found')
      return
    }
    
    console.log('Product:', product.styleName)
    console.log('Brand:', product.brandName)
    console.log('Colors:', product.colors.length)
    
    return product
  } catch (error) {
    if (error.message === 'Invalid API credentials') {
      // Handle authentication error
    } else if (error.message === 'API credentials not configured') {
      // Prompt user to configure credentials
    } else {
      // Handle other errors
    }
  }
}
```

**Response Structure**:

```typescript
interface SSActivewearProduct {
  styleID: string              // "PC54"
  styleName: string            // "Port & Company® Core Cotton Tee"
  brandName: string            // "Port & Company"
  categoryName: string         // "T-Shirts"
  colorCount: number           // 25
  colors: SSActivewearColor[]
  styleImage?: string          // Image URL
}

interface SSActivewearColor {
  colorID: number              // 1234
  colorName: string            // "Athletic Heather"
  colorCode: string            // "ATHHT"
  sizes: SSActivewearSize[]
  colorFrontImage?: string     // Front view URL
  colorBackImage?: string      // Back view URL
  colorSideImage?: string      // Side view URL
}

interface SSActivewearSize {
  sizeID: number              // 5678
  sizeName: string            // "XL"
  qty: number                 // Stock quantity: 1250
  price: number               // Wholesale price: 4.98
}
```

---

#### Search Products

**Endpoint**: `GET /v2/products/?search={query}`

**Description**: Search for products by name, brand, or category

**Parameters**:
- `search` (required): Search query string

**Response Type**: `SSActivewearProduct[]`

**Code Example**:

```typescript
async function searchProducts(query: string) {
  try {
    const products = await ssActivewearAPI.searchProducts(query)
    
    console.log(`Found ${products.length} products`)
    
    products.forEach(product => {
      console.log(`${product.styleName} - ${product.brandName}`)
    })
    
    return products
  } catch (error) {
    console.error('Search failed:', error)
  }
}
```

**Common Search Examples**:

```typescript
// Search by brand
await ssActivewearAPI.searchProducts('Gildan')

// Search by product type
await ssActivewearAPI.searchProducts('Hoodie')

// Search by specific style
await ssActivewearAPI.searchProducts('5000')
```

---

#### Check Credentials Status

**Method**: `hasCredentials()`

**Description**: Check if API credentials are configured

**Code Example**:

```typescript
import { ssActivewearAPI } from '@/lib/ssactivewear-api'

if (ssActivewearAPI.hasCredentials()) {
  // Credentials are configured
  const product = await ssActivewearAPI.getProductByStyle('PC54')
} else {
  // Prompt user to configure credentials
  console.log('Please configure S&S Activewear API credentials in Settings')
}
```

---

#### Set Credentials

**Method**: `setCredentials(credentials)`

**Description**: Update API credentials at runtime

**Code Example**:

```typescript
import { ssActivewearAPI } from '@/lib/ssactivewear-api'

// Typically called in App.tsx when credentials change
useEffect(() => {
  if (ssActivewearCreds && ssActivewearCreds.accountNumber && ssActivewearCreds.apiKey) {
    ssActivewearAPI.setCredentials(ssActivewearCreds)
  }
}, [ssActivewearCreds])
```

---

### SanMar API

**Base URL**: `https://www.sanmar.com/api/v2`

**Documentation**: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary

---

#### Get Product by Style

**Endpoint**: `GET /products/{styleID}`

**Description**: Retrieve product details by style ID

**Parameters**:
- `styleID` (required): Product style ID

**Response Type**: `SanMarProduct`

**Code Example**:

```typescript
import { sanMarAPI } from '@/lib/sanmar-api'

async function fetchSanMarProduct(styleID: string) {
  try {
    const product = await sanMarAPI.getProductByStyle(styleID)
    
    if (!product) {
      console.log('Product not found')
      return
    }
    
    console.log('Product:', product.productName)
    console.log('Brand:', product.brandName)
    console.log('Available colors:', product.colors.length)
    
    return product
  } catch (error) {
    if (error.message === 'Invalid API credentials') {
      // Handle authentication error
    } else if (error.message === 'API credentials not configured') {
      // Prompt user to configure credentials
    } else {
      // Handle other errors
    }
  }
}
```

**Response Structure**:

```typescript
interface SanMarProduct {
  styleID: string              // "PC54"
  productName: string          // "Port & Company Core Cotton Tee"
  brandName: string            // "Port & Company"
  categoryName: string         // "T-Shirts"
  colors: SanMarColor[]
  productImage?: string        // Image URL
}

interface SanMarColor {
  colorID: string             // "ATHHT"
  colorName: string           // "Athletic Heather"
  colorCode: string           // "ATHHT"
  sizes: SanMarSize[]
  colorImage?: string         // Image URL
}

interface SanMarSize {
  sizeName: string            // "XL"
  inventory: number           // Stock quantity: 1250
  casePrice: number           // Case price: 119.52
  piecePrice: number          // Piece price: 4.98
}
```

---

#### Search Products

**Endpoint**: `GET /products?search={query}`

**Description**: Search SanMar product catalog

**Parameters**:
- `search` (required): Search query

**Response Type**: `SanMarProduct[]`

**Code Example**:

```typescript
async function searchSanMarProducts(query: string) {
  try {
    const products = await sanMarAPI.searchProducts(query)
    
    console.log(`Found ${products.length} products`)
    
    return products
  } catch (error) {
    console.error('Search failed:', error)
  }
}
```

---

#### Data Transformation

SanMar API responses are automatically transformed to a consistent format:

```typescript
// Internal transformation (happens automatically)
private transformProductData(data: any): SanMarProduct {
  // Handles variations in field names across API versions
  // Maps: StyleID/ProductID → styleID
  // Maps: ProductName/StyleName → productName
  // Maps: Colors.Size/Sizes → sizes array
  // Maps: Inventory/Qty → inventory
  // Maps: PiecePrice/Price → piecePrice
  
  return {
    styleID: data.StyleID || data.ProductID || '',
    productName: data.ProductName || data.StyleName || '',
    brandName: data.BrandName || data.Brand || '',
    categoryName: data.CategoryName || data.Category || '',
    colors: [...],
    productImage: data.ProductImage || data.StyleImage || undefined,
  }
}
```

---

## Internal Data API

### Spark KV Store API

**Description**: Client-side persistent key-value store for all application data

**Import**: `import { useKV } from '@github/spark/hooks'`

---

#### useKV Hook (React)

**Signature**:

```typescript
function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void]
```

**Returns**: `[value, setValue, deleteValue]`

**Usage Pattern**:

```typescript
import { useKV } from '@github/spark/hooks'
import type { Quote } from '@/lib/types'

function QuoteManager() {
  // Initialize with default value
  const [quotes, setQuotes, deleteQuotes] = useKV<Quote[]>('quotes', [])
  
  // ❌ WRONG - closure reference is stale, WILL CAUSE DATA LOSS
  const addQuote = (newQuote: Quote) => {
    setQuotes([...quotes, newQuote])  // BUG: quotes is stale!
  }
  
  // ✅ CORRECT - functional update gets current value
  const addQuote = (newQuote: Quote) => {
    setQuotes((current) => [...current, newQuote])
  }
  
  // Update quote
  const updateQuote = (updatedQuote: Quote) => {
    setQuotes((current) => 
      current.map(q => q.id === updatedQuote.id ? updatedQuote : q)
    )
  }
  
  // Delete quote
  const deleteQuote = (quoteId: string) => {
    setQuotes((current) => 
      current.filter(q => q.id !== quoteId)
    )
  }
  
  // Clear all quotes
  const clearAllQuotes = () => {
    setQuotes([])  // This is fine - doesn't depend on previous state
  }
  
  // Delete the entire key from storage
  const removeQuotesKey = () => {
    deleteQuotes()
  }
  
  return (
    <div>
      {quotes.map(quote => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  )
}
```

---

#### Spark KV Direct API (Non-React)

**Import**: `window.spark.kv` (globally available)

**Methods**:

```typescript
interface SparkKV {
  keys: () => Promise<string[]>
  get: <T>(key: string) => Promise<T | undefined>
  set: <T>(key: string, value: T) => Promise<void>
  delete: (key: string) => Promise<void>
}
```

**Code Examples**:

```typescript
// Set a value
await spark.kv.set('user-preference', { theme: 'dark', layout: 'compact' })

// Get a value
const preference = await spark.kv.get<{theme: string, layout: string}>('user-preference')

if (preference) {
  console.log('Theme:', preference.theme)
}

// Get all keys
const allKeys = await spark.kv.keys()
console.log('Stored keys:', allKeys)

// Delete a value
await spark.kv.delete('user-preference')

// Check if key exists
const keys = await spark.kv.keys()
const exists = keys.includes('user-preference')
```

---

### Application Data Keys

All persistent data in Mint Prints uses these keys:

| Key | Type | Description |
|-----|------|-------------|
| `is-logged-in` | `boolean` | User authentication state |
| `quotes` | `Quote[]` | All customer quotes |
| `jobs` | `Job[]` | All production jobs |
| `customers` | `Customer[]` | All customer records |
| `customer-decoration-templates` | `CustomerDecorationTemplate[]` | Saved decoration presets |
| `payment-reminders` | `PaymentReminder[]` | Payment reminder configurations |
| `customer-artwork-files` | `CustomerArtworkFile[]` | Artwork library files |
| `email-notifications` | `EmailNotification[]` | Email send history |
| `email-templates` | `EmailTemplate[]` | Custom email templates |
| `filter-presets` | `FilterPreset[]` | Saved filter combinations |
| `recent-searches` | `RecentSearch[]` | Search history (last 50) |
| `favorite-products` | `FavoriteProduct[]` | Bookmarked supplier products |
| `product-templates` | `ProductTemplate[]` | Product configuration templates |
| `customer-pricing-rules` | `CustomerPricingRule[]` | Automatic discount rules |
| `quote-templates` | `QuoteTemplate[]` | Quote templates by category |
| `tax-certificates` | `TaxCertificate[]` | Customer tax exemption certificates |
| `purchase-orders` | `PurchaseOrder[]` | Supplier purchase orders |
| `ssactivewear-credentials` | `SSActivewearCredentials` | S&S API credentials |
| `sanmar-credentials` | `SanMarCredentials` | SanMar API credentials |

---

### CRUD Operations Examples

#### Create (Add New Item)

```typescript
import { useKV } from '@github/spark/hooks'
import { generateId } from '@/lib/data'
import type { Customer } from '@/lib/types'

const [customers, setCustomers] = useKV<Customer[]>('customers', [])

const createCustomer = (customerData: Omit<Customer, 'id'>) => {
  const newCustomer: Customer = {
    id: generateId('c'),
    ...customerData
  }
  
  setCustomers((current) => [...current, newCustomer])
  
  return newCustomer
}
```

#### Read (Get Items)

```typescript
// All items available via hook
const [customers, setCustomers] = useKV<Customer[]>('customers', [])

// Filter/search
const activeCustomers = customers.filter(c => c.tier === 'gold')

// Find by ID
const getCustomerById = (id: string) => {
  return customers.find(c => c.id === id)
}
```

#### Update (Modify Item)

```typescript
const updateCustomer = (updatedCustomer: Customer) => {
  setCustomers((current) => 
    current.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
  )
}

// Partial update
const updateCustomerEmail = (customerId: string, newEmail: string) => {
  setCustomers((current) =>
    current.map(c => 
      c.id === customerId ? { ...c, email: newEmail } : c
    )
  )
}
```

#### Delete (Remove Item)

```typescript
const deleteCustomer = (customerId: string) => {
  setCustomers((current) => 
    current.filter(c => c.id !== customerId)
  )
}

// Bulk delete
const deleteMultipleCustomers = (customerIds: string[]) => {
  setCustomers((current) =>
    current.filter(c => !customerIds.includes(c.id))
  )
}
```

---

### Data Relationships

#### Quote → Job Conversion

```typescript
import { generateId, generateJobNumber } from '@/lib/data'
import type { Quote, Job } from '@/lib/types'

const convertQuoteToJob = (quote: Quote): Job => {
  const newJob: Job = {
    id: generateId('j'),
    job_number: generateJobNumber(),
    quote_id: quote.id,
    status: 'pending',
    customer: quote.customer,
    line_items: quote.line_items,
    due_date: quote.due_date,
    ship_date: '',
    production_notes: quote.notes_internal || '',
    artwork_approved: false,
    assigned_to: [],
    progress: 0,
    nickname: quote.nickname,
  }
  
  // Add job to jobs array
  setJobs((current) => [...current, newJob])
  
  // Update quote status to approved
  setQuotes((current) =>
    current.map(q => q.id === quote.id ? { ...q, status: 'approved' as const } : q)
  )
  
  return newJob
}
```

#### Customer → Quotes Lookup

```typescript
const getCustomerQuotes = (customerId: string): Quote[] => {
  return quotes.filter(q => q.customer.id === customerId)
}

const getCustomerJobs = (customerId: string): Job[] => {
  return jobs.filter(j => j.customer.id === customerId)
}

const getCustomerTotalRevenue = (customerId: string): number => {
  const customerQuotes = quotes.filter(
    q => q.customer.id === customerId && q.status === 'approved'
  )
  return customerQuotes.reduce((sum, q) => sum + q.total, 0)
}
```

#### Artwork Library → Decorations

```typescript
import type { CustomerArtworkFile, Decoration } from '@/lib/types'

const useArtworkInDecoration = (
  decoration: Decoration, 
  artworkFile: CustomerArtworkFile
): Decoration => {
  return {
    ...decoration,
    artworkFileId: artworkFile.id,
    imprint_width: artworkFile.imprintWidth || decoration.imprint_width,
    imprint_height: artworkFile.imprintHeight || decoration.imprint_height,
  }
}
```

---

## Spark Runtime API

### LLM API

**Description**: AI-powered text generation using OpenAI GPT models

**Import**: `window.spark` (globally available)

---

#### Prompt Construction

**Method**: `spark.llmPrompt`

**Description**: Template literal tag for creating prompts (REQUIRED)

**Code Example**:

```typescript
const topic = "screen printing best practices"
const audience = "beginners"

// ✅ CORRECT - Use spark.llmPrompt for all prompts
const prompt = spark.llmPrompt`
  Write a brief explanation of ${topic} for ${audience}.
  Keep it under 200 words.
`

// ❌ WRONG - Don't use plain strings
const badPrompt = `Write about ${topic}...`
```

---

#### LLM Execution

**Method**: `spark.llm(prompt, modelName?, jsonMode?)`

**Parameters**:
- `prompt` (required): Prompt string created with `spark.llmPrompt`
- `modelName` (optional): 'gpt-4o' (default) or 'gpt-4o-mini'
- `jsonMode` (optional): true for JSON response, false (default) for text

**Returns**: `Promise<string>`

**Code Examples**:

```typescript
// Text response
const prompt = spark.llmPrompt`Explain screen printing in simple terms.`
const explanation = await spark.llm(prompt)
console.log(explanation)

// JSON response
const jsonPrompt = spark.llmPrompt`
  Generate 5 sample customer names. 
  Return as JSON with a single property "customers" containing an array of objects.
  Format: { "customers": [{"name": "John Doe", "company": "Acme Inc"}, ...] }
`
const jsonResult = await spark.llm(jsonPrompt, 'gpt-4o', true)
const data = JSON.parse(jsonResult)
console.log(data.customers)  // Array of customer objects

// Using different model
const miniPrompt = spark.llmPrompt`Suggest a catchy business name for a print shop.`
const suggestion = await spark.llm(miniPrompt, 'gpt-4o-mini')
```

---

#### JSON Mode Best Practices

**Important**: JSON mode always returns a root object, not an array!

```typescript
// ✅ CORRECT - Request root object with array property
const prompt = spark.llmPrompt`
  Generate 10 product names.
  Return as JSON object with property "products" that contains the array.
  Format: { "products": ["Product 1", "Product 2", ...] }
`
const result = await spark.llm(prompt, 'gpt-4o', true)
const data = JSON.parse(result)
console.log(data.products)  // Array of products

// ❌ WRONG - Requesting array as root will fail
const badPrompt = spark.llmPrompt`Return an array of products as JSON.`
const badResult = await spark.llm(badPrompt, 'gpt-4o', true)
// This will error or return unexpected format
```

---

#### Practical Use Cases

**Generate Quote Notes**:

```typescript
async function generateQuoteNotes(lineItems: LineItem[]) {
  const itemsDesc = lineItems.map(item => 
    `${item.product_name} (${item.color}) - ${Object.values(item.sizes).reduce((a,b) => a+b, 0)} units`
  ).join(', ')
  
  const prompt = spark.llmPrompt`
    Create professional customer-facing notes for a quote with these items: ${itemsDesc}
    Include estimated delivery time and care instructions.
    Keep it under 150 words.
  `
  
  const notes = await spark.llm(prompt, 'gpt-4o-mini')
  return notes
}
```

**Smart Product Recommendations**:

```typescript
async function getProductRecommendations(customerHistory: Quote[]) {
  const previousProducts = customerHistory
    .flatMap(q => q.line_items)
    .map(item => item.product_name)
    .slice(0, 10)
  
  const prompt = spark.llmPrompt`
    Based on these previous orders: ${previousProducts.join(', ')}
    Recommend 5 complementary products a print shop customer might want.
    Return as JSON: { "recommendations": [{"product": "name", "reason": "why"}, ...] }
  `
  
  const result = await spark.llm(prompt, 'gpt-4o', true)
  const data = JSON.parse(result)
  return data.recommendations
}
```

---

### User API

**Method**: `spark.user()`

**Description**: Get current GitHub user information

**Returns**: `Promise<UserInfo>`

**Code Example**:

```typescript
interface UserInfo {
  avatarUrl: string
  email: string
  id: string
  isOwner: boolean
  login: string
}

async function loadUserProfile() {
  const user = await spark.user()
  
  console.log('Username:', user.login)
  console.log('Email:', user.email)
  console.log('Avatar:', user.avatarUrl)
  console.log('Is Owner:', user.isOwner)
  
  // Conditional features based on ownership
  if (user.isOwner) {
    // Show admin settings
    // Allow deletion of data
    // Display full reports
  } else {
    // Limited access
  }
  
  return user
}
```

**Practical Use Cases**:

```typescript
// Show user info in header
function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  
  useEffect(() => {
    spark.user().then(setUser)
  }, [])
  
  if (!user) return null
  
  return (
    <div className="flex items-center gap-2">
      <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full" />
      <span>{user.login}</span>
    </div>
  )
}

// Admin-only features
function AdminSettings() {
  const [isOwner, setIsOwner] = useState(false)
  
  useEffect(() => {
    spark.user().then(u => setIsOwner(u.isOwner))
  }, [])
  
  if (!isOwner) {
    return <div>Access denied. Owner only.</div>
  }
  
  return <SettingsPanel />
}
```

---

## Email & SMS APIs

### Email Notifications

**Implementation**: `/src/lib/email-notifications.ts`

**Description**: Generate email notifications for various events

---

#### Email Notification Types

```typescript
type EmailNotificationType = 
  | 'quote-approval-request'
  | 'quote-approved'
  | 'quote-reminder'
  | 'invoice'
  | 'artwork-approval'
  | 'artwork-approved'
  | 'artwork-rejected'
  | 'payment-reminder'
  | 'payment-received'
  | 'job-status-update'
  | 'shipping-notification'
  | 'pickup-notification'
  | 'custom'
```

---

#### Create Email Notification

```typescript
import { createQuoteApprovalEmail } from '@/lib/email-notifications'
import type { EmailNotification, Quote } from '@/lib/types'

const sendQuoteApproval = (quote: Quote, senderName: string) => {
  // Create email notification record
  const notification: EmailNotification = createQuoteApprovalEmail(quote, senderName)
  
  // Add to email history
  setEmailNotifications((current) => [...current, notification])
  
  // In production, this would trigger actual email send
  console.log('Email sent to:', notification.customerEmail)
  console.log('Subject:', notification.subject)
  console.log('Body:', notification.body)
}
```

---

#### Email Template Variables

Available variables in email templates:

```typescript
const templateVariables = {
  // Customer info
  '{customer_name}': quote.customer.name,
  '{customer_email}': quote.customer.email,
  '{customer_company}': quote.customer.company,
  
  // Quote/Job info
  '{quote_number}': quote.quote_number,
  '{quote_nickname}': quote.nickname,
  '{job_number}': job.job_number,
  '{total_amount}': formatCurrency(quote.total),
  '{balance_due}': formatCurrency(quote.total - totalPaid),
  '{due_date}': formatDate(quote.due_date),
  '{created_date}': formatDate(quote.created_date),
  
  // Line items
  '{line_items}': formatLineItems(quote.line_items),
  
  // Notes
  '{notes_customer}': quote.notes_customer,
  '{notes_internal}': quote.notes_internal,
  
  // System
  '{current_date}': formatDate(new Date()),
  '{sender_name}': 'Shop Manager',
  '{shop_name}': 'Mint Prints',
}
```

---

#### Custom Email Templates

```typescript
interface EmailTemplate {
  id: string
  name: string
  type: EmailNotificationType
  subject: string
  body: string
  isActive: boolean
  logoUrl?: string
}

// Create custom template
const createPaymentReminderTemplate = (): EmailTemplate => {
  return {
    id: generateId('et'),
    name: 'Friendly Payment Reminder',
    type: 'payment-reminder',
    subject: 'Payment Reminder: Quote {quote_number}',
    body: `
      Hi {customer_name},
      
      This is a friendly reminder that payment for Quote {quote_number} is due.
      
      Total Amount: {total_amount}
      Due Date: {due_date}
      
      Please submit payment at your earliest convenience.
      
      Thank you!
      {shop_name}
    `,
    isActive: true,
  }
}
```

---

### SMS Notifications (Twilio)

**Implementation**: `/src/lib/twilio-sms.ts`

**Description**: Send SMS notifications for high-priority reminders

---

#### SMS Configuration

```typescript
interface TwilioConfig {
  accountSid: string
  authToken: string
  fromPhoneNumber: string
}

const [twilioConfig, setTwilioConfig] = useKV<TwilioConfig>('twilio-credentials', {
  accountSid: '',
  authToken: '',
  fromPhoneNumber: ''
})
```

---

#### Send SMS

```typescript
interface SMSMessage {
  to: string
  body: string
}

async function sendPaymentReminderSMS(
  quote: Quote,
  phoneNumber: string,
  config: TwilioConfig
) {
  const message: SMSMessage = {
    to: phoneNumber,
    body: `Payment reminder: Quote ${quote.quote_number} - $${quote.total} due ${quote.due_date}. Please contact Mint Prints to arrange payment.`
  }
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: message.to,
          From: config.fromPhoneNumber,
          Body: message.body,
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error('SMS send failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Twilio error:', error)
    throw error
  }
}
```

---

#### SMS Template Variables

```typescript
const smsTemplateVariables = {
  '{customer_name}': quote.customer.name,
  '{quote_number}': quote.quote_number,
  '{total_amount}': formatCurrency(quote.total),
  '{balance_due}': formatCurrency(balance),
  '{due_date}': formatDate(quote.due_date),
  '{days_overdue}': calculateDaysOverdue(quote.due_date),
  '{shop_name}': 'Mint Prints',
  '{shop_phone}': '(555) 123-4567',
}
```

---

#### SMS Best Practices

```typescript
// Check character count (160 chars = 1 SMS segment)
const calculateSegments = (message: string): number => {
  return Math.ceil(message.length / 160)
}

// Check customer opt-out status
const canSendSMS = (customerId: string, optOuts: string[]): boolean => {
  return !optOuts.includes(customerId)
}

// Example usage
const sendSMSIfAllowed = async (quote: Quote) => {
  const [smsOptOuts] = useKV<string[]>('sms-opt-outs', [])
  
  if (!canSendSMS(quote.customer.id, smsOptOuts)) {
    console.log('Customer has opted out of SMS')
    return
  }
  
  const message = `Payment reminder for Quote ${quote.quote_number}`
  const segments = calculateSegments(message)
  
  if (segments > 2) {
    console.warn('Message too long, consider shortening')
  }
  
  // Send SMS
}
```

---

## Error Handling

### API Error Types

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Common error scenarios
const errorTypes = {
  AUTHENTICATION_ERROR: 'Invalid API credentials',
  NOT_CONFIGURED: 'API credentials not configured',
  NOT_FOUND: 'Resource not found',
  RATE_LIMIT: 'Rate limit exceeded',
  NETWORK_ERROR: 'Network request failed',
  VALIDATION_ERROR: 'Invalid request parameters',
}
```

---

### Error Handling Patterns

#### Try-Catch with User Feedback

```typescript
import { toast } from 'sonner'

async function fetchProductWithFeedback(styleID: string) {
  try {
    const product = await ssActivewearAPI.getProductByStyle(styleID)
    
    if (!product) {
      toast.error('Product not found', {
        description: `No product found with SKU: ${styleID}`
      })
      return null
    }
    
    toast.success('Product loaded successfully')
    return product
    
  } catch (error) {
    if (error.message === 'Invalid API credentials') {
      toast.error('Authentication failed', {
        description: 'Please check your S&S Activewear credentials in Settings',
        action: {
          label: 'Go to Settings',
          onClick: () => navigateToSettings()
        }
      })
    } else if (error.message === 'API credentials not configured') {
      toast.error('API not configured', {
        description: 'Configure S&S Activewear credentials in Settings to search products'
      })
    } else {
      toast.error('Failed to load product', {
        description: error.message || 'Unknown error occurred'
      })
    }
    
    return null
  }
}
```

---

#### Retry Logic

```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry authentication errors
      if (error.message.includes('credentials')) {
        throw error
      }
      
      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError!
}

// Usage
const product = await fetchWithRetry(
  () => ssActivewearAPI.getProductByStyle('PC54'),
  3,
  1000
)
```

---

#### Fallback Values

```typescript
async function getProductOrDefault(styleID: string): Promise<SSActivewearProduct> {
  try {
    const product = await ssActivewearAPI.getProductByStyle(styleID)
    return product || createDefaultProduct(styleID)
  } catch (error) {
    console.warn('Failed to fetch product, using default:', error)
    return createDefaultProduct(styleID)
  }
}

function createDefaultProduct(styleID: string): SSActivewearProduct {
  return {
    styleID,
    styleName: 'Unknown Product',
    brandName: 'Unknown',
    categoryName: 'Other',
    colorCount: 0,
    colors: [],
  }
}
```

---

### Status Code Handling

```typescript
async function handleAPIResponse(response: Response) {
  if (response.ok) {
    return await response.json()
  }
  
  // Handle specific status codes
  switch (response.status) {
    case 401:
      throw new APIError('Invalid API credentials', 401)
    case 403:
      throw new APIError('Access forbidden', 403)
    case 404:
      throw new APIError('Resource not found', 404)
    case 429:
      throw new APIError('Rate limit exceeded. Please try again later.', 429)
    case 500:
      throw new APIError('Server error. Please try again.', 500)
    case 503:
      throw new APIError('Service unavailable. Please try again later.', 503)
    default:
      throw new APIError(`Request failed with status ${response.status}`, response.status)
  }
}
```

---

## Rate Limiting & Best Practices

### Rate Limiting

**S&S Activewear**: 
- Limit: ~1000 requests/hour
- Recommended: 1 request per second max
- Use caching for repeated lookups

**SanMar**:
- Limit: Varies by account tier
- Recommended: 1 request per second max
- Implement request queuing for bulk operations

---

### Request Debouncing

```typescript
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Usage in search
function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 500)
  
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      searchProducts(debouncedQuery)
    }
  }, [debouncedQuery])
  
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search products..."
    />
  )
}
```

---

### Caching Strategy

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class APICache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  
  set(key: string, data: T, expiresIn: number = 300000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    })
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear() {
    this.cache.clear()
  }
}

// Usage
const productCache = new APICache<SSActivewearProduct>()

async function getCachedProduct(styleID: string): Promise<SSActivewearProduct | null> {
  // Check cache first
  const cached = productCache.get(styleID)
  if (cached) {
    console.log('Cache hit:', styleID)
    return cached
  }
  
  // Fetch from API
  const product = await ssActivewearAPI.getProductByStyle(styleID)
  
  if (product) {
    // Cache for 5 minutes
    productCache.set(styleID, product, 300000)
  }
  
  return product
}
```

---

### Batch Operations

```typescript
async function fetchMultipleProducts(
  styleIDs: string[],
  batchSize: number = 5,
  delayMs: number = 1000
): Promise<SSActivewearProduct[]> {
  const results: SSActivewearProduct[] = []
  
  // Process in batches
  for (let i = 0; i < styleIDs.length; i += batchSize) {
    const batch = styleIDs.slice(i, i + batchSize)
    
    // Fetch batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(id => ssActivewearAPI.getProductByStyle(id))
    )
    
    // Extract successful results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value)
      } else {
        console.warn(`Failed to fetch ${batch[index]}:`, result.reason)
      }
    })
    
    // Delay between batches (except last batch)
    if (i + batchSize < styleIDs.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return results
}

// Usage
const products = await fetchMultipleProducts(
  ['PC54', 'G185', 'PC61', '5000', 'G500'],
  2,  // 2 at a time
  1000  // 1 second between batches
)
```

---

## Code Examples

### Complete Product Search Component

```typescript
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ssActivewearAPI, type SSActivewearProduct } from '@/lib/ssactivewear-api'
import { useDebounce } from '@/hooks/use-debounce'

export function ProductSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SSActivewearProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      searchProducts()
    } else {
      setResults([])
    }
  }, [debouncedQuery])
  
  const searchProducts = async () => {
    if (!ssActivewearAPI.hasCredentials()) {
      toast.error('API not configured', {
        description: 'Configure S&S Activewear credentials in Settings'
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const products = await ssActivewearAPI.searchProducts(debouncedQuery)
      setResults(products)
      
      if (products.length === 0) {
        toast.info('No products found', {
          description: `No results for "${debouncedQuery}"`
        })
      }
    } catch (error) {
      toast.error('Search failed', {
        description: error.message
      })
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="pl-10"
        />
        <MagnifyingGlass className="absolute left-3 top-3 text-muted-foreground" size={18} />
      </div>
      
      {isLoading && <div>Loading...</div>}
      
      <div className="grid gap-4">
        {results.map((product) => (
          <Card key={product.styleID} className="p-4">
            <div className="flex items-center gap-4">
              {product.styleImage && (
                <img 
                  src={product.styleImage} 
                  alt={product.styleName}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{product.styleName}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.brandName} • {product.categoryName}
                </p>
                <p className="text-xs text-muted-foreground">
                  SKU: {product.styleID} • {product.colorCount} colors
                </p>
              </div>
              <Button size="sm">Add to Quote</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

### Complete Quote Management Example

```typescript
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { generateId, calculateQuoteTotals } from '@/lib/data'
import { createQuoteApprovalEmail } from '@/lib/email-notifications'
import type { Quote, Customer, EmailNotification } from '@/lib/types'

export function useQuoteManager() {
  const [quotes, setQuotes] = useKV<Quote[]>('quotes', [])
  const [emailNotifications, setEmailNotifications] = useKV<EmailNotification[]>('email-notifications', [])
  
  const createQuote = (customer: Customer): Quote => {
    const newQuote: Quote = {
      id: generateId('q'),
      quote_number: `Q-${Date.now().toString().slice(-8)}`,
      customer,
      line_items: [],
      subtotal: 0,
      discount: 0,
      discount_type: 'percent',
      tax_rate: 0,
      tax_amount: 0,
      total: 0,
      status: 'draft',
      created_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
    
    setQuotes((current) => [...current, newQuote])
    toast.success('Quote created')
    
    return newQuote
  }
  
  const updateQuote = (quote: Quote) => {
    const calculated = calculateQuoteTotals(quote)
    
    setQuotes((current) =>
      current.map(q => q.id === quote.id ? calculated : q)
    )
  }
  
  const sendQuoteToCustomer = (quote: Quote) => {
    // Update quote status
    setQuotes((current) =>
      current.map(q => 
        q.id === quote.id ? { ...q, status: 'sent' as const } : q
      )
    )
    
    // Send email notification
    if (quote.customer.email && quote.customer.emailPreferences?.quoteApprovalRequests !== false) {
      const notification = createQuoteApprovalEmail(quote, 'System')
      setEmailNotifications((current) => [...current, notification])
      toast.success(`Quote sent to ${quote.customer.email}`)
    } else {
      toast.warning('Email not sent - customer preferences disabled')
    }
  }
  
  const approveQuote = (quoteId: string) => {
    setQuotes((current) =>
      current.map(q =>
        q.id === quoteId ? { ...q, status: 'approved' as const } : q
      )
    )
    toast.success('Quote approved')
  }
  
  const deleteQuote = (quoteId: string) => {
    setQuotes((current) => current.filter(q => q.id !== quoteId))
    toast.success('Quote deleted')
  }
  
  return {
    quotes,
    createQuote,
    updateQuote,
    sendQuoteToCustomer,
    approveQuote,
    deleteQuote,
  }
}
```

---

### Purchase Order Integration Example

```typescript
import { useKV } from '@github/spark/hooks'
import { generateId } from '@/lib/data'
import type { PurchaseOrder, Quote, Job } from '@/lib/types'

export function usePurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useKV<PurchaseOrder[]>('purchase-orders', [])
  const [quotes] = useKV<Quote[]>('quotes', [])
  const [jobs] = useKV<Job[]>('jobs', [])
  
  const createPurchaseOrder = (
    selectedQuoteIds: string[],
    supplier: 'ssactivewear' | 'sanmar'
  ): PurchaseOrder => {
    // Get selected quotes
    const selectedQuotes = quotes.filter(q => selectedQuoteIds.includes(q.id))
    
    // Consolidate products by style/color/size
    const consolidatedItems = new Map<string, any>()
    
    selectedQuotes.forEach(quote => {
      quote.line_items.forEach(item => {
        const key = `${item.product_sku}-${item.color}`
        
        if (!consolidatedItems.has(key)) {
          consolidatedItems.set(key, {
            productSku: item.product_sku,
            productName: item.product_name,
            color: item.color,
            sizes: {},
            unitPrice: item.unit_price,
            associatedOrders: [],
          })
        }
        
        const consolidated = consolidatedItems.get(key)
        
        // Add sizes
        Object.entries(item.sizes).forEach(([size, qty]) => {
          consolidated.sizes[size] = (consolidated.sizes[size] || 0) + qty
        })
        
        // Track which quote needs this product
        consolidated.associatedOrders.push({
          quoteId: quote.id,
          customerId: quote.customer.id,
          customerName: quote.customer.name,
          sizes: item.sizes,
        })
      })
    })
    
    const lineItems = Array.from(consolidatedItems.values())
    
    // Calculate total
    const subtotal = lineItems.reduce((sum, item) => {
      const qty = Object.values(item.sizes).reduce((a: number, b: number) => a + b, 0)
      return sum + (qty * item.unitPrice)
    }, 0)
    
    const shipping = 25.00
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax
    
    const newPO: PurchaseOrder = {
      id: generateId('po'),
      poNumber: `PO-${Date.now().toString().slice(-8)}`,
      supplier,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      lineItems,
      associatedOrders: lineItems.flatMap(item => item.associatedOrders),
      shipping,
      tax,
      total,
      receivingHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setPurchaseOrders((current) => [...current, newPO])
    
    return newPO
  }
  
  const receiveInventory = (
    poId: string,
    receivedItems: { productSku: string; color: string; sizes: Record<string, number> }[]
  ) => {
    setPurchaseOrders((current) =>
      current.map(po => {
        if (po.id !== poId) return po
        
        const receivingRecord = {
          id: generateId('recv'),
          receivedDate: new Date().toISOString(),
          receivedBy: 'Warehouse Team',
          items: receivedItems,
        }
        
        const receivingHistory = [...po.receivingHistory, receivingRecord]
        
        // Check if fully received
        const allReceived = po.lineItems.every(lineItem => {
          const received = receivingHistory.flatMap(r => r.items).filter(
            item => item.productSku === lineItem.productSku && item.color === lineItem.color
          )
          
          const totalReceived = received.reduce((sum, item) => {
            return sum + Object.values(item.sizes).reduce((a: number, b: number) => a + b, 0)
          }, 0)
          
          const totalOrdered = Object.values(lineItem.sizes).reduce((a: number, b: number) => a + b, 0)
          
          return totalReceived >= totalOrdered
        })
        
        return {
          ...po,
          receivingHistory,
          status: allReceived ? 'received' as const : 'partially-received' as const,
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }
  
  return {
    purchaseOrders,
    createPurchaseOrder,
    receiveInventory,
  }
}
```

---

## API Testing

### Testing Supplier API Credentials

```typescript
async function testSSActivewearConnection(credentials: SSActivewearCredentials): Promise<boolean> {
  try {
    // Set credentials temporarily
    ssActivewearAPI.setCredentials(credentials)
    
    // Try to fetch a common product
    const product = await ssActivewearAPI.getProductByStyle('5000')
    
    if (product) {
      toast.success('Connection successful!', {
        description: `Connected to S&S Activewear API`
      })
      return true
    } else {
      toast.error('Connection failed', {
        description: 'No response from API'
      })
      return false
    }
  } catch (error) {
    if (error.message === 'Invalid API credentials') {
      toast.error('Invalid credentials', {
        description: 'Please check your Account Number and API Key'
      })
    } else {
      toast.error('Connection failed', {
        description: error.message
      })
    }
    return false
  }
}
```

---

### Mock API for Development

```typescript
// Create mock API for development/testing
const mockSSActivewearAPI = {
  async getProductByStyle(styleID: string): Promise<SSActivewearProduct | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock data
    if (styleID === '5000') {
      return {
        styleID: '5000',
        styleName: 'Gildan Heavy Cotton™ T-Shirt',
        brandName: 'Gildan',
        categoryName: 'T-Shirts',
        colorCount: 50,
        colors: [
          {
            colorID: 1,
            colorName: 'White',
            colorCode: 'WHT',
            sizes: [
              { sizeID: 1, sizeName: 'S', qty: 1000, price: 2.54 },
              { sizeID: 2, sizeName: 'M', qty: 1500, price: 2.54 },
              { sizeID: 3, sizeName: 'L', qty: 1200, price: 2.54 },
              { sizeID: 4, sizeName: 'XL', qty: 800, price: 2.54 },
            ],
          },
        ],
        styleImage: 'https://via.placeholder.com/300',
      }
    }
    
    return null
  },
  
  async searchProducts(query: string): Promise<SSActivewearProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return []
  },
  
  hasCredentials(): boolean {
    return true
  },
  
  setCredentials(credentials: SSActivewearCredentials): void {
    // No-op for mock
  },
}

// Use mock in development
const isDevelopment = import.meta.env.DEV
const activeAPI = isDevelopment ? mockSSActivewearAPI : ssActivewearAPI
```

---

## Appendix

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Check API credentials |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded, retry later |
| 500 | Internal Server Error | Server error, retry |
| 503 | Service Unavailable | Service down, retry later |

---

### Useful Resources

**S&S Activewear**:
- API Documentation: https://api.ssactivewear.com/V2/Default.aspx
- Account Dashboard: https://www.ssactivewear.com/

**SanMar**:
- API Documentation: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary
- API Portal: https://www.sanmar.com/

**Twilio**:
- SMS API Docs: https://www.twilio.com/docs/sms
- Console: https://console.twilio.com/

**Spark Runtime**:
- Documentation: Internal Spark runtime docs

---

## Webhook Integration & Analytics

### Overview

The webhook system enables real-time inventory updates from suppliers (S&S Activewear, SanMar) and provides comprehensive analytics for monitoring reliability and performance.

### Webhook Event Types

```typescript
type WebhookEventType = 
  | 'inventory.updated'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'inventory.restocked'
  | 'product.updated'
  | 'product.discontinued'
  | 'pricing.updated'
```

### Webhook Configuration

**Location**: Settings → Webhooks tab

**Storage**: Webhook configs stored in Spark KV at key `webhook-configs`

```typescript
interface WebhookConfig {
  id: string
  name: string
  source: 'ssactivewear' | 'sanmar' | 'manual'
  isActive: boolean
  endpointUrl?: string
  secret?: string
  events: WebhookEventType[]
  createdAt: string
  updatedAt: string
  lastTriggeredAt?: string
}
```

### Webhook Events

**Storage**: Events stored in Spark KV at key `webhook-events`

```typescript
interface WebhookEvent {
  id: string
  source: 'ssactivewear' | 'sanmar' | 'manual'
  eventType: WebhookEventType
  payload: WebhookPayload
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  receivedAt: string
  processedAt?: string
  retryCount: number
  error?: string
}
```

### Analytics Metrics

The webhook analytics dashboard tracks:

**Overall Metrics**:
- Total webhook events received
- Success rate (%)
- Average response time (ms)
- Failed events count
- Retrying events count

**Per-Supplier Metrics**:
- Event volume by supplier
- Success rate by supplier
- Average response time by supplier
- Uptime percentage
- Recent failures (24h window)
- Last event timestamp

**Event Type Breakdown**:
- Distribution of event types
- Volume by event category
- Success rate by event type

### Using the Analytics Dashboard

**Access**: Navigate to Settings → Webhooks → Analytics tab

**Features**:
1. **Time Range Filter**: Last Hour, 24 Hours, 7 Days, 30 Days, All Time
2. **Supplier Filter**: Filter by specific supplier or view all
3. **Real-time Metrics**: Auto-updates as new events are processed
4. **Reliability Badges**: Excellent (≥99%), Good (≥95%), Fair (≥90%), Poor (<90%)

### Sample Data Generation

For testing and demonstration purposes, the dashboard includes a "Generate Sample Data" button that creates realistic webhook events with:
- 100-150 events for S&S Activewear (98% success rate)
- 80-120 events for SanMar (96% success rate)
- 5-15 manual events (100% success rate)
- Realistic response times (150-1200ms)
- Distributed across various event types

```typescript
import { generateRealisticWebhookScenario } from '@/lib/sample-webhook-data'

// Generate sample events
const sampleEvents = generateRealisticWebhookScenario()
// Returns ~200 events across all suppliers
```

### Webhook Processing

Events are processed asynchronously with automatic retry logic:

```typescript
import { webhookProcessor } from '@/lib/webhook-processor'

// Process event
const result = await webhookProcessor.processWebhookEvent(
  event,
  onNotification,  // Callback for notifications
  onAlert          // Callback for alerts
)

// Returns: { success: boolean, notifications: [], alerts: [] }
```

### Inventory Alerts

Webhook processing generates inventory alerts for:
- Low stock warnings (quantity < threshold)
- Out of stock alerts (quantity = 0)
- Restocked notifications
- Product discontinuations
- Price changes

**Storage**: Alerts stored in Spark KV at key `inventory-alerts`

```typescript
interface InventoryAlert {
  id: string
  sku: string
  styleName: string
  colorName: string
  sizeName: string
  alertType: 'low_stock' | 'out_of_stock' | 'restocked'
  currentQuantity: number
  threshold?: number
  supplier: 'ssactivewear' | 'sanmar' | 'manual'
  affectedQuotes?: string[]
  affectedJobs?: string[]
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
}
```

### Best Practices

1. **Monitor Success Rates**: Keep supplier success rates above 95%
2. **Set Up Alerts**: Configure notifications for critical inventory changes
3. **Review Analytics Weekly**: Check the Analytics tab for trends and issues
4. **Test Webhooks**: Use the "Test Webhook" feature to verify connectivity
5. **Retry Failed Events**: Use the retry button on failed events to reprocess

### Code Examples

**Create Webhook Config**:

```typescript
import { useKV } from '@github/spark/hooks'
import { generateId } from '@/lib/data'

const [webhookConfigs, setWebhookConfigs] = useKV<WebhookConfig[]>('webhook-configs', [])

const createWebhookConfig = () => {
  const newConfig: WebhookConfig = {
    id: generateId('wh'),
    name: 'S&S Inventory Updates',
    source: 'ssactivewear',
    isActive: true,
    events: ['inventory.updated', 'inventory.low_stock', 'inventory.out_of_stock'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  setWebhookConfigs((current) => [...current, newConfig])
}
```

**Query Analytics Data**:

```typescript
import { useKV } from '@github/spark/hooks'

const [webhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])

// Calculate success rate for last 24 hours
const last24Hours = webhookEvents.filter(event => {
  const eventTime = new Date(event.receivedAt).getTime()
  return eventTime >= Date.now() - (24 * 60 * 60 * 1000)
})

const successful = last24Hours.filter(e => e.status === 'completed').length
const successRate = (successful / last24Hours.length) * 100

console.log(`Success rate (24h): ${successRate.toFixed(1)}%`)
```

**Handle Inventory Alerts**:

```typescript
import { useKV } from '@github/spark/hooks'

const [inventoryAlerts, setInventoryAlerts] = useKV<InventoryAlert[]>('inventory-alerts', [])

// Get unacknowledged low stock alerts
const lowStockAlerts = inventoryAlerts.filter(
  alert => alert.alertType === 'low_stock' && !alert.acknowledgedAt
)

// Acknowledge an alert
const acknowledgeAlert = (alertId: string) => {
  setInventoryAlerts((current) =>
    current.map(alert =>
      alert.id === alertId
        ? { ...alert, acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'System' }
        : alert
    )
  )
}
```

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained By**: Mint Prints Development Team
**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained By**: Mint Prints Development Team
