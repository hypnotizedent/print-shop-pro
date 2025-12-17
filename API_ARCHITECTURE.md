# API Architecture Overview
## Visual Guide to Mint Prints APIs

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mint Prints Dashboard                    │
│                         (React Frontend)                         │
└────────────┬─────────────────────────────────────┬──────────────┘
             │                                      │
             │                                      │
    ┌────────▼────────┐                   ┌────────▼────────┐
    │  Supplier APIs  │                   │  Spark Runtime  │
    │   (External)    │                   │   (Built-in)    │
    └────────┬────────┘                   └────────┬────────┘
             │                                      │
    ┌────────┴────────┐              ┌─────────────┴─────────────┐
    │                 │              │                           │
┌───▼────┐      ┌────▼────┐    ┌────▼────┐  ┌──────────┐  ┌────▼────┐
│  S&S   │      │ SanMar  │    │ KV Store│  │ LLM API  │  │ User API│
│Activew.│      │   API   │    │ (Data)  │  │  (AI)    │  │ (GitHub)│
└────────┘      └─────────┘    └─────────┘  └──────────┘  └─────────┘
```

---

## Data Flow Diagram

### Quote Creation with Product Search

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Search "Gildan Hoodie"
     ▼
┌─────────────────┐
│ QuoteBuilder    │
│ Component       │
└────┬────────────┘
     │ 2. Call API
     ▼
┌─────────────────┐
│ ssActivewearAPI │
│ Client          │
└────┬────────────┘
     │ 3. HTTP GET /v2/products/?search=Gildan+Hoodie
     │    Authorization: Basic [credentials]
     ▼
┌─────────────────┐
│ S&S Activewear  │
│ API Server      │
└────┬────────────┘
     │ 4. Return Product[]
     ▼
┌─────────────────┐
│ QuoteBuilder    │
│ (Display)       │
└────┬────────────┘
     │ 5. User selects product
     │ 6. Add to quote
     ▼
┌─────────────────┐
│ setQuotes()     │
│ (Spark KV)      │
└────┬────────────┘
     │ 7. Save to persistent storage
     ▼
┌─────────────────┐
│ Spark KV Store  │
│ (Encrypted)     │
└─────────────────┘
```

---

## Authentication Flow

### S&S Activewear / SanMar

```
┌──────────────┐
│ User enters  │
│ credentials  │
│ in Settings  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ useKV hook           │
│ Key: "ssactivewear-  │
│       credentials"   │
└──────┬───────────────┘
       │
       │ Store encrypted
       ▼
┌──────────────────────┐
│ Spark KV Store       │
└──────┬───────────────┘
       │
       │ App.tsx useEffect
       ▼
┌──────────────────────┐
│ ssActivewearAPI      │
│ .setCredentials()    │
└──────┬───────────────┘
       │
       │ On API request
       ▼
┌──────────────────────┐
│ getAuthHeader()      │
│ Base64 encode        │
│ account:apiKey       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ HTTP Request         │
│ Header:              │
│ Authorization:       │
│   Basic abc123...    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ External API         │
│ Validates & responds │
└──────────────────────┘
```

---

## Persistent Data Architecture

### Spark KV Store Structure

```
Spark KV Store (Client-Side Encrypted Storage)
│
├── quotes: Quote[]
│   ├── id: "q-01234567"
│   ├── customer: Customer
│   ├── line_items: LineItem[]
│   └── status: QuoteStatus
│
├── jobs: Job[]
│   ├── id: "j-01234567"
│   ├── quote_id: "q-01234567"
│   └── status: JobStatus
│
├── customers: Customer[]
│   ├── id: "c-01234567"
│   ├── tier: CustomerTier
│   └── emailPreferences: {...}
│
├── customer-artwork-files: CustomerArtworkFile[]
│   ├── id: "caf-01234567"
│   ├── customerId: "c-01234567"
│   └── versionHistory: [...]
│
├── purchase-orders: PurchaseOrder[]
│   ├── id: "po-01234567"
│   ├── supplier: "ssactivewear" | "sanmar"
│   └── associatedOrders: [...]
│
├── email-notifications: EmailNotification[]
├── email-templates: EmailTemplate[]
├── payment-reminders: PaymentReminder[]
├── customer-decoration-templates: CustomerDecorationTemplate[]
├── filter-presets: FilterPreset[]
├── recent-searches: RecentSearch[]
├── favorite-products: FavoriteProduct[]
├── product-templates: ProductTemplate[]
├── customer-pricing-rules: CustomerPricingRule[]
├── quote-templates: QuoteTemplate[]
├── tax-certificates: TaxCertificate[]
│
└── API Credentials (Encrypted)
    ├── ssactivewear-credentials: { accountNumber, apiKey }
    ├── sanmar-credentials: { customerId, apiKey }
    └── twilio-credentials: { accountSid, authToken, fromPhoneNumber }
```

---

## API Request Lifecycle

### Example: Fetch Product by SKU

```
1. User Input
   ┌─────────────────────┐
   │ Input: "PC54"       │
   └──────────┬──────────┘
              │
2. Component │
   ┌──────────▼──────────┐
   │ ProductSearch       │
   │ .searchBySKU()      │
   └──────────┬──────────┘
              │
3. API Client│
   ┌──────────▼──────────────────────┐
   │ ssActivewearAPI                 │
   │ .getProductByStyle("PC54")      │
   └──────────┬──────────────────────┘
              │
4. Check Cache
   ┌──────────▼──────────┐
   │ productCache.get()  │
   └──────────┬──────────┘
              │
              ├─── Hit ──┐
              │          │
              └─ Miss    │
                 │       │
5. HTTP Request  │       │
   ┌─────────────▼──────────────────┐
   │ fetch(                         │
   │   "api.ssactivewear.com/..."   │
   │   headers: {                   │
   │     Authorization: Basic ...   │
   │   }                            │
   │ )                              │
   └─────────────┬──────────────────┘
                 │                  │
6. Response      │                  │
   ┌─────────────▼────────┐         │
   │ Status: 200          │         │
   │ Body: Product JSON   │         │
   └─────────────┬────────┘         │
                 │                  │
7. Transform     │                  │
   ┌─────────────▼────────┐         │
   │ Parse & validate     │         │
   │ SSActivewearProduct  │         │
   └─────────────┬────────┘         │
                 │                  │
8. Cache         │                  │
   ┌─────────────▼────────┐         │
   │ productCache.set()   │         │
   │ TTL: 5 minutes       │         │
   └─────────────┬────────┘         │
                 │                  │
                 └──────────────────┘
                          │
9. Return                 │
   ┌──────────────────────▼──────────┐
   │ return product                  │
   └──────────────────────┬──────────┘
                          │
10. Display               │
   ┌──────────────────────▼──────────┐
   │ ProductSearch component         │
   │ Shows: Name, Brand, Colors, $   │
   └─────────────────────────────────┘
```

---

## Error Handling Flow

```
API Request
    │
    ▼
┌────────────┐
│ try {      │
│   fetch()  │
│ }          │
└────┬───────┘
     │
     ├─── Success (200) ──────────┐
     │                            │
     └─── Error ───┐              │
                   │              │
            ┌──────▼────────┐     │
            │ Status Code?  │     │
            └──────┬────────┘     │
                   │              │
        ┌──────────┼──────────┐   │
        │          │          │   │
    ┌───▼───┐  ┌──▼───┐  ┌──▼───▼┐
    │  401  │  │ 429  │  │ Other│
    │ Auth  │  │ Rate │  │Error │
    │ Error │  │Limit │  │      │
    └───┬───┘  └──┬───┘  └──┬───┘
        │         │         │
        │         │         │
    ┌───▼─────────▼─────────▼───┐
    │ catch (error) {            │
    │   if (error.message ===    │
    │       'Invalid creds')     │
    │     toast.error(...)       │
    │   else if (...)            │
    │     ...                    │
    │ }                          │
    └────────────┬───────────────┘
                 │
                 ▼
           ┌─────────────┐
           │ User sees   │
           │ error toast │
           └─────────────┘
```

---

## Quote to Purchase Order Flow

```
Multiple Approved Quotes
    │
    ▼
┌───────────────────┐
│ User navigates to │
│ Settings → POs    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Select supplier:  │
│ - S&S Activewear  │
│ - SanMar          │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Select quotes to  │
│ consolidate       │
│ ☑ Quote 1         │
│ ☑ Quote 2         │
│ ☐ Quote 3         │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────┐
│ System consolidates:      │
│                           │
│ Quote 1: PC54/Red/L (25)  │
│ Quote 2: PC54/Red/L (50)  │
│ ─────────────────────────│
│ PO Line: PC54/Red/L (75)  │
│                           │
│ Tracks:                   │
│ - 25 for Customer A       │
│ - 50 for Customer B       │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────┐
│ Create PO         │
│ - Add shipping    │
│ - Add tax         │
│ - Add tracking #  │
│ - Save as draft   │
│   or ordered      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Save to KV:       │
│ purchase-orders   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ When inventory    │
│ arrives...        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────┐
│ Receiving:                │
│                           │
│ PC54/Red/L: Received 75   │
│                           │
│ Assign to orders:         │
│ ☑ 25 → Quote 1 (Cust A)   │
│ ☑ 50 → Quote 2 (Cust B)   │
│                           │
│ Team knows which shirts   │
│ go to which customer!     │
└───────────────────────────┘
```

---

## Email Notification Flow

```
Event Trigger
(Quote status → sent)
    │
    ▼
┌─────────────────────────┐
│ Check customer          │
│ emailPreferences        │
└──────┬──────────────────┘
       │
       ├─── Disabled ────► Skip email
       │
       └─── Enabled
              │
              ▼
┌─────────────────────────┐
│ Get email template      │
│ Type: quote-approval    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Replace variables:      │
│ {customer_name} →       │
│   "John Doe"            │
│ {quote_number} →        │
│   "Q-12345678"          │
│ {total_amount} →        │
│   "$1,234.56"           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Create notification     │
│ record                  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Add to KV:              │
│ email-notifications     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Display in UI:          │
│ "Email sent to          │
│  john@example.com"      │
└─────────────────────────┘
```

---

## Component → API → Storage Pattern

```
┌────────────────────────────────────────┐
│           React Component              │
│                                        │
│  import { useKV } from '@github/spark' │
│  import { ssActivewearAPI } from '...' │
│                                        │
│  function ProductSearch() {            │
│    const [favs, setFavs] =            │
│      useKV('favorites', [])          │
│                                        │
│    const search = async (query) => {   │
│      const products =                  │
│        await ssActivewearAPI           │
│          .searchProducts(query)        │
│                                        │
│      return products                   │
│    }                                   │
│                                        │
│    const addFavorite = (product) => {  │
│      setFavs(current =>               │
│        [...current, product])          │
│    }                                   │
│  }                                     │
└──┬─────────────────────────────────┬───┘
   │                                 │
   │ API call                        │ KV store
   │                                 │
   ▼                                 ▼
┌─────────────┐              ┌──────────────┐
│ External    │              │ Spark KV     │
│ API         │              │ Store        │
│ (S&S/SanMar)│              │ (Encrypted)  │
└─────────────┘              └──────────────┘
```

---

## Rate Limiting Strategy

```
User types in search
    │
    ▼
┌─────────────────┐
│ useDebounce()   │
│ Delay: 500ms    │
└────────┬────────┘
         │
         │ After 500ms of no typing
         ▼
┌─────────────────┐
│ Check cache     │
└────────┬────────┘
         │
         ├─── Cache hit ──► Return cached
         │
         └─── Cache miss
                │
                ▼
         ┌──────────────┐
         │ Rate limit   │
         │ check        │
         └──────┬───────┘
                │
                ├─── < 1 req/sec ──► Proceed
                │
                └─── > 1 req/sec
                       │
                       ▼
                ┌──────────────┐
                │ Queue request│
                │ Delay 1 sec  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Make API call│
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Cache result │
                │ TTL: 5 min   │
                └──────────────┘
```

---

## Summary

### Key Takeaways

1. **Three External APIs**: S&S Activewear, SanMar, Twilio (optional)
2. **Three Spark APIs**: KV Store, LLM, User
3. **All Credentials Encrypted**: Stored securely in Spark KV
4. **Persistent Data**: Everything saved to Spark KV Store
5. **Error Handling**: Graceful fallbacks with user feedback
6. **Rate Limiting**: Caching + debouncing to stay within limits
7. **Type Safety**: TypeScript for all API interactions

### Best Practices

- ✅ Always use `useKV` with functional updates
- ✅ Cache frequently accessed data
- ✅ Debounce user input before API calls
- ✅ Handle errors with user-friendly messages
- ✅ Test API connections before use
- ✅ Check customer preferences before sending emails/SMS
- ✅ Keep credentials secure (never log or expose)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained By**: Mint Prints Development Team
