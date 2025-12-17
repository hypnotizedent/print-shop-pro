# Library Directory (`/src/lib`)

This directory contains utility libraries, type definitions, data generators, and helper functions used throughout the application.

---

## Directory Contents

### Core Files

#### `types.ts`
**Purpose**: Central TypeScript type definitions for the entire application.

**Key Types**:
- `Quote` - Quote entity with line items, customer info, pricing
- `Job` - Job entity with production tracking, artwork, expenses
- `Customer` - Customer entity with contact info, preferences
- `Product` - Product catalog items
- `EmailNotification` - Email tracking and templates
- `PurchaseOrder` - Inventory purchase orders
- `Webhook` - Webhook events and processing

**Usage**:
```typescript
import type { Quote, Job, Customer } from '@/lib/types'
```

#### `constants.ts`
**Purpose**: Application-wide constants and configuration values.

**Key Constants**:
- `KV_KEYS` - Centralized KV store keys
- `QUOTE_STATUSES`, `JOB_STATUSES` - Status enumerations
- `DECORATION_METHODS`, `DECORATION_LOCATIONS` - Decoration options
- `VALIDATION` - Validation rules and regex patterns
- `DEFAULTS` - Default values for entities

**Usage**:
```typescript
import { KV_KEYS, QUOTE_STATUSES } from '@/lib/constants'

const [quotes] = useKV(KV_KEYS.QUOTES, [])
```

#### `utils.ts`
**Purpose**: General utility functions, primarily for styling.

**Key Functions**:
- `cn()` - Class name merger using clsx and tailwind-merge

**Usage**:
```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', condition && 'conditional-class')} />
```

---

## Data & Samples

#### `data.ts`
**Purpose**: Sample data generators and mock data for development.

**Key Functions**:
- `createEmptyQuote(customer?: Customer)` - Creates a new quote template
- `generateQuoteNumber()` - Generates sequential quote numbers
- `generateJobNumber()` - Generates sequential job numbers
- `generateId(prefix: string)` - Generates unique IDs
- `calculateQuoteTotals(quote: Quote)` - Calculates quote pricing
- `calculateLineItemTotal(item: LineItem)` - Calculates line item total

**Sample Data**:
- `sampleCustomers` - Mock customer data
- `sampleQuotes` - Mock quote data
- `sampleJobs` - Mock job data
- `sampleEmailTemplates` - Email template library
- `sampleEmailNotifications` - Email history

**Usage**:
```typescript
import { createEmptyQuote, generateId, sampleCustomers } from '@/lib/data'

const newQuote = createEmptyQuote(sampleCustomers[0])
const customerId = generateId('c')
```

#### `sample-purchase-orders.ts`
**Purpose**: Generate sample purchase order data.

**Key Functions**:
- `generateSamplePurchaseOrders()` - Creates mock PO data for development

#### `sample-webhook-data.ts`
**Purpose**: Generate sample webhook event data.

**Key Functions**:
- Mock webhook events for testing integrations

---

## Email System

#### `email-notifications.ts`
**Purpose**: Email notification generation and templating.

**Key Functions**:
- `createQuoteApprovalEmail(quote, sentBy)` - Quote approval request email
- `createQuoteApprovedEmail(quote, sentBy)` - Quote approved confirmation
- `createInvoiceEmail(quote, sentBy)` - Invoice email generation
- `createCustomEmail(to, subject, message, sentBy)` - Custom email

**Usage**:
```typescript
import { createQuoteApprovalEmail } from '@/lib/email-notifications'

const email = createQuoteApprovalEmail(quote, 'John Doe')
addEmailNotification(email)
```

#### `email-preferences.ts`
**Purpose**: Default email preference configurations.

**Key Exports**:
- `defaultEmailPreferences` - Default settings for new customers

#### `artwork-email.ts`
**Purpose**: Artwork-related email notifications.

**Key Functions**:
- Artwork approval request emails
- Artwork status update notifications

#### `invoice-email.ts`
**Purpose**: Invoice email generation and formatting.

---

## Pricing & Rules

#### `pricing-rules.ts`
**Purpose**: Customer pricing rule management and application.

**Key Functions**:
- `applyPricingRules(customer, items)` - Apply customer-specific pricing
- `calculateTierDiscount(tier)` - Calculate tier-based discounts
- `evaluatePricingRule(rule, context)` - Evaluate pricing rule conditions

**Usage**:
```typescript
import { applyPricingRules } from '@/lib/pricing-rules'

const adjustedPrice = applyPricingRules(customer, lineItems)
```

#### `decoration-templates.ts`
**Purpose**: Decoration template management utilities.

**Key Functions**:
- Template creation and validation
- Template application to line items

---

## Export Utilities

#### `csv-export.ts`
**Purpose**: CSV export functionality for data.

**Key Functions**:
- `exportQuotesToCSV(quotes)` - Export quotes as CSV
- `exportJobsToCSV(jobs)` - Export jobs as CSV
- `exportCustomersToCSV(customers)` - Export customers as CSV

**Usage**:
```typescript
import { exportQuotesToCSV } from '@/lib/csv-export'

exportQuotesToCSV(quotes)
```

#### `invoice-generator.ts`
**Purpose**: Invoice document generation (PDF/print).

**Key Functions**:
- `generateInvoicePDF(quote)` - Create printable invoice
- `formatInvoiceData(quote)` - Format quote data for invoice

#### `batch-invoice-export.ts`
**Purpose**: Batch invoice generation for multiple quotes.

---

## Service Integrations

#### `ssactivewear-api.ts`
**Purpose**: S&S Activewear API client.

**Key Features**:
- Product catalog search
- Inventory lookups
- Pricing retrieval
- Color and style queries

**Usage**:
```typescript
import { ssActivewearAPI } from '@/lib/ssactivewear-api'

const products = await ssActivewearAPI.searchProducts('t-shirt')
const colors = await ssActivewearAPI.getProductColors('12345')
```

**Configuration**:
```typescript
const credentials = {
  accountNumber: 'YOUR_ACCOUNT',
  apiKey: 'YOUR_KEY'
}
ssActivewearAPI.setCredentials(credentials)
```

#### `sanmar-api.ts`
**Purpose**: SanMar API client.

**Key Features**:
- Product catalog integration
- Inventory status
- Pricing and availability

**Usage**:
```typescript
import { sanMarAPI } from '@/lib/sanmar-api'

const products = await sanMarAPI.searchProducts('polo')
const inventory = await sanMarAPI.checkInventory('SKU123')
```

#### `twilio-sms.ts`
**Purpose**: SMS notification service via Twilio.

**Key Functions**:
- `sendSMS(to, message)` - Send SMS notification
- Template-based SMS for common notifications

---

## Webhook System

#### `webhook-processor.ts`
**Purpose**: Process incoming webhook events from suppliers.

**Key Functions**:
- `processWebhookEvent(event)` - Handle webhook event
- `validateWebhookSignature(payload, signature)` - Verify webhook authenticity
- Event routing and processing

**Usage**:
```typescript
import { processWebhookEvent } from '@/lib/webhook-processor'

await processWebhookEvent({
  type: 'inventory.update',
  payload: { ... }
})
```

#### `webhook-types.ts`
**Purpose**: TypeScript types for webhook system.

**Key Types**:
- `WebhookEvent` - Event structure
- `WebhookPayload` - Payload formats
- `WebhookConfig` - Configuration types

---

## Best Practices

### Using Types
```typescript
// ✅ GOOD - Import types with 'type' keyword
import type { Quote, Customer } from '@/lib/types'

// ❌ AVOID - Importing types as values
import { Quote } from '@/lib/types'
```

### Using Constants
```typescript
// ✅ GOOD - Use constants instead of magic strings
import { KV_KEYS, QUOTE_STATUSES } from '@/lib/constants'

const [quotes] = useKV(KV_KEYS.QUOTES, [])
if (quote.status === QUOTE_STATUSES.APPROVED) { ... }

// ❌ AVOID - Magic strings
const [quotes] = useKV('quotes', [])
if (quote.status === 'approved') { ... }
```

### Data Generators
```typescript
// ✅ GOOD - Use generators for consistent data creation
import { createEmptyQuote, generateId } from '@/lib/data'

const newQuote = createEmptyQuote(customer)
const newId = generateId('q')

// ❌ AVOID - Manual object creation
const newQuote = {
  id: `q-${Date.now()}`,
  customer: customer,
  // ... missing fields
}
```

### Calculations
```typescript
// ✅ GOOD - Use centralized calculation functions
import { calculateQuoteTotals } from '@/lib/data'

const updatedQuote = calculateQuoteTotals(quote)

// ❌ AVOID - Duplicating calculation logic
const total = quote.line_items.reduce((sum, item) => 
  sum + (item.unit_price * item.quantity), 0
) + quote.decoration_cost - quote.discount
```

---

## Extending the Library

### Adding New Constants
1. Add to `constants.ts` in the appropriate section
2. Export as `const` assertion for type safety
3. Document in this README

### Adding New Types
1. Add to `types.ts` with JSDoc comments
2. Export with clear naming
3. Consider breaking into separate files if types.ts grows too large

### Adding New Utilities
1. Add to appropriate file or create new file
2. Write JSDoc comments with examples
3. Export from file
4. Document in this README

### Adding New Service Integrations
1. Create new file (e.g., `new-service-api.ts`)
2. Follow existing API client patterns
3. Include error handling
4. Store credentials in KV store
5. Document API usage

---

## Future Improvements

### Planned Refactors
1. **Split types.ts** - Break into domain-specific type files
   - `types/quote.ts`
   - `types/job.ts`
   - `types/customer.ts`
   - etc.

2. **Create services directory** - Move API clients
   - `services/suppliers/ssactivewear.ts`
   - `services/suppliers/sanmar.ts`
   - `services/email/notifications.ts`

3. **Organize data utilities** - Create data subdirectory
   - `data/generators.ts`
   - `data/samples.ts`
   - `data/calculations.ts`

4. **Add validation layer** - Zod schemas for runtime validation
   - `validators/quote.ts`
   - `validators/customer.ts`

---

## Related Documentation
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Overall architecture
- [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md) - External API guides
- [COMPONENT_MAP.md](../../COMPONENT_MAP.md) - Component organization
