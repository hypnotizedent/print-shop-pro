# Printavo to Mint Prints Data Transformer

## Overview

This transformer enables seamless data migration from Printavo API v2 to Mint Prints. It maps all Printavo fields to their corresponding Mint Prints equivalents, ensuring no data is lost during migration.

## Features

- **Complete Field Mapping**: All Printavo API v2 fields are mapped to Mint Prints data structures
- **Automatic Type Detection**: Auto-detects whether to import data as Quotes or Jobs
- **Customer Deduplication**: Prevents duplicate customer records by email
- **Validation**: Validates imported data before saving
- **Error Handling**: Provides detailed error messages for troubleshooting
- **Batch Import**: Import multiple records at once
- **ID Preservation**: Option to preserve original Printavo IDs for syncing

## Usage

### Via UI (Recommended)

1. Navigate to **Settings** page
2. Scroll to **Data Import** section
3. Click **Import from Printavo** button
4. Choose import type (Auto-detect, Quotes Only, or Jobs Only)
5. Either:
   - Upload a JSON file exported from Printavo API
   - Paste JSON data directly into the text area
6. Click **Import Data**
7. Review the import results

### Via Code

```typescript
import { 
  transformQuote, 
  transformJob,
  validateQuote,
  type PrintavoQuote 
} from '@/lib/printavo-transformer'

// Transform a single Printavo quote
const printavoQuote: PrintavoQuote = { /* ... */ }
const mintQuote = transformQuote(printavoQuote)

// Validate the transformed data
const validation = validateQuote(mintQuote)
if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
}
```

## Printavo Field Mappings

### Customer / Contact Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `id` | `id` | Preserved if `preserveId: true` |
| `primaryContact.fullName` or `companyName` | `name` | Uses contact name or company name |
| `primaryContact.email` | `email` | Required field |
| `primaryContact.phone` | `phone` | Optional |
| `companyName` | `company` | Optional |
| `billingAddress` | `address` | Mapped to single address object |
| `taxExempt` | `taxExempt` | Boolean |
| `resaleNumber` | `taxCertificateId` | Generated if resale number exists |
| `orderCount` | `tier` | Auto-calculated: 50+ = platinum, 25+ = gold, 10+ = silver, else bronze |

### Quote Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `visualId` | `quote_number` | Quote identifier |
| `nickname` | `nickname` | Optional quote nickname |
| `status.name` | `status` | Mapped: draft, sent, approved, rejected, expired |
| `contact` / `customer` | `customer` | Transformed customer object |
| `lineItems` | `line_items` | Array of transformed line items |
| `subtotal` | `subtotal` | Includes setup fees |
| `discountAmount` or `discount` | `discount` | Supports fixed and percent |
| `discountAsPercentage` | `discount_type` | 'percent' or 'fixed' |
| `salesTax` | `tax_rate` | Tax percentage |
| `salesTaxAmount` | `tax_amount` | Calculated tax |
| `total` | `total` | Final total |
| `customerNote` | `notes_customer` | Customer-facing notes |
| `productionNote` | `notes_internal` | Internal production notes |
| `dueAt` or `customerDueAt` | `due_date` | Due date |
| `timestamps.createdAt` | `created_at` | Creation timestamp |
| `transactions` (type: payment) | `payments` | Array of payment records |

### Job / Invoice Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `visualId` | `job_number` | Job identifier |
| `nickname` | `nickname` | Optional job nickname |
| `status.name` or task types | `status` | Mapped to job statuses |
| `lineItems` | `line_items` | Transformed line items |
| `dueAt` | `due_date` | Production due date |
| `productionNote` | `production_notes` | Production instructions |
| `approvalRequests` | `artwork_approved` | True if all approved |
| `tasks` | `assigned_to`, `progress` | Task assignees and completion |
| `expenses` | `expenses` | Array of job expenses |

### Line Item Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `id` | `id` | Preserved if `preserveId: true` |
| `styleNumber` or `itemNumber` | `product_sku` | Product SKU |
| `styleDescription` | `product_name` | Product name |
| `color` | `product_color` | Color name/hex |
| `category` | `product_type` | Detected from description |
| `personalizations` | `decorations` | Array of decoration objects |
| `personalizations[].location` | `print_locations` | Decoration locations |
| `personalizations[].colors` | `colors` | Number of ink colors |
| `sizes` | `sizes` | Size breakdown object |
| `items` | `quantity` | Total quantity |
| `price` or `unitCost` | `unit_price` | Per-unit price |

### Decoration Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `personalizations[].location` | `location` | e.g., 'front', 'back', 'sleeve' |
| `personalizations[].description` | `method` | Detected: screen-print, embroidery, etc. |
| `personalizations[].colors` | `inkThreadColors` | Number of colors |
| Size extracted from description | `imprintSize` | e.g., "12" x 14"" |

### Payment / Transaction Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `id` | `id` | Preserved if `preserveId: true` |
| `amount` | `amount` | Payment amount |
| `method` | `method` | Mapped: cash, check, venmo, zelle, paypal, bank-transfer, other |
| `reference` | `reference` | Transaction reference |
| `notes` | `notes` | Payment notes |
| `processedAt` | `receivedDate` | Payment date |

### Expense Mapping

| Printavo Field | Mint Prints Field | Notes |
|---------------|-------------------|-------|
| `id` | `id` | Preserved if `preserveId: true` |
| `amount` | `amount` | Expense amount |
| `description` | `description` | Expense description |
| `category` | `category` | Mapped: materials, labor, shipping, outsourcing, supplies, other |
| `vendor` | `vendor` | Vendor name |

## Status Mappings

### Quote Status

| Printavo Status | Mint Prints Status |
|----------------|-------------------|
| draft, pending | draft |
| sent | sent |
| approved, accepted | approved |
| rejected, declined | rejected |
| expired | expired |
| cancelled | rejected |

### Job Status

| Printavo Status | Mint Prints Status |
|----------------|-------------------|
| pending | pending |
| awaiting artwork, art approval | art-approval |
| scheduled | scheduled |
| printing, in production | printing |
| finishing | finishing |
| ready, ready for pickup | ready |
| shipped | shipped |
| delivered, completed | delivered |

### Product Types

| Printavo Description Contains | Mint Prints Type |
|-------------------------------|-----------------|
| t-shirt, tshirt, tee | tshirt |
| hoodie, sweatshirt | hoodie |
| polo | polo |
| hat, cap, beanie | hat |
| (other) | other |

### Decoration Methods

| Printavo Description Contains | Mint Prints Method |
|-------------------------------|-------------------|
| screen print, screenprint | screen-print |
| dtg, direct to garment | dtg |
| embroidery | embroidery |
| vinyl, heat transfer | vinyl |
| digital print | digital-print |
| digital transfer | digital-transfer |

## Size Mappings

| Printavo Size | Mint Prints Size |
|--------------|-----------------|
| xs, extra small | XS |
| s, small | S |
| m, medium | M |
| l, large | L |
| xl, extra large | XL |
| 2xl, xxl | 2XL |
| 3xl, xxxl | 3XL |

## Getting Printavo Data

### Using Printavo GraphQL API v2

```graphql
query GetQuotes {
  orders(first: 100, statusIds: ["1", "2", "3"]) {
    nodes {
      ... on Quote {
        id
        visualId
        nickname
        contact {
          id
          fullName
          email
          phone
          address {
            companyName
            address1
            address2
            city
            stateIso
            zipCode
          }
        }
        customerNote
        productionNote
        tags
        status { id name }
        subtotal
        total
        salesTax
        salesTaxAmount
        discountAmount
        amountPaid
        amountOutstanding
        dueAt
        timestamps {
          createdAt
          updatedAt
        }
        lineItems {
          id
          styleDescription
          styleNumber
          color
          category
          items
          price
          sizes
          personalizations {
            location
            description
            colors
          }
        }
        fees {
          id
          name
          amount
          description
        }
        transactions {
          id
          amount
          type
          method
          reference
          processedAt
        }
      }
    }
  }
}
```

### Using Printavo REST API

Export your data from Printavo's dashboard or use their API to retrieve orders in JSON format.

## Sample Data Format

See the sample JSON file that can be downloaded from the import dialog for a complete example.

```json
{
  "id": "sample_123",
  "visualId": "Q-2025-001",
  "nickname": "Sample T-Shirt Order",
  "contact": {
    "id": "contact_123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  },
  "lineItems": [
    {
      "id": "li_1",
      "styleDescription": "Gildan 5000 T-Shirt",
      "styleNumber": "G5000",
      "color": "Black",
      "items": 100,
      "price": 5,
      "sizes": { "s": 20, "m": 40, "l": 30, "xl": 10 },
      "personalizations": [
        {
          "location": "front",
          "description": "Screen Print - 3 colors",
          "colors": 3
        }
      ]
    }
  ],
  "fees": [
    {
      "id": "fee_1",
      "name": "Setup Fee",
      "amount": 50
    }
  ]
}
```

## Validation

The transformer validates imported data to ensure:

- Customer has a valid email address
- At least one line item exists
- Total is not negative
- Required fields are present

Validation warnings are displayed during import but don't block the import process.

## Error Handling

Common errors and solutions:

### JSON Parsing Error
- **Cause**: Invalid JSON format
- **Solution**: Ensure the JSON is properly formatted (use a JSON validator)

### Missing Required Fields
- **Cause**: Printavo data missing customer email or line items
- **Solution**: Verify the export includes all necessary fields

### Validation Warnings
- **Cause**: Data doesn't meet all quality checks
- **Solution**: Review warnings and manually correct data after import if needed

## Advanced Usage

### Preserving Printavo IDs

Enable "Preserve original Printavo IDs" option when you plan to sync data between systems:

```typescript
const quote = transformQuote(printavoQuote, { preserveId: true })
// quote.id will be the same as printavoQuote.id
```

### Batch Processing

```typescript
import { transformQuotes, transformJobs } from '@/lib/printavo-transformer'

const printavoQuotes: PrintavoQuote[] = [/* ... */]
const mintQuotes = transformQuotes(printavoQuotes, { preserveId: false })
```

### Custom Field Mapping

The transformer is extensible. You can modify the mapping constants in `printavo-transformer.ts`:

```typescript
const STATUS_MAP: Record<string, QuoteStatus> = {
  'draft': 'draft',
  'custom-status': 'draft', // Add your custom mappings
  // ...
}
```

## Troubleshooting

### Data Not Appearing After Import

1. Check browser console for errors
2. Verify the import result shows successful import count
3. Refresh the page to reload data from KV store
4. Check that you're on the correct tab (Quotes vs Jobs)

### Customer Duplicates

Customers are deduplicated by email address. If you see duplicates:

1. Ensure Printavo data has consistent email addresses
2. Clean up duplicates manually after import
3. Use the "preserve IDs" option for better tracking

### Missing Decorations

If decorations don't import:

1. Verify Printavo data has `personalizations` array
2. Check that personalization descriptions contain method keywords
3. Manually add decorations after import if needed

## API Reference

See [printavo-transformer.ts](../src/lib/printavo-transformer.ts) for complete API documentation.

### Main Functions

- `transformCustomer(printavoData, options?)`: Transform customer/contact
- `transformQuote(printavoQuote, options?)`: Transform quote
- `transformJob(printavoInvoice, quoteId?, options?)`: Transform invoice to job
- `transformLineItem(printavoLineItem, options?)`: Transform line item
- `transformPayment(printavoTransaction, quoteId, options?)`: Transform payment
- `transformExpense(printavoExpense, jobId, options?)`: Transform expense
- `validateQuote(quote)`: Validate transformed quote
- `validateJob(job)`: Validate transformed job

### Batch Functions

- `transformQuotes(printavoQuotes[], options?)`: Batch transform quotes
- `transformJobs(printavoInvoices[], options?)`: Batch transform jobs

## Resources

- [Printavo API v2 Documentation](https://www.printavo.com/docs/api/v2)
- [Printavo GraphQL API](https://www.printavo.com/docs/api/v2/operation/query/)
- [Printavo Invoice Object](https://www.printavo.com/docs/api/v2/object/invoice/)
- [Printavo Customer Object](https://www.printavo.com/docs/api/v2/query/customer/)

## Support

For issues or questions:

1. Review this documentation
2. Check the [Troubleshooting](#troubleshooting) section
3. Examine the browser console for detailed error messages
4. Review the validation warnings in the import results

## License

Same as Mint Prints main application.
